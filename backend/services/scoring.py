"""
Resume Scoring Service
Calculates ATS compatibility score based on multiple factors.
"""

import re
from collections import Counter
from typing import Dict, List, Any

# Action verbs commonly used in effective resumes
ACTION_VERBS = {
    "leadership": ["led", "managed", "directed", "coordinated", "supervised", "headed", "oversaw"],
    "achievement": ["achieved", "accomplished", "exceeded", "delivered", "completed", "attained"],
    "creation": ["created", "developed", "designed", "built", "implemented", "established", "launched"],
    "improvement": ["improved", "enhanced", "optimized", "increased", "reduced", "streamlined", "accelerated"],
    "analysis": ["analyzed", "evaluated", "assessed", "researched", "investigated", "identified"],
    "communication": ["presented", "communicated", "collaborated", "negotiated", "influenced", "advised"],
    "technical": ["programmed", "engineered", "automated", "integrated", "configured", "deployed"]
}

# Common keywords by job categories
JOB_KEYWORDS = {
    "software": ["python", "javascript", "java", "react", "node", "sql", "api", "git", "agile", "docker", "aws", "kubernetes", "testing", "debugging", "algorithms", "data structures"],
    "frontend": ["react", "vue", "angular", "javascript", "typescript", "html", "css", "responsive", "ui", "ux", "figma", "webpack", "sass", "tailwind"],
    "backend": ["python", "java", "node", "express", "django", "fastapi", "spring", "sql", "mongodb", "postgresql", "redis", "api", "rest", "graphql"],
    "data": ["python", "sql", "pandas", "numpy", "machine learning", "statistics", "visualization", "tableau", "power bi", "excel", "r", "spark"],
    "devops": ["docker", "kubernetes", "aws", "azure", "gcp", "ci/cd", "jenkins", "terraform", "ansible", "linux", "monitoring", "scripting"],
    "general": ["communication", "teamwork", "problem-solving", "leadership", "project management", "analytical", "time management"]
}

# Stop words to exclude from JD matching
_STOP_WORDS = {
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "is", "are", "was", "were", "will", "have",
    "has", "had", "be", "been", "being", "do", "does", "did", "that", "this",
    "we", "you", "they", "our", "your", "their", "it", "its", "as", "if",
    "not", "no", "can", "would", "should", "could", "may", "must", "shall",
    "up", "out", "so", "than", "then", "into", "over", "after", "such",
    "while", "also", "about", "including", "etc", "e.g", "i.e", "well",
    "strong", "good", "great", "work", "working", "experience", "role",
    "position", "team", "candidate", "skills", "ability", "knowledge",
    "minimum", "preferred", "required", "requirement", "requirements", "year",
    "years", "plus", "highly", "looking", "join", "help", "make", "use",
    "using", "build", "building", "across", "within", "between", "through",
}


def calculate_resume_score(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculate comprehensive ATS score for a resume.

    Returns:
        Dict with total_score (0-100), feedback list (grouped by severity), and breakdown.
    """
    breakdown = {
        "keywords": 0,
        "quantification": 0,
        "grammar": 0,
        "completeness": 0,
        "action_verbs": 0,
        "ats_readability": 0
    }
    raw_feedback: List[Dict[str, str]] = []

    # Get target job role for keyword matching
    target_role = data.get("target", {}).get("jobRole", "").lower()

    # 1. Section Completeness (15 points)
    breakdown["completeness"] = _calculate_completeness(data, raw_feedback)

    # 2. Keyword Matching (25 points)
    breakdown["keywords"] = _calculate_keyword_score(data, target_role, raw_feedback)

    # 3. Quantification (20 points)
    breakdown["quantification"] = _calculate_quantification(data, raw_feedback)

    # 4. Action Verbs (10 points)
    breakdown["action_verbs"] = _calculate_action_verbs(data, raw_feedback)

    # 5. Grammar & Spelling (15 points)
    breakdown["grammar"] = _calculate_grammar_score(data, raw_feedback)

    # 6. ATS Readability (15 points)
    breakdown["ats_readability"] = _calculate_ats_readability(data, raw_feedback)

    total_score = sum(breakdown.values())

    # Add overall success message at top
    if total_score >= 80:
        raw_feedback.insert(0, {"type": "success", "message": "Excellent! Your resume is highly ATS-optimized and ready to impress recruiters."})
    elif total_score >= 60:
        raw_feedback.insert(0, {"type": "success", "message": "Good job! Your resume is well-structured with room for minor improvements."})

    # Group feedback by severity: error → improve → warning → tip → success
    _PRIORITY = {"error": 0, "improve": 1, "warning": 2, "grammar": 2, "tip": 3, "success": 4}
    sorted_feedback = sorted(raw_feedback, key=lambda f: _PRIORITY.get(f.get("type", "tip"), 3))

    return {
        "total_score": min(100, total_score),
        "feedback": sorted_feedback,
        "breakdown": breakdown
    }


def calculate_resume_score_vs_jd(resume_data: Dict[str, Any], jd_text: str) -> Dict[str, Any]:
    """
    Score a resume against a specific job description using keyword frequency analysis.

    Args:
        resume_data: Standard resume data dict
        jd_text: Raw job description text pasted by the user

    Returns:
        Dict with match_score (0-100), matched_keywords, missing_keywords, suggestions
    """
    # Extract meaningful tokens from JD
    jd_tokens = _tokenize(jd_text)
    jd_freq = Counter(jd_tokens)
    # Take the top 40 most significant JD keywords (exclude stop words)
    significant_jd_keywords = [
        word for word, _ in jd_freq.most_common(60)
        if len(word) > 2 and word not in _STOP_WORDS
    ][:40]

    # Collect all resume text
    resume_text = _collect_all_text(resume_data).lower()
    resume_tokens = set(_tokenize(resume_text))

    # Find matched and missing keywords
    matched = []
    missing = []
    for kw in significant_jd_keywords:
        # Check for exact token match OR substring match for compound terms
        if kw in resume_tokens or kw in resume_text:
            matched.append(kw)
        else:
            missing.append(kw)

    match_count = len(matched)
    total_kw = len(significant_jd_keywords)
    match_score = int((match_count / total_kw) * 100) if total_kw else 0

    # Generate targeted suggestions
    suggestions = []
    if missing:
        top_missing = missing[:8]
        suggestions.append(f"Add these high-frequency JD keywords: {', '.join(top_missing)}")
    if match_score < 50:
        suggestions.append("Your resume covers less than half of the job description's key terms — consider tailoring your experience section.")
    elif match_score < 75:
        suggestions.append("Good overlap! Adding a few more JD-specific terms will push you past 75%.")
    else:
        suggestions.append("Strong match — your resume closely mirrors the job description language.")

    return {
        "match_score": match_score,
        "matched_keywords": matched,
        "missing_keywords": missing[:15],  # Top 15 missing
        "total_jd_keywords": total_kw,
        "suggestions": suggestions
    }


def _tokenize(text: str) -> List[str]:
    """Tokenize text into lowercase words, stripping punctuation."""
    text = text.lower()
    # Replace common separators with spaces
    text = re.sub(r'[/\\+|,;:()\[\]{}\'"<>]', ' ', text)
    words = re.findall(r'\b[a-z][a-z0-9#.+]*\b', text)
    return [w for w in words if w not in _STOP_WORDS and len(w) > 1]


def _calculate_completeness(data: Dict, feedback: List) -> int:
    """Check if all essential sections are filled."""
    score = 0

    personal = data.get("personal", {})
    if personal.get("fullName") and personal.get("email"):
        score += 3
    else:
        feedback.append({"type": "error", "message": "Add your full name and email address"})

    if personal.get("phone"):
        score += 1
    else:
        feedback.append({"type": "warning", "message": "Consider adding a phone number"})

    if personal.get("linkedIn") or personal.get("github"):
        score += 1

    education = data.get("education", [])
    if education and any(edu.get("degree") for edu in education):
        score += 3
    else:
        feedback.append({"type": "warning", "message": "Add your educational background"})

    skills = data.get("skills", {})
    if skills.get("technical") and len(skills["technical"]) > 0:
        score += 3
    else:
        feedback.append({"type": "error", "message": "Add technical skills relevant to your target role"})

    experience = data.get("experience", [])
    if experience and any(exp.get("company") or exp.get("role") for exp in experience):
        score += 2

    achievements = data.get("achievements", [])
    if achievements:
        score += 2
    else:
        feedback.append({"type": "tip", "message": "Add a dedicated achievements/certifications section to boost your score"})

    target = data.get("target", {})
    if target.get("jobRole"):
        score += 2
    else:
        feedback.append({"type": "warning", "message": "Specify your target job role for better keyword optimization"})

    return min(15, score)


def _calculate_keyword_score(data: Dict, target_role: str, feedback: List) -> int:
    """Calculate keyword matching score based on target role."""
    all_text = _collect_all_text(data).lower()

    # Determine relevant keyword categories
    relevant_categories = []
    if any(term in target_role for term in ["frontend", "front-end", "react", "ui"]):
        relevant_categories.append("frontend")
    if any(term in target_role for term in ["backend", "back-end", "server", "api"]):
        relevant_categories.append("backend")
    if any(term in target_role for term in ["software", "developer", "engineer", "programmer"]):
        relevant_categories.append("software")
    if any(term in target_role for term in ["data", "analyst", "scientist", "ml", "ai"]):
        relevant_categories.append("data")
    if any(term in target_role for term in ["devops", "sre", "cloud", "infrastructure"]):
        relevant_categories.append("devops")

    if not relevant_categories:
        relevant_categories = ["software", "general"]

    # Count matching keywords
    matched_keywords = set()
    for category in relevant_categories:
        for keyword in JOB_KEYWORDS.get(category, []):
            if keyword in all_text:
                matched_keywords.add(keyword)

    keyword_count = len(matched_keywords)
    if keyword_count >= 10:
        score = 25
    elif keyword_count >= 7:
        score = 20
    elif keyword_count >= 5:
        score = 15
    elif keyword_count >= 3:
        score = 10
    else:
        score = keyword_count * 2

    if keyword_count < 5:
        feedback.append({
            "type": "improve",
            "message": f"Add more relevant keywords for '{target_role or 'your target role'}'. Found {keyword_count} keywords."
        })

    return score



def _calculate_quantification(data: Dict, feedback: List) -> int:
    """Check for quantified achievements with numbers and metrics."""
    experience_text = ""
    for exp in data.get("experience", []):
        experience_text += " ".join(exp.get("responsibilities", []))

    for proj in data.get("projects", []):
        experience_text += " " + proj.get("description", "")

    numbers = re.findall(r'\d+(?:\.\d+)?%?', experience_text)

    achievements = data.get("achievements", [])
    for ach in achievements:
        numbers.extend(re.findall(r'\d+(?:\.\d+)?%?', ach))

    metrics_count = len(numbers)

    if metrics_count >= 6:
        score = 20
    elif metrics_count >= 4:
        score = 15
    elif metrics_count >= 2:
        score = 10
    else:
        score = metrics_count * 4

    if metrics_count < 3:
        feedback.append({
            "type": "improve",
            "message": "Add quantified achievements (e.g., 'Increased sales by 25%', 'Managed team of 5')"
        })

    return score


def _calculate_action_verbs(data: Dict, feedback: List) -> int:
    """Check for strong action verbs at the start of bullet points."""
    all_verbs = []
    for category in ACTION_VERBS.values():
        all_verbs.extend(category)

    experience_text = ""
    for exp in data.get("experience", []):
        for resp in exp.get("responsibilities", []):
            experience_text += " " + resp.lower()

    found_verbs = set()
    for verb in all_verbs:
        if verb in experience_text:
            found_verbs.add(verb)

    verb_count = len(found_verbs)

    if verb_count >= 5:
        score = 10
    elif verb_count >= 3:
        score = 7
    elif verb_count >= 1:
        score = 4
    else:
        score = 0

    if verb_count < 3:
        feedback.append({
            "type": "improve",
            "message": "Start bullet points with strong action verbs (Led, Developed, Achieved, Implemented)"
        })

    return score



def _calculate_grammar_score(data: Dict, feedback: List) -> int:
    """Basic grammar and formatting check."""
    score = 15

    personal = data.get("personal", {})

    email = personal.get("email", "")
    if email and not re.match(r'^[\w\.-]+@[\w\.-]+\.\w+$', email):
        score -= 3
        feedback.append({"type": "error", "message": "Invalid email format"})

    phone = personal.get("phone", "")
    if phone and len(re.sub(r'\D', '', phone)) < 10:
        score -= 2
        feedback.append({"type": "warning", "message": "Phone number appears incomplete"})

    fullname = personal.get("fullName", "")
    if fullname and fullname.isupper():
        score -= 1
        feedback.append({"type": "tip", "message": "Use proper capitalization for your name"})

    feedback.append({"type": "tip", "message": "Proofread for spelling and grammar errors before submitting"})

    return max(0, score)


def _calculate_ats_readability(data: Dict, feedback: List) -> int:
    """Check ATS-friendly formatting and structure."""
    score = 15

    has_education = bool(data.get("education", []))
    has_experience = bool(data.get("experience", []))
    has_skills = bool(data.get("skills", {}).get("technical", []))

    if not has_education:
        score -= 3
    if not has_experience:
        score -= 4
    if not has_skills:
        score -= 4

    linkedin = data.get("personal", {}).get("linkedIn", "")
    if linkedin and "linkedin.com" not in linkedin.lower():
        score -= 2
        feedback.append({"type": "tip", "message": "Use full LinkedIn URL (linkedin.com/in/yourprofile)"})

    if score == 15:
        feedback.append({"type": "success", "message": "Resume structure is ATS-friendly"})

    return max(0, score)


def _collect_all_text(data: Dict) -> str:
    """Collect all text content from resume data."""
    text_parts = []

    personal = data.get("personal", {})
    text_parts.append(personal.get("fullName", ""))

    skills = data.get("skills", {})
    text_parts.extend(skills.get("technical", []))
    text_parts.extend(skills.get("tools", []))
    text_parts.extend(skills.get("soft", []))

    for exp in data.get("experience", []):
        text_parts.append(exp.get("role", ""))
        text_parts.extend(exp.get("responsibilities", []))

    for proj in data.get("projects", []):
        text_parts.append(proj.get("title", ""))
        text_parts.append(proj.get("description", ""))
        text_parts.extend(proj.get("techStack", []))

    for edu in data.get("education", []):
        text_parts.append(edu.get("degree", ""))

    text_parts.extend(data.get("achievements", []))
    text_parts.append(data.get("target", {}).get("jobRole", ""))

    return " ".join(filter(None, text_parts))
