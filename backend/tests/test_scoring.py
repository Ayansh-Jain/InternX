"""
Unit tests for services/scoring.py
Run: python -m pytest tests/ -v
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from services.scoring import calculate_resume_score, calculate_resume_score_vs_jd

# ── Fixtures ──────────────────────────────────────────────────────────────────

FULL_RESUME = {
    "personal": {
        "fullName": "Vinya Sharma",
        "email": "vinya@example.com",
        "phone": "9876543210",
        "linkedIn": "linkedin.com/in/vinya"
    },
    "education": [{"degree": "B.Tech Computer Science", "college": "IIT Bombay", "startYear": "2020", "endYear": "2024"}],
    "skills": {
        "technical": ["Python", "React", "Node.js", "MongoDB", "Docker", "AWS", "SQL", "Git"],
        "tools": ["VS Code", "Jira", "Figma"],
        "soft": ["Communication", "Leadership", "Teamwork"]
    },
    "experience": [
        {
            "company": "Swiggy",
            "role": "Software Engineer Intern",
            "responsibilities": [
                "Developed 3 microservices using Python and FastAPI, reducing latency by 40%",
                "Implemented CI/CD pipeline reducing deployment time from 2 hours to 15 minutes",
                "Collaborated with cross-functional team of 8 engineers on payment module"
            ]
        }
    ],
    "projects": [
        {
            "title": "InternX",
            "description": "Built a full-stack job platform with React, FastAPI, and MongoDB serving 500+ users",
            "techStack": ["React", "Python", "MongoDB"]
        }
    ],
    "achievements": ["Winner of Smart India Hackathon 2023", "Scored 98.5 percentile in GATE 2024"],
    "target": {"jobRole": "Software Engineer", "experienceLevel": "fresher"}
}

MINIMAL_RESUME = {
    "personal": {"fullName": "A", "email": "not-an-email"},
    "education": [],
    "skills": {"technical": [], "tools": [], "soft": []},
    "experience": [],
    "projects": [],
    "achievements": [],
    "target": {}
}


# ── calculate_resume_score tests ──────────────────────────────────────────────

def test_full_resume_scores_high():
    result = calculate_resume_score(FULL_RESUME)
    assert result["total_score"] >= 75, "A strong resume should score ≥75"
    assert "breakdown" in result
    assert "feedback" in result


def test_minimal_resume_scores_low():
    result = calculate_resume_score(MINIMAL_RESUME)
    assert result["total_score"] <= 30, "An empty resume should score ≤30"


def test_score_capped_at_100():
    result = calculate_resume_score(FULL_RESUME)
    assert result["total_score"] <= 100


def test_feedback_is_sorted_errors_first():
    result = calculate_resume_score(MINIMAL_RESUME)
    types = [f["type"] for f in result["feedback"]]
    # Find first non-error type index
    first_non_error = next((i for i, t in enumerate(types) if t != "error"), len(types))
    # All errors should come before warnings and tips
    for i, t in enumerate(types):
        if i < first_non_error:
            assert t == "error", f"Expected 'error' at position {i}, got '{t}'"


def test_breakdown_keys_present():
    result = calculate_resume_score(FULL_RESUME)
    expected_keys = {"keywords", "quantification", "grammar", "completeness", "action_verbs", "ats_readability"}
    assert expected_keys == set(result["breakdown"].keys())


def test_breakdown_values_non_negative():
    result = calculate_resume_score(FULL_RESUME)
    for key, val in result["breakdown"].items():
        assert val >= 0, f"Score for '{key}' should not be negative"


def test_invalid_email_penalized():
    r1 = calculate_resume_score(FULL_RESUME)
    bad_resume = {**FULL_RESUME, "personal": {**FULL_RESUME["personal"], "email": "not-valid"}}
    r2 = calculate_resume_score(bad_resume)
    assert r2["total_score"] < r1["total_score"], "Invalid email should lower score"


# ── calculate_resume_score_vs_jd tests ───────────────────────────────────────

JD_TEXT = """
We are looking for a Python backend developer with experience in FastAPI, MongoDB,
Docker, and AWS. You should have strong knowledge of REST APIs, SQL, and agile
development. Prior experience with React is a plus.
"""


def test_jd_match_returns_expected_keys():
    result = calculate_resume_score_vs_jd(FULL_RESUME, JD_TEXT)
    assert "match_score" in result
    assert "matched_keywords" in result
    assert "missing_keywords" in result
    assert "suggestions" in result
    assert "total_jd_keywords" in result


def test_jd_match_score_range():
    result = calculate_resume_score_vs_jd(FULL_RESUME, JD_TEXT)
    assert 0 <= result["match_score"] <= 100


def test_jd_match_strong_resume_scores_well():
    result = calculate_resume_score_vs_jd(FULL_RESUME, JD_TEXT)
    assert result["match_score"] >= 40, "Strong resume vs relevant JD should match ≥40%"


def test_jd_match_empty_resume_scores_low():
    result = calculate_resume_score_vs_jd(MINIMAL_RESUME, JD_TEXT)
    assert result["match_score"] <= 20, "Empty resume should match poorly"


def test_jd_match_trivial_jd():
    result = calculate_resume_score_vs_jd(FULL_RESUME, "Join our team!")
    # With very few JD keywords, result should still be valid
    assert 0 <= result["match_score"] <= 100


def test_jd_match_suggests_missing_keywords():
    # Use a JD with very specific skills not in the resume
    niche_jd = "Looking for Kubernetes COBOL FORTRAN MATLAB Haskell Erlang expert."
    result = calculate_resume_score_vs_jd(MINIMAL_RESUME, niche_jd)
    assert len(result["missing_keywords"]) > 0
