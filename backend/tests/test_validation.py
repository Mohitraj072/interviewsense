"""Unit tests for input sanitization and character length caps."""

from utils import (
    sanitize_job_description,
    sanitize_resume_text,
    sanitize_demo_answer,
)


def test_sanitize_job_description_within_limit():
    jd = "Seeking a Software Engineer with Python and React experience."
    result = sanitize_job_description(jd)
    assert result == jd


def test_sanitize_job_description_truncates_over_limit():
    long_jd = "A" * 5000
    result = sanitize_job_description(long_jd)
    assert len(result) == 4000
    assert result == "A" * 4000


def test_sanitize_job_description_strips_whitespace():
    jd = "   \n\tSenior Backend Engineer\t\n   "
    assert sanitize_job_description(jd) == "Senior Backend Engineer"


def test_sanitize_job_description_none_or_empty():
    assert sanitize_job_description(None) == ""
    assert sanitize_job_description("") == ""
    assert sanitize_job_description("    ") == ""


def test_sanitize_resume_text_within_limit():
    resume = "Experience: 3 years building cloud microservices."
    assert sanitize_resume_text(resume) == resume


def test_sanitize_resume_text_truncates_over_limit():
    long_resume = "R" * 8000
    result = sanitize_resume_text(long_resume)
    assert len(result) == 6000
    assert result == "R" * 6000


def test_sanitize_resume_text_none_or_empty():
    assert sanitize_resume_text(None) == ""
    assert sanitize_resume_text("") == ""
    assert sanitize_resume_text("  \n  ") == ""


def test_sanitize_demo_answer_within_limit():
    ans = "We used Redis cache to reduce database latency by 40%."
    assert sanitize_demo_answer(ans) == ans


def test_sanitize_demo_answer_truncates_over_600_limit():
    long_ans = "X" * 1000
    result = sanitize_demo_answer(long_ans)
    assert len(result) == 600
    assert result == "X" * 600


def test_sanitize_demo_answer_strips_whitespace():
    ans = "   \nQuick explanation\n   "
    assert sanitize_demo_answer(ans) == "Quick explanation"


def test_sanitize_demo_answer_none_or_empty():
    assert sanitize_demo_answer(None) == ""
    assert sanitize_demo_answer("") == ""
    assert sanitize_demo_answer("   ") == ""
