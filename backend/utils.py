"""
Utility functions and pure business logic helpers for InterviewSense.
Covers input validation, capping, interviewer style validation,
speaking pace/filler metrics, and score aggregation.
"""

import re
from typing import Dict, Any, List, Tuple, Optional

# Allowed Interviewer Styles
ALLOWED_INTERVIEWER_STYLES = {"Friendly coach", "Standard", "Tough", "Rapid-fire"}

# Filler word definitions
DEFINITE_FILLERS = [
    "um", "uh", "you know", "basically", "actually", "literally", "sort of", "kind of", "i mean"
]
POSSIBLE_FILLERS = ["like", "so"]
ALL_FILLERS = DEFINITE_FILLERS + POSSIBLE_FILLERS


def sanitize_job_description(raw_jd: Optional[str], max_length: int = 4000) -> str:
    """Strips and caps job description input string (default: 4000 characters)."""
    if not raw_jd:
        return ""
    return str(raw_jd).strip()[:max_length]


def sanitize_resume_text(raw_resume: Optional[str], max_length: int = 6000) -> str:
    """Strips and caps candidate resume input string (default: 6000 characters)."""
    if not raw_resume:
        return ""
    return str(raw_resume).strip()[:max_length]


def sanitize_demo_answer(raw_answer: Optional[str], max_length: int = 600) -> str:
    """Strips and caps candidate demo answer input string (default: 600 characters)."""
    if not raw_answer:
        return ""
    return str(raw_answer).strip()[:max_length]


def validate_interviewer_style(raw_style: Optional[str]) -> str:
    """
    Validates the interviewer style against allowed presets:
    - 'Friendly coach'
    - 'Standard'
    - 'Tough'
    - 'Rapid-fire'
    Falls back to 'Standard' for any invalid, empty, or unrecognized value.
    """
    if raw_style and str(raw_style).strip() in ALLOWED_INTERVIEWER_STYLES:
        return str(raw_style).strip()
    return "Standard"


def count_fillers(text: str) -> int:
    """Counts total definite and possible filler phrases in speech transcript."""
    if not text:
        return 0
    lower = text.lower()
    total = 0
    for phrase in ALL_FILLERS:
        pattern = r"\b" + re.escape(phrase) + r"\b"
        matches = re.findall(pattern, lower)
        total += len(matches)
    return total


def compute_speaking_analytics(text: str = "", duration_sec: float = 0.0) -> Dict[str, Any]:
    """
    Computes vocal pace (WPM) and filler word analytics from candidate speech.
    Answers under 8 seconds or under 15 words are flagged as tooShort=True without invented numbers.
    """
    clean = (text or "").strip()
    safe_duration = max(0, round(duration_sec))

    if not clean:
        return {
            "tooShort": True,
            "wordCount": 0,
            "durationSec": safe_duration,
            "wpm": None,
            "fillerCount": 0,
            "definiteFillerCount": 0,
            "possibleFillerCount": 0,
            "fillerBreakdown": {},
        }

    words = [w for w in clean.split() if w]
    word_count = len(words)

    # Voice answers too short to measure reliably (<8 seconds or <15 words)
    if safe_duration < 8 or word_count < 15:
        return {
            "tooShort": True,
            "wordCount": word_count,
            "durationSec": safe_duration,
            "wpm": None,
            "fillerCount": 0,
            "definiteFillerCount": 0,
            "possibleFillerCount": 0,
            "fillerBreakdown": {},
        }

    wpm = round((word_count / max(1, safe_duration)) * 60)

    lower = clean.lower()
    filler_breakdown: Dict[str, int] = {}
    definite_count = 0
    possible_count = 0

    for phrase in ALL_FILLERS:
        pattern = r"\b" + re.escape(phrase) + r"\b"
        matches = re.findall(pattern, lower)
        count = len(matches)
        if count > 0:
            filler_breakdown[phrase] = count
            if phrase in POSSIBLE_FILLERS:
                possible_count += count
            else:
                definite_count += count

    total_fillers = definite_count + possible_count

    return {
        "tooShort": False,
        "wordCount": word_count,
        "durationSec": safe_duration,
        "wpm": wpm,
        "fillerCount": total_fillers,
        "definiteFillerCount": definite_count,
        "possibleFillerCount": possible_count,
        "fillerBreakdown": filler_breakdown,
    }


def calculate_overall_score(answered_scores: List[int]) -> Tuple[Optional[int], str]:
    """
    Calculates overall score and verdict strictly from answered questions.
    Skipped questions with None or no score must be excluded.
    Returns (avg_score, verdict).
    """
    valid_scores = [s for s in answered_scores if isinstance(s, (int, float))]
    if not valid_scores:
        return None, "No answers to evaluate"

    avg_score = round(sum(valid_scores) / len(valid_scores))

    if avg_score >= 85:
        verdict = "Exceptional"
    elif avg_score >= 70:
        verdict = "Strong"
    elif avg_score >= 50:
        verdict = "Average"
    else:
        verdict = "Needs Work"

    return avg_score, verdict
