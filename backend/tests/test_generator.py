"""
Unit tests for services/generator.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from services.generator import (
    optimize_resume_content, _optimize_bullet_point, format_phone_number,
    format_linkedin_url, _generate_suggestions
)


# ── Bullet point optimization ─────────────────────────────────────────────────

def test_weak_verb_replaced():
    result = _optimize_bullet_point("worked on backend API development")
    assert result.startswith("Developed"), f"Expected 'Developed', got: {result}"


def test_filler_words_removed():
    result = _optimize_bullet_point("Basically just implemented the feature")
    assert "basically" not in result.lower()
    assert "just" not in result.lower()


def test_bullet_starts_with_capital():
    result = _optimize_bullet_point("built a microservice for payments")
    assert result[0].isupper()


def test_trailing_period_removed():
    result = _optimize_bullet_point("Developed a REST API.")
    assert not result.endswith(".")


def test_handled_replaced():
    result = _optimize_bullet_point("handled the database migrations")
    assert result.lower().startswith("managed")


# ── Phone formatting ──────────────────────────────────────────────────────────

def test_indian_10digit_formatted():
    result = format_phone_number("9876543210")
    assert result == "+91 98765 43210"


def test_indian_with_country_code():
    result = format_phone_number("919876543210")
    assert result == "+91 98765 43210"


def test_us_10digit_formatted():
    result = format_phone_number("4155551234")
    assert result == "(415) 555-1234"


def test_us_with_country_code():
    result = format_phone_number("14155551234")
    assert result == "+1 (415) 555-1234"


def test_unrecognized_number_returned_as_is():
    result = format_phone_number("12345")
    assert result == "12345"


# ── LinkedIn URL formatting ───────────────────────────────────────────────────

def test_linkedin_https_stripped():
    result = format_linkedin_url("https://www.linkedin.com/in/johndoe")
    assert not result.startswith("http")
    assert "linkedin.com/in/johndoe" in result


def test_linkedin_bare_username_expanded():
    result = format_linkedin_url("johndoe")
    assert result == "linkedin.com/in/johndoe"


# ── Suggestions ───────────────────────────────────────────────────────────────

def test_suggestions_categorized():
    data = {
        "experience": [{"responsibilities": ["I worked on the project"]}],
        "skills": {"technical": ["Python"], "tools": [], "soft": []},
        "target": {},
        "projects": [],
        "personal": {}
    }
    result = _generate_suggestions(data)
    assert "critical" in result
    assert "tips" in result
    assert isinstance(result["critical"], list)
    assert isinstance(result["tips"], list)


def test_no_target_role_is_critical():
    data = {
        "experience": [], "skills": {"technical": ["Python"] * 8, "tools": [], "soft": ["Comm"] * 3},
        "target": {}, "projects": [{"title": "P1"}, {"title": "P2"}],
        "personal": {"linkedIn": "linkedin.com/in/x"}
    }
    result = _generate_suggestions(data)
    critical_text = " ".join(result["critical"])
    assert "target job role" in critical_text.lower()


def test_no_suggestions_for_perfect_resume():
    data = {
        "experience": [{"responsibilities": ["Developed 5 microservices reducing latency by 30%"]}],
        "skills": {"technical": ["Python"] * 8, "tools": ["Docker"], "soft": ["Communication", "Team", "Problem"]},
        "target": {"jobRole": "Software Engineer"},
        "projects": [{"title": "P1"}, {"title": "P2"}],
        "personal": {"linkedIn": "linkedin.com/in/x"}
    }
    result = _generate_suggestions(data)
    assert len(result["critical"]) == 0
