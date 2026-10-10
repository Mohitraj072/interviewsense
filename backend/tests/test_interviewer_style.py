"""Unit tests for interviewer style validation and fallback."""

from utils import validate_interviewer_style, ALLOWED_INTERVIEWER_STYLES


def test_allowed_styles_are_preserved():
    for style in ["Friendly coach", "Standard", "Tough", "Rapid-fire"]:
        assert validate_interviewer_style(style) == style


def test_allowed_styles_set():
    assert ALLOWED_INTERVIEWER_STYLES == {
        "Friendly coach",
        "Standard",
        "Tough",
        "Rapid-fire",
    }


def test_invalid_style_falls_back_to_standard():
    invalid_cases = [
        "Aggressive",
        "friendly coach",  # case-sensitive
        "rapid-fire",
        "tough",
        "Random Style",
        "",
        "   ",
        None,
        123,
        {},
        [],
    ]
    for case in invalid_cases:
        assert validate_interviewer_style(case) == "Standard"
