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

        return jsonify({
            "reportId": f"report_{session_id}",
            "sessionId": session_id,
            "report": report_data,
            "status": "success",
        })

    except Exception as e:
        print(f"Report generation error: {e}, computing dynamic answer-based evaluation.")
        from routes.interview import evaluate_answer_helper

        per_question = []
        scores = []
        for i, pair in enumerate(qa_pairs):
            q_text = pair.get("question", f"Question {i+1}")
            a_text = pair.get("answer", "")
            if pair.get("skipped"):
                a_text = ""
            wpm = pair.get("wpm")
            filler_count = pair.get("fillerCount")
            eval_result = evaluate_answer_helper(q_text, a_text, domain, difficulty, wpm=wpm, filler_count=filler_count)
            score = eval_result["score"]
            scores.append(score)
            q_item = {
                "question_number": i + 1,
                "question": q_text,
                "answer": a_text or "(Candidate skipped this question)",
                "score": score,
                "feedback": eval_result["feedback"],
                "ideal_answer": eval_result["ideal_answer"],
                "strengths": eval_result["strengths"],
                "improvements": eval_result["improvements"],
            }
            if wpm is not None:
                q_item["wpm"] = wpm
                q_item["wordCount"] = pair.get("wordCount")
                q_item["durationSec"] = pair.get("durationSec")
                q_item["fillerCount"] = filler_count
                q_item["fillerBreakdown"] = pair.get("fillerBreakdown")
            per_question.append(q_item)

        avg_score = round(sum(scores) / max(len(scores), 1)) if scores else 65
        verdict = (
            "Exceptional" if avg_score >= 85 else
            "Strong" if avg_score >= 70 else
            "Average" if avg_score >= 50 else
            "Needs Work"
        )

        fallback_report = {
            "overall_score": avg_score,
            "overall_verdict": verdict,
            "summary": f"Demonstrated {verdict.lower()} competence across {domain} concepts with meaningful strengths and targeted growth areas under {difficulty} conditions.",
            "skill_radar": {
                "technical_accuracy": max(35, min(95, avg_score + 2)),
                "communication": max(40, min(95, avg_score - 2)),
                "problem_solving": max(35, min(95, avg_score + 1)),
                "depth_of_knowledge": max(30, min(95, avg_score - 4)),
                "confidence": max(45, min(95, avg_score + 3)),
            },
            "per_question": per_question,
            "top_strengths": [
                f"Demonstrated working knowledge in {domain}",
                "Structured approach to problem explanations",
                "Committed effort across the interview session",
            ],
            "top_improvements": [
                "Delve into edge cases, scalability, and performance bottlenecks",
                "Practice elaborating on real-world system trade-offs",
                "Refine technical conciseness and pacing",
            ],
            "studyPlan": [
                {"day": "Day 1-2", "topic": f"{domain} Core Theory", "task": f"Review foundational definitions and memory models for {domain}."},
                {"day": "Day 3-4", "topic": f"{domain} Applied Problems", "task": "Practice 5 hands-on architectural and coding scenarios."},
                {"day": "Day 5-7", "topic": "Mock Interview Mastery", "task": "Conduct timed mock sessions focusing on articulate delivery."}
            ],
            "filler_word_count": data.get("fillerCount", 0),
            "confidence_rating": "High" if avg_score >= 75 else "Medium" if avg_score >= 50 else "Low",
            "recommended_resources": [
                {"topic": domain, "type": "Course", "suggestion": f"Advanced {domain} Masterclass"},
                {"topic": "System Design", "type": "Book", "suggestion": "Designing Data-Intensive Applications"},
            ],
            "next_steps": f"Review question feedback above and focus practice on {domain} topics with lower scores.",
        }

        return jsonify({
            "reportId": f"report_{session_id}",
            "sessionId": session_id,
            "report": fallback_report,
            "status": "fallback",
            "note": str(e)
        })


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

