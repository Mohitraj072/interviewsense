"""
Interview routes — /api/interview/*

Endpoints (stubbed — will be wired to Gemini in Step 4):
  POST /api/interview/start        → Generate first question based on config
  POST /api/interview/next         → Evaluate answer + generate next question
  POST /api/interview/end          → Finalize session, return session ID
  POST /api/interview/resume       → Upload resume PDF + generate custom questions
"""

from flask import Blueprint, request, jsonify
import os
import json
import re
import PyPDF2
import google.generativeai as genai
from prompts.templates import (
    build_question_prompt,
    build_evaluation_prompt,
    build_resume_question_prompt,
)

interview_bp = Blueprint("interview", __name__)

# Configure Gemini with fallback model sequence
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
            print(f"[Gemini] Attempting content generation with model: {m}")
            res = genai.GenerativeModel(m).generate_content(prompt)
            print(f"[Gemini] Successfully generated content using model: {m}")
            return res
        except Exception as e:
            print(f"[Gemini] Model '{m}' failed: {e}. Trying next fallback...")
            last_err = e
            continue
    raise last_err or RuntimeError("All Gemini models failed")


@interview_bp.route("/start", methods=["POST"])
def start_interview():
    """
    Start a new interview session.
    Expected body:
    {
      "userId": "string",
      "type": "Technical" | "HR" | "Mixed",
      "difficulty": "Easy" | "Medium" | "Hard",
      "domain": "DSA" | "Web Dev" | "OS" | "DBMS" | "System Design" | ...,
      "targetRole": "string",
      "experienceLevel": "Fresher" | "Junior" | "Mid" | "Senior"
    }
    """
    data = request.get_json()

    required = ["type", "difficulty", "domain"]
    for field in required:
        if field not in data:
            return jsonify({"error": f"Missing field: {field}"}), 400

    try:
        raw_jd = data.get("jobDescription") or data.get("job_description") or ""
        job_description = str(raw_jd).strip()[:4000] if raw_jd else ""

        prompt = build_question_prompt(
            interview_type=data["type"],
            difficulty=data["difficulty"],
            domain=data["domain"],
            target_role=data.get("targetRole", "Software Engineer"),
            experience_level=data.get("experienceLevel", "Mid"),
            question_number=1,
            total_questions=10,
            previous_questions=[],
            job_description=job_description,
        )

        response = generate_content_with_fallback(prompt)
        question_text = response.text.strip()

        return jsonify({
            "sessionId": f"sess_{os.urandom(8).hex()}",
            "questionNumber": 1,
            "totalQuestions": 10,
            "question": question_text,
            "domain": data["domain"],
            "difficulty": data["difficulty"],
            "hasJobDescription": bool(job_description),
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


def evaluate_answer_helper(question, answer, domain="DSA", difficulty="Medium"):
    """
    Evaluates a candidate answer using Gemini, adhering to scoring tiers:
    - Blank or wrong: 20-40
    - Partial: 40-70
    - Good: 70-85
    - Excellent detailed: 85-100
    Returns dict: score, feedback, ideal_answer, strengths, improvements
    """
    ans_clean = (answer or "").strip()
    is_blank = not ans_clean or ans_clean.lower() in [
        "(candidate skipped this question)", "skipped", "skip", "(no response provided / skipped)", ""
    ]

    # Try Gemini evaluation if configured
    api_key = os.getenv("GEMINI_API_KEY")
    if api_key and not api_key.startswith("your_"):
        try:
            eval_prompt = build_evaluation_prompt(
                question=question,
                answer=ans_clean if not is_blank else "(No response provided / Skipped)",
                domain=domain,
                difficulty=difficulty,
            )
            eval_response = generate_content_with_fallback(eval_prompt)
            raw = eval_response.text.strip()
            clean_json = re.sub(r"^```(?:json)?\s*", "", raw, flags=re.MULTILINE)
            clean_json = re.sub(r"\s*```$", "", clean_json, flags=re.MULTILINE).strip()
            parsed = json.loads(clean_json)

            if isinstance(parsed, dict) and "score" in parsed:
                # Ensure score is an integer
                parsed["score"] = int(parsed["score"])
                if is_blank:
                    parsed["score"] = min(parsed["score"], 35)
                # Ensure all required keys exist
                parsed.setdefault("feedback", "Answer was evaluated against key domain concepts.")
                parsed.setdefault("ideal_answer", f"An ideal answer for this {domain} question covers core mechanisms and trade-offs.")
                parsed.setdefault("strengths", ["Attempted problem explanation"])
                parsed.setdefault("improvements", ["Elaborate on edge cases and implementation depth"])
                return parsed
        except Exception as err:
            print(f"Gemini evaluation error: {err}, using heuristic evaluation.")

    # Fallback heuristic evaluation
    if is_blank:
        return {
            "score": 25,
            "feedback": "No answer was provided for this question. In an interview, attempting a high-level approach is always preferable to skipping.",
            "ideal_answer": f"A comprehensive response should explain the foundational concepts of {domain}, step-by-step algorithms, and production performance trade-offs.",
            "strengths": [],
            "improvements": ["Provide an initial conceptual hypothesis even if unsure", "Break down the question into smaller sub-problems"]
        }

    word_count = len(ans_clean.split())
    if word_count < 15:
        score = 38
        feedback = "The answer was very brief and lacked essential technical details and algorithmic depth."
        strengths = ["Identified initial terminology"]
        improvements = ["Elaborate on underlying mechanisms", "Provide concrete examples or time/space complexities"]
    elif word_count < 35:
        score = 58
        feedback = "The response addressed basic concepts but omitted critical edge cases, implementation structure, and system trade-offs."
        strengths = ["Correct general direction and terminology", "Clear communication"]
        improvements = ["Deepen technical rationale with concrete examples", "Discuss edge cases and alternative approaches"]
    elif word_count < 65:
        score = 78
        feedback = "Good response covering the primary concepts with structured communication and solid foundational grasp."
        strengths = ["Well-structured thought process", "Accurate domain concepts explained"]
        improvements = ["Include quantitative trade-offs and production constraints"]
    else:
        score = 88
        feedback = "Excellent, thorough response with detailed technical explanations, clear structural flow, and strong domain mastery."
        strengths = ["Comprehensive coverage of core concepts", "Articulate technical communication", "Strong depth of explanation"]
        improvements = ["Highlight potential edge cases in extreme scale scenarios"]

    return {
        "score": score,
        "feedback": feedback,
        "ideal_answer": f"An expert answer on {domain} thoroughly addresses algorithmic invariants, runtime complexities (Big-O), and architectural failure modes.",
        "strengths": strengths,
        "improvements": improvements,
    }


@interview_bp.route("/evaluate", methods=["POST"])
def evaluate_answer():
    """
    POST /api/interview/evaluate
    Evaluate a single answer against a question.
    """
    data = request.get_json() or {}
    question = data.get("question", "")
    answer = data.get("answer", "")
    domain = data.get("domain", "DSA")
    difficulty = data.get("difficulty", "Medium")

    evaluation = evaluate_answer_helper(question, answer, domain, difficulty)
    return jsonify({"evaluation": evaluation, "status": "success"})


@interview_bp.route("/next", methods=["POST"])
def next_question():
    """
    Evaluate the current answer and return the next question.
    """
    data = request.get_json() or {}

    try:
        # Evaluate the answer
        evaluation = evaluate_answer_helper(
            question=data.get("question", ""),
            answer=data.get("answer", ""),
            domain=data.get("domain", "DSA"),
            difficulty=data.get("difficulty", "Medium"),
        )

        # Generate next question (if not last)
        next_q_number = data.get("questionNumber", 1) + 1
        total = data.get("totalQuestions", 10)

        if next_q_number > total:
            return jsonify({
                "sessionId": data.get("sessionId"),
                "questionNumber": next_q_number,
                "totalQuestions": total,
                "question": None,
                "evaluation": evaluation,
                "isComplete": True,
            })

        next_q_prompt = build_question_prompt(
            interview_type="Technical",
            difficulty=data.get("difficulty", "Medium"),
            domain=data.get("domain", "DSA"),
            target_role="Software Engineer",
            experience_level="Mid",
            question_number=next_q_number,
            total_questions=total,
            previous_questions=data.get("previousQuestions", []),
        )
        next_q_response = generate_content_with_fallback(next_q_prompt)

        return jsonify({
            "sessionId": data.get("sessionId"),
            "questionNumber": next_q_number,
            "totalQuestions": total,
            "question": next_q_response.text.strip(),
            "evaluation": evaluation,
            "isComplete": False,
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@interview_bp.route("/end", methods=["POST"])
def end_interview():
    """
    End the interview session — returns a session summary ID for the report.
    Expected body: { "sessionId": "string", "answers": [...] }
    """
    data = request.get_json() or {}
    return jsonify({
        "message": "Interview session ended",
        "reportId": f"report_{data.get('sessionId', 'unknown')}",
    })


@interview_bp.route("/resume", methods=["POST"])
def resume_upload():
    """
    Accept a PDF or text resume, extract text using PyPDF2, and generate personalized questions
    based on candidate's listed projects, technical skills, work experience, domain, and difficulty.
    Expects multipart/form-data with field 'resume' or 'file', or JSON with 'resumeText'.
    """
    domain = request.form.get("domain") or (request.json.get("domain") if request.is_json else None) or "DSA"
    target_role = request.form.get("targetRole") or (request.json.get("targetRole") if request.is_json else None) or f"{domain} Specialist"
    difficulty = request.form.get("difficulty") or (request.json.get("difficulty", "Medium") if request.is_json else "Medium")
    try:
        count = int(request.form.get("count", 5)) if not request.is_json else int(request.json.get("count", 5))
    except (ValueError, TypeError):
        count = 5
    
    resume_text = ""

    # Check for file upload (support both 'resume' and 'file' field keys)
    uploaded_file = None
    if "resume" in request.files:
        uploaded_file = request.files["resume"]
    elif "file" in request.files:
        uploaded_file = request.files["file"]

    if uploaded_file and uploaded_file.filename:
        filename = (uploaded_file.filename or "").lower()

        if filename.endswith(".pdf"):
            try:
                pdf_reader = PyPDF2.PdfReader(uploaded_file)
                for page in pdf_reader.pages:
                    extracted = page.extract_text()
                    if extracted:
                        resume_text += extracted + "\n"
            except Exception as e:
                print(f"Error parsing PDF with PyPDF2: {e}")
                resume_text = ""
        else:
            try:
                resume_text = uploaded_file.read().decode("utf-8", errors="ignore")
            except Exception as e:
                print(f"Error reading resume text: {e}")
                resume_text = ""
    elif request.is_json and request.json.get("resumeText"):
        resume_text = request.json.get("resumeText", "")

    # Try Gemini generation if API key is active
    try:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key or api_key.startswith("your_"):
            raise ValueError("GEMINI_API_KEY not configured")

        prompt = build_resume_question_prompt(
            resume_text=resume_text if resume_text else f"Candidate applying for {domain} role with 2-4 years relevant engineering experience.",
            domain=domain,
            difficulty=difficulty,
            num_questions=count,
            target_role=target_role,
        )

        response = generate_content_with_fallback(prompt)
        raw_text = response.text.strip()
        clean_json = re.sub(r"^```json\s*", "", raw_text, flags=re.MULTILINE)
        clean_json = re.sub(r"^```\s*", "", clean_json, flags=re.MULTILINE).strip()
        parsed_questions = json.loads(clean_json)

        # Normalize questions to list of strings and list of detailed objects
        question_strings = []
        detailed_list = []
        for item in parsed_questions:
            if isinstance(item, str):
                question_strings.append(item)
                detailed_list.append({
                    "question": item,
                    "category": "Project-Specific",
                    "target_skill": f"{domain} Architecture",
                    "difficulty": difficulty,
                })
            elif isinstance(item, dict) and "question" in item:
                question_strings.append(item["question"])
                detailed_list.append(item)
            else:
                s = str(item)
                question_strings.append(s)
                detailed_list.append({
                    "question": s,
                    "category": "Technical",
                    "target_skill": domain,
                    "difficulty": difficulty,
                })

        return jsonify({
            "status": "success",
            "resumeSnippet": resume_text[:300] if resume_text else "Candidate Profile",
            "domain": domain,
            "targetRole": target_role,
            "difficulty": difficulty,
            "questions": question_strings[:count],
            "detailedQuestions": detailed_list[:count],
            "count": len(question_strings[:count]),
        })

    except Exception as e:
        print(f"Gemini resume question error: {e}")
        # Fallback personalized questions derived from domain, role & resume
        fallback_questions = [
            {
                "question": f"Walk me through the most technically challenging project on your resume in {domain}. What architectural choices and technical trade-offs did you make?",
                "category": "Project-Specific",
                "target_skill": "System Architecture & Decision Making",
                "difficulty": difficulty,
            },
            {
                "question": f"Based on the technical skills and frameworks highlighted on your resume, how do you diagnose and resolve performance bottlenecks or memory leaks in {domain}?",
                "category": "Technical",
                "target_skill": "Performance Optimization & Debugging",
                "difficulty": difficulty,
            },
            {
                "question": f"In your past engineering experience, describe a complex edge case or production bug you uncovered. What was the root cause and how did you prevent regressions?",
                "category": "Work Experience",
                "target_skill": "Production Reliability & Testing",
                "difficulty": difficulty,
            },
            {
                "question": f"How do you approach designing robust and scalable solutions in {domain} at a {difficulty} level when dealing with high throughput and concurrency?",
                "category": "Technical",
                "target_skill": "Scalability & Concurrency",
                "difficulty": difficulty,
            },
            {
                "question": f"Tell me about a time in your past projects where you had to collaborate cross-functionally or advocate for a specific technical architecture over an alternative.",
                "category": "Work Experience",
                "target_skill": "Technical Communication & Leadership",
                "difficulty": difficulty,
            },
            {
                "question": f"Given the technologies listed on your resume, how would you design an end-to-end testing and CI/CD strategy for a mission-critical {domain} service?",
                "category": "Technical",
                "target_skill": "CI/CD & Engineering Best Practices",
                "difficulty": difficulty,
            }
        ][:count]

        return jsonify({
            "status": "fallback",
            "resumeSnippet": resume_text[:300] if resume_text else "Parsed candidate profile",
            "domain": domain,
            "targetRole": target_role,
            "difficulty": difficulty,
            "questions": [q["question"] for q in fallback_questions],
            "detailedQuestions": fallback_questions,
            "count": len(fallback_questions),
            "note": str(e),
        })

