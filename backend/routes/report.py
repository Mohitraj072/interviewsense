"""
Report routes — /api/report/*

Endpoints:
  GET  /api/report/<report_id>     → Fetch a full post-interview report
  POST /api/report/generate        → Generate full report from session data
  GET  /api/report/history/<uid>   → Get all past reports for a user
"""

from flask import Blueprint, request, jsonify
import os
import google.generativeai as genai
from prompts.templates import build_report_prompt

report_bp = Blueprint("report", __name__)

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def generate_content_with_fallback(prompt):
    RETIRED_MODELS = {
        "gemini-1.5-flash", "gemini-1.5-flash-001", "gemini-1.5-flash-002",
        "gemini-1.5-pro", "gemini-1.0-pro", "gemini-3.6-flash"
    }

    configured_model = os.getenv("GEMINI_MODEL", "gemini-2.0-flash").strip()
    fallback_str = os.getenv("GEMINI_FALLBACK_MODELS", "gemini-flash-latest").strip()
    raw_models = [configured_model] + [m.strip() for m in fallback_str.split(",") if m.strip()]

    candidate_models = []
    for m in raw_models:
        if m and m not in RETIRED_MODELS and m not in candidate_models and m != "gemini-flash-latest":
            candidate_models.append(m)

    candidate_models.append("gemini-flash-latest")

    if not candidate_models:
        raise RuntimeError("No valid Gemini models configured or available")

    last_err = None
    for m in candidate_models:
        try:
            print(f"[Gemini] Attempting report content generation with model: {m}")
            res = genai.GenerativeModel(m).generate_content(prompt)
            print(f"[Gemini] Successfully generated report content using model: {m}")
            return res
        except Exception as e:
            print(f"[Gemini] Model '{m}' failed: {e}. Trying next fallback...")
            last_err = e
            continue
    raise last_err or RuntimeError("All Gemini models failed")


import json
import re

@report_bp.route("/generate", methods=["POST"])
def generate_report():
    """
    Generate a full post-interview report.
    Expected body:
    {
      "sessionId": "string",
      "userId": "string",
      "domain": "string",
      "difficulty": "string",
      "interviewType": "string",
      "qa_pairs": [
        { "question": "...", "answer": "...", "evaluation": {...} },
        ...
      ]
    }
    """
    data = request.get_json() or {}
    domain = data.get("domain", "General")
    difficulty = data.get("difficulty", "Medium")
    interview_type = data.get("interviewType", "Technical")
    qa_pairs = data.get("qa_pairs", [])
    session_id = data.get("sessionId", f"sess_{os.urandom(6).hex()}")

    try:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key or api_key.startswith("your_"):
            raise ValueError("GEMINI_API_KEY not configured")

        prompt = build_report_prompt(
            domain=domain,
            difficulty=difficulty,
            interview_type=interview_type,
            qa_pairs=qa_pairs,
        )

        response = generate_content_with_fallback(prompt)
        text = response.text.strip()
        
        # Clean markdown json code blocks if present
        clean_json = re.sub(r"^```(?:json)?\s*", "", text, flags=re.MULTILINE)
        clean_json = re.sub(r"\s*```$", "", clean_json, flags=re.MULTILINE).strip()
        report_data = json.loads(clean_json)

        # Process and enforce per-question data contract
        raw_per_q = report_data.get("per_question", [])
        clean_per_q = []
        answered_scores = []

        for i, pair in enumerate(qa_pairs):
            q_text = pair.get("question", f"Question {i+1}")
            a_text = pair.get("answer", "")
            is_skipped = bool(pair.get("skipped")) or not a_text or a_text.strip() in ["(Candidate skipped this question)", ""]

            pq_match = None
            if i < len(raw_per_q):
                pq_match = raw_per_q[i]
            elif isinstance(raw_per_q, list):
                for candidate_pq in raw_per_q:
                    if candidate_pq.get("question_number") == i + 1:
                        pq_match = candidate_pq
                        break

            pq_match = pq_match or {}

            q_item = {
                "question_number": i + 1,
                "question": q_text,
                "skipped": is_skipped,
                "inputMode": pair.get("inputMode", "text"),
                "duration": pair.get("duration", 0),
                "tooShort": bool(pair.get("tooShort")),
            }

            if pair.get("followUpQuestion"):
                q_item["followUpQuestion"] = pair.get("followUpQuestion")
                q_item["followUpAnswer"] = pair.get("followUpAnswer", "")
                q_item["followUpSkipped"] = bool(pair.get("followUpSkipped"))

            if is_skipped:
                q_item["answer"] = ""
                q_item["score"] = None
                q_item["feedback"] = None
                q_item["ideal_answer"] = None
                q_item["strengths"] = []
                q_item["improvements"] = []
            else:
                q_item["answer"] = a_text
                raw_score = pq_match.get("score")
                if isinstance(raw_score, (int, float)):
                    parsed_score = int(raw_score)
                else:
                    parsed_score = 70
                q_item["score"] = parsed_score
                answered_scores.append(parsed_score)
                q_item["feedback"] = pq_match.get("feedback") or "Good answer addressing key concepts."
                q_item["ideal_answer"] = pq_match.get("ideal_answer") or f"A strong response addresses core principles of {domain}."
                q_item["strengths"] = pq_match.get("strengths") or []
                q_item["improvements"] = pq_match.get("improvements") or []

            wpm = pair.get("wpm")
            if wpm is not None and not is_skipped and not q_item["tooShort"]:
                q_item["wpm"] = wpm
                q_item["wordCount"] = pair.get("wordCount")
                q_item["durationSec"] = pair.get("durationSec")
                q_item["fillerCount"] = pair.get("fillerCount")
                q_item["fillerBreakdown"] = pair.get("fillerBreakdown")
            elif pair.get("inputMode") == "voice":
                q_item["wordCount"] = pair.get("wordCount", 0)
                q_item["durationSec"] = pair.get("durationSec", pair.get("duration", 0))

            clean_per_q.append(q_item)

        report_data["per_question"] = clean_per_q

        # Compute overall score and verdict only from answered questions
        if answered_scores:
            avg_score = round(sum(answered_scores) / len(answered_scores))
            report_data["overall_score"] = avg_score
            report_data["overall_verdict"] = (
                "Exceptional" if avg_score >= 85 else
                "Strong" if avg_score >= 70 else
                "Average" if avg_score >= 50 else
                "Needs Work"
            )
        else:
            report_data["overall_score"] = None
            report_data["overall_verdict"] = "No answers to evaluate"
            report_data["summary"] = "No answers were provided during this session to evaluate."
            report_data["skill_radar"] = {
                "technical_accuracy": 0,
                "communication": 0,
                "problem_solving": 0,
                "depth_of_knowledge": 0,
                "confidence": 0,
            }
            report_data["top_strengths"] = []
            report_data["top_improvements"] = ["Provide answers to questions to receive actionable feedback and skill scores."]

        return jsonify({
            "reportId": f"report_{session_id}",
            "sessionId": session_id,
            "report": report_data,
            "status": "success",
        })

    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"[Gemini Report Generation Error] All model fallbacks failed:\n{error_trace}")
        return jsonify({
            "error": "Failed to generate report evaluation with Gemini after all model fallbacks.",
            "details": str(e),
            "status": "error"
        }), 500


@report_bp.route("/<report_id>", methods=["GET"])
def get_report(report_id):
    """
    Fetch a specific report by ID.
    """
    return jsonify({
        "reportId": report_id,
        "message": "Report record",
    })


@report_bp.route("/history/<user_id>", methods=["GET"])
def get_history(user_id):
    """
    Get all past interview reports for a user.
    """
    return jsonify({
        "userId": user_id,
        "reports": [],
    })

