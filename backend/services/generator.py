"""
Resume Content Generator Service
Optimizes resume content for ATS compatibility.
"""

import re
from typing import Dict, Any, List, Tuple

# Weak verbs to replace with strong action verbs
VERB_REPLACEMENTS = {
    "worked on": "Developed",
    "helped with": "Contributed to",
    "was responsible for": "Managed",
    "responsible for": "Managed",
    "did": "Executed",
    "made": "Created",
    "used": "Utilized",
    "worked with": "Collaborated with",
    "was part of": "Participated in",
    "got": "Achieved",
    "had to": "Led",
    "helped": "Assisted",
    "tried to": "Endeavored to",
    "was in charge of": "Oversaw",
    "handled": "Managed",
    "took care of": "Oversaw",
    "was involved in": "Contributed to",
    "participated in": "Engaged in",
    "assisted in": "Supported",
    "involved in": "Contributed to",
    "duties included": "Delivered",
    "was tasked with": "Executed",
    "contributed to": "Advanced",
    "worked towards": "Drove",
    "was employed to": "Served to",
}

# Filler words to remove
FILLER_WORDS = [
    "very", "really", "just", "basically", "actually", "simply",
    "probably", "definitely", "certainly", "obviously", "literally"
]

# Strong action verbs by category
ACTION_VERB_SUGGESTIONS = {
    "technical": ["Engineered", "Developed", "Implemented", "Architected", "Programmed", "Automated", "Optimized", "Debugged", "Deployed", "Integrated"],
    "leadership": ["Led", "Directed", "Managed", "Coordinated", "Supervised", "Mentored", "Guided", "Orchestrated"],
    "achievement": ["Achieved", "Exceeded", "Delivered", "Accomplished", "Attained", "Surpassed", "Completed"],
    "improvement": ["Improved", "Enhanced", "Streamlined", "Accelerated", "Increased", "Reduced", "Optimized"],
    "creation": ["Created", "Designed", "Built", "Established", "Launched", "Initiated", "Pioneered"],
    "analysis": ["Analyzed", "Evaluated", "Researched", "Identified", "Assessed", "Investigated", "Diagnosed"]
}


def optimize_resume_content(data: Dict[str, Any]) -> Tuple[Dict[str, Any], List[str]]:
    """
    Optimize resume content for ATS compatibility.
    
    Args:
        data: Raw resume data from the form
        
    Returns:
        Tuple of (optimized_data, suggestions)
    """
    optimized_data = data.copy()
    suggestions = []
    
    # Optimize experience bullet points
    if "experience" in data and data["experience"]:
        optimized_experience = []
        for exp in data["experience"]:
            optimized_exp = exp.copy()
            if "responsibilities" in exp:
                optimized_resp = []
                for resp in exp["responsibilities"]:
                    if resp:
                        optimized_bullet = _optimize_bullet_point(resp)
                        optimized_resp.append(optimized_bullet)
                optimized_exp["responsibilities"] = optimized_resp
            optimized_experience.append(optimized_exp)
        optimized_data["experience"] = optimized_experience
    
    # Optimize project descriptions
    if "projects" in data and data["projects"]:
        optimized_projects = []
        for proj in data["projects"]:
            optimized_proj = proj.copy()
            if proj.get("description"):
                optimized_proj["description"] = _optimize_description(proj["description"])
            optimized_projects.append(optimized_proj)
        optimized_data["projects"] = optimized_projects
    
    # Generate suggestions
    suggestions.extend(_generate_suggestions(data))
    
    return optimized_data, suggestions


def _optimize_bullet_point(bullet: str) -> str:
    """Optimize a single bullet point."""
    if not bullet:
        return bullet
    
    optimized = bullet.strip()
    
    # Replace weak verb phrases with strong action verbs
    for weak, strong in VERB_REPLACEMENTS.items():
        pattern = re.compile(re.escape(weak), re.IGNORECASE)
        if pattern.search(optimized):
            # Capitalize if at start of sentence
            if optimized.lower().startswith(weak):
                optimized = strong + optimized[len(weak):]
            else:
                optimized = pattern.sub(strong.lower(), optimized)
    
    # Remove filler words
    for filler in FILLER_WORDS:
        pattern = re.compile(r'\b' + filler + r'\b', re.IGNORECASE)
        optimized = pattern.sub('', optimized)
    
    # Clean up extra spaces
    optimized = re.sub(r'\s+', ' ', optimized).strip()
    
    # Ensure starts with capital letter
    if optimized:
        optimized = optimized[0].upper() + optimized[1:]
    
    # Remove trailing period if present (ATS prefers without)
    optimized = optimized.rstrip('.')
    
    return optimized


def _optimize_description(description: str) -> str:
    """Optimize project/achievement description."""
    if not description:
        return description
    
    optimized = description.strip()
    
    # Replace weak phrases
    for weak, strong in VERB_REPLACEMENTS.items():
        pattern = re.compile(re.escape(weak), re.IGNORECASE)
        optimized = pattern.sub(strong, optimized)
    
    # Remove filler words
    for filler in FILLER_WORDS:
        pattern = re.compile(r'\b' + filler + r'\b', re.IGNORECASE)
        optimized = pattern.sub('', optimized)
    
    # Clean up
    optimized = re.sub(r'\s+', ' ', optimized).strip()
    
    return optimized


def _generate_suggestions(data: Dict[str, Any]) -> Dict[str, List[str]]:
    """
    Generate categorized, actionable suggestions.

    Returns:
        Dict with 'critical' (must-fix) and 'tips' (nice-to-have) lists.
    """
    critical = []
    tips = []

    # Check experience bullet points
    experience = data.get("experience", [])
    for i, exp in enumerate(experience):
        responsibilities = exp.get("responsibilities", [])
        for j, resp in enumerate(responsibilities):
            if resp:
                if not re.search(r'\d+', resp):
                    critical.append(
                        f"Experience {i+1}, bullet {j+1}: Add metrics or numbers to quantify your impact"
                    )

                first_word = resp.split()[0].lower() if resp.split() else ""
                weak_starters = ["i", "my", "the", "a", "an", "was", "were", "did", "had", "helped"]
                if first_word in weak_starters:
                    critical.append(
                        f"Experience {i+1}, bullet {j+1}: Start with a strong action verb"
                    )

    # Check skills count
    skills = data.get("skills", {})
    technical_count = len(skills.get("technical", []))
    if technical_count < 5:
        critical.append(f"Add {5 - technical_count} more technical skills relevant to your target role")
    elif technical_count < 8:
        tips.append(f"Consider adding {8 - technical_count} more technical skills to strengthen your profile")

    # Check for soft skills
    soft_count = len(skills.get("soft", []))
    if soft_count < 3:
        tips.append("Add 2-3 soft skills (e.g., Communication, Team Leadership, Problem-Solving)")

    # Check for target role alignment
    target_role = data.get("target", {}).get("jobRole", "")
    if not target_role:
        critical.append("Specify your target job role for better keyword optimization")

    # Check for projects section
    projects = data.get("projects", [])
    if not projects:
        tips.append("Add a projects section to showcase hands-on experience")
    elif len(projects) < 2:
        tips.append("Add one more project to demonstrate a broader skillset")

    # Check LinkedIn/GitHub presence
    personal = data.get("personal", {})
    if not personal.get("linkedIn") and not personal.get("github"):
        critical.append("Add a LinkedIn or GitHub profile URL — recruiters will look for this")

    return {"critical": critical, "tips": tips}


def suggest_action_verbs(category: str = None) -> List[str]:
    """Get suggested action verbs, optionally filtered by category."""
    if category and category in ACTION_VERB_SUGGESTIONS:
        return ACTION_VERB_SUGGESTIONS[category]
    
    # Return all verbs
    all_verbs = []
    for verbs in ACTION_VERB_SUGGESTIONS.values():
        all_verbs.extend(verbs)
    return list(set(all_verbs))


def format_phone_number(phone: str) -> str:
    """Format phone number with region-aware formatting.
    Supports Indian (10-digit) and US (10/11-digit with country code) numbers.
    """
    digits = re.sub(r'\D', '', phone)
    # Indian: 10 digits starting with 6-9 (no country code)
    if len(digits) == 10 and digits[0] in '6789':
        return f"+91 {digits[:5]} {digits[5:]}"
    # Indian with country code
    if len(digits) == 12 and digits[:2] == '91':
        local = digits[2:]
        return f"+91 {local[:5]} {local[5:]}"
    # US: 10 digits
    if len(digits) == 10:
        return f"({digits[:3]}) {digits[3:6]}-{digits[6:]}"
    # US with country code
    if len(digits) == 11 and digits[0] == '1':
        return f"+1 ({digits[1:4]}) {digits[4:7]}-{digits[7:]}"
    return phone


def format_linkedin_url(url: str) -> str:
    """Standardize LinkedIn URL format."""
    if not url:
        return url
    
    # Remove https:// or http://
    clean = re.sub(r'^https?://', '', url)
    # Remove www.
    clean = re.sub(r'^www\.', '', clean)
    # Ensure starts with linkedin.com
    if not clean.startswith('linkedin.com'):
        if 'linkedin' in clean.lower():
            # Try to extract the profile part
            match = re.search(r'linkedin\.com/in/[\w-]+', clean, re.IGNORECASE)
            if match:
                clean = match.group()
        else:
            # Assume it's just the username
            clean = f"linkedin.com/in/{clean}"
    
    return clean
