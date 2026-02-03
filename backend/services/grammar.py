"""
Grammar and Spelling Check Service
Provides basic grammar checking and improvement suggestions.
"""

import re
from typing import Dict, Any, List

# Common grammar issues and corrections
COMMON_ISSUES = {
    r"\bi\b(?![']m|'d|'ll|'ve)": 'Use "I" (capitalize first person pronoun)',
    r'alot\b': 'Use "a lot" instead of "alot"',
    r'could of\b': 'Use "could have" instead of "could of"',
    r'would of\b': 'Use "would have" instead of "would of"',
    r'should of\b': 'Use "should have" instead of "should of"',
    r'your\s+(?:going|welcome|the\s+best)': 'Check "your" vs "you\'re"',
    r'its\s+(?:a|the|going|been)': 'Check "its" vs "it\'s"',
    r'\btheir\s+(?:is|was|are|were|going)': 'Check "their" vs "there" or "they\'re"',
    r'(?<!\w)ect\b': 'Use "etc." instead of "ect"',
    r'seperate\b': 'Use "separate" instead of "seperate"',
    r'occured\b': 'Use "occurred" instead of "occured"',
    r'recieved\b': 'Use "received" instead of "recieved"',
    r'definately\b': 'Use "definitely" instead of "definately"',
    r'accomodate\b': 'Use "accommodate" instead of "accomodate"',
    r'untill\b': 'Use "until" instead of "untill"',
    r'tommorow\b': 'Use "tomorrow" instead of "tommorow"',
    r'occassion\b': 'Use "occasion" instead of "occassion"',
}

# Weak phrases to flag
WEAK_PHRASES = [
    "responsible for",
    "duties included",
    "worked on",
    "helped with",
    "assisted with",
    "was in charge of",
    "participated in",
    "involved in"
]

# Commonly overused words
OVERUSED_WORDS = [
    "very", "really", "basically", "actually", "literally",
    "just", "simply", "definitely", "probably", "obviously"
]


def check_grammar(data: Dict[str, Any]) -> List[Dict[str, str]]:
    """
    Check grammar and spelling in resume content.
    
    Args:
        data: Resume data dictionary
        
    Returns:
        List of issues with location, type, and message
    """
    issues = []
    
    # Check personal info
    personal = data.get("personal", {})
    personal_issues = _check_personal_info(personal)
    issues.extend(personal_issues)
    
    # Check experience
    experience = data.get("experience", [])
    for i, exp in enumerate(experience):
        exp_issues = _check_experience(exp, i)
        issues.extend(exp_issues)
    
    # Check projects
    projects = data.get("projects", [])
    for i, proj in enumerate(projects):
        proj_issues = _check_project(proj, i)
        issues.extend(proj_issues)
    
    # General text check on all content
    all_text = _collect_all_text(data)
    general_issues = _check_general_grammar(all_text)
    issues.extend(general_issues)
    
    return issues


def _check_personal_info(personal: Dict) -> List[Dict[str, str]]:
    """Check personal information section."""
    issues = []
    
    # Check email format
    email = personal.get("email", "")
    if email and not re.match(r'^[\w\.-]+@[\w\.-]+\.\w+$', email):
        issues.append({
            "location": "Personal Info - Email",
            "type": "error",
            "message": "Email format appears invalid"
        })
    
    # Check name capitalization
    name = personal.get("fullName", "")
    if name:
        words = name.split()
        for word in words:
            if word and not word[0].isupper():
                issues.append({
                    "location": "Personal Info - Name",
                    "type": "warning",
                    "message": "Capitalize each word in your name"
                })
                break
    
    # Check LinkedIn URL
    linkedin = personal.get("linkedIn", "")
    if linkedin and "linkedin.com" not in linkedin.lower():
        issues.append({
            "location": "Personal Info - LinkedIn",
            "type": "tip",
            "message": "Use full LinkedIn URL format"
        })
    
    return issues


def _check_experience(exp: Dict, index: int) -> List[Dict[str, str]]:
    """Check experience section content."""
    issues = []
    location_prefix = f"Experience {index + 1}"
    
    responsibilities = exp.get("responsibilities", [])
    for i, resp in enumerate(responsibilities):
        if not resp:
            continue
            
        # Check for weak phrases
        resp_lower = resp.lower()
        for phrase in WEAK_PHRASES:
            if phrase in resp_lower:
                issues.append({
                    "location": f"{location_prefix} - Bullet {i + 1}",
                    "type": "improve",
                    "message": f"Replace \"{phrase}\" with a stronger action verb"
                })
                break
        
        # Check for first person pronouns
        if re.search(r'\b(i|my|me)\b', resp_lower):
            issues.append({
                "location": f"{location_prefix} - Bullet {i + 1}",
                "type": "tip",
                "message": "Avoid first-person pronouns (I, my, me) in bullet points"
            })
        
        # Check for passive voice indicators
        passive_patterns = [r'\bwas\s+\w+ed\b', r'\bwere\s+\w+ed\b', r'\bbeen\s+\w+ed\b']
        for pattern in passive_patterns:
            if re.search(pattern, resp_lower):
                issues.append({
                    "location": f"{location_prefix} - Bullet {i + 1}",
                    "type": "tip",
                    "message": "Consider using active voice instead of passive voice"
                })
                break
    
    return issues


def _check_project(proj: Dict, index: int) -> List[Dict[str, str]]:
    """Check project section content."""
    issues = []
    location_prefix = f"Project {index + 1}"
    
    description = proj.get("description", "")
    if description:
        # Check for overused words
        desc_lower = description.lower()
        for word in OVERUSED_WORDS:
            if word in desc_lower:
                issues.append({
                    "location": f"{location_prefix} - Description",
                    "type": "tip",
                    "message": f"Consider removing or replacing overused word: \"{word}\""
                })
                break
    
    return issues


def _check_general_grammar(text: str) -> List[Dict[str, str]]:
    """Check for common grammar and spelling issues."""
    issues = []
    
    for pattern, message in COMMON_ISSUES.items():
        if re.search(pattern, text, re.IGNORECASE):
            issues.append({
                "location": "General",
                "type": "grammar",
                "message": message
            })
    
    # Check for double spaces
    if "  " in text:
        issues.append({
            "location": "General",
            "type": "formatting",
            "message": "Remove double spaces from content"
        })
    
    # Check for sentence starting with lowercase
    sentences = re.split(r'[.!?]\s+', text)
    for sentence in sentences:
        if sentence and sentence[0].islower():
            issues.append({
                "location": "General",
                "type": "grammar",
                "message": "Ensure all sentences start with a capital letter"
            })
            break
    
    return issues


def _collect_all_text(data: Dict) -> str:
    """Collect all text content from resume data."""
    text_parts = []
    
    personal = data.get("personal", {})
    text_parts.append(personal.get("fullName", ""))
    
    for exp in data.get("experience", []):
        text_parts.append(exp.get("role", ""))
        text_parts.extend(exp.get("responsibilities", []))
    
    for proj in data.get("projects", []):
        text_parts.append(proj.get("title", ""))
        text_parts.append(proj.get("description", ""))
        text_parts.append(proj.get("achievements", ""))
    
    for edu in data.get("education", []):
        text_parts.append(edu.get("degree", ""))
        text_parts.append(edu.get("college", ""))
    
    return " ".join(filter(None, text_parts))


def get_improvement_suggestions(text: str) -> List[str]:
    """Get specific suggestions for improving text."""
    suggestions = []
    
    # Check length
    words = text.split()
    if len(words) < 10:
        suggestions.append("Add more detail to fully describe your impact")
    elif len(words) > 50:
        suggestions.append("Consider being more concise")
    
    # Check for metrics
    if not re.search(r'\d+', text):
        suggestions.append("Add numbers to quantify your achievements")
    
    # Check for action verb at start
    if words:
        first_word = words[0].lower()
        weak_starters = ["i", "the", "a", "an", "my", "was", "were"]
        if first_word in weak_starters:
            suggestions.append("Start with a strong action verb")
    
    return suggestions
