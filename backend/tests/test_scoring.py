"""Unit tests for overall interview score and verdict aggregation."""

from utils import calculate_overall_score


def test_calculate_overall_score_average_and_exceptional():
    scores = [85, 90, 88]
    avg, verdict = calculate_overall_score(scores)
    assert avg == 88
    assert verdict == "Exceptional"


def test_calculate_overall_score_rounds_to_integer():
    # (70 + 75 + 76) / 3 = 73.67 -> rounds to 74
    scores = [70, 75, 76]
    avg, verdict = calculate_overall_score(scores)
    assert avg == 74
    assert verdict == "Strong"


def test_calculate_overall_score_verdict_tiers():
    assert calculate_overall_score([90])[1] == "Exceptional"
    assert calculate_overall_score([85])[1] == "Exceptional"
    assert calculate_overall_score([84])[1] == "Strong"
    assert calculate_overall_score([70])[1] == "Strong"
    assert calculate_overall_score([69])[1] == "Average"
    assert calculate_overall_score([50])[1] == "Average"
    assert calculate_overall_score([49])[1] == "Needs Work"
    assert calculate_overall_score([20])[1] == "Needs Work"


def test_calculate_overall_score_ignores_none_and_non_numbers():
    scores = [80, None, "skipped", 90]
    avg, verdict = calculate_overall_score(scores)
    assert avg == 85
    assert verdict == "Exceptional"


def test_calculate_overall_score_empty_or_all_skipped():
    assert calculate_overall_score([]) == (None, "No answers to evaluate")
    assert calculate_overall_score([None, None]) == (None, "No answers to evaluate")
