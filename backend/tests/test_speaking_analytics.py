"""Unit tests for speaking pace (WPM) and filler word calculations."""

from utils import compute_speaking_analytics, count_fillers


def test_speaking_pace_calculation():
    # 30 words in 15 seconds = (30 / 15) * 60 = 120 WPM
    words = "word " * 30
    analytics = compute_speaking_analytics(words, duration_sec=15.0)

    assert analytics["tooShort"] is False
    assert analytics["wordCount"] == 30
    assert analytics["durationSec"] == 15
    assert analytics["wpm"] == 120


def test_speaking_short_answer_under_8_seconds():
    # 20 words in 5 seconds (< 8s duration threshold)
    words = "word " * 20
    analytics = compute_speaking_analytics(words, duration_sec=5.0)

    assert analytics["tooShort"] is True
    assert analytics["wpm"] is None
    assert analytics["wordCount"] == 20


def test_speaking_short_answer_under_15_words():
    # 10 words in 20 seconds (< 15 words threshold)
    words = "word " * 10
    analytics = compute_speaking_analytics(words, duration_sec=20.0)

    assert analytics["tooShort"] is True
    assert analytics["wpm"] is None
    assert analytics["wordCount"] == 10


def test_speaking_empty_or_whitespace():
    analytics = compute_speaking_analytics("   ", duration_sec=10.0)
    assert analytics["tooShort"] is True
    assert analytics["wordCount"] == 0
    assert analytics["wpm"] is None


def test_filler_word_detection_and_breakdown():
    # Provide >= 15 words and >= 8 seconds so it is analyzed
    transcript = (
        "Um, I think basically we should, uh, use Redis because, you know, "
        "it is fast, like really fast, and so it handles caching."
    )
    analytics = compute_speaking_analytics(transcript, duration_sec=12.0)

    assert analytics["tooShort"] is False
    assert analytics["fillerCount"] >= 5
    assert analytics["definiteFillerCount"] >= 3
    assert "um" in analytics["fillerBreakdown"]
    assert "uh" in analytics["fillerBreakdown"]
    assert "basically" in analytics["fillerBreakdown"]
    assert "you know" in analytics["fillerBreakdown"]


def test_count_fillers_respects_word_boundaries():
    # "umbrella" must not match "um", "somewhere" must not match "so"
    text = "The umbrella was somewhere over there."
    assert count_fillers(text) == 0

    # Exact words must match
    text_with_fillers = "Um, so the umbrella was basically there."
    assert count_fillers(text_with_fillers) == 3
