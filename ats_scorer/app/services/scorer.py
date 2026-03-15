from app.services.nlp_utils import extract_skills_from_text, extract_keywords_from_text, calculate_semantic_similarity
from app.services.parser import detect_sections
import re

def evaluate_resume(resume_text: str, jd_text: str) -> dict:
    """
    Evaluate a resume against a job description and generate score and suggestions.
    """
    # 1. Extract features from JD
    jd_skills = extract_skills_from_text(jd_text)
    
    # 2. Extract features from Resume
    resume_skills = extract_skills_from_text(resume_text)
    
    # 3. Analyze sections
    sections = detect_sections(resume_text)
    exp_text = sections.get("experience", "")
    edu_text = sections.get("education", "")
    
    # 4. Calculate Matches
    
    # Skill Match (40%)
    if not jd_skills:
        skill_score = 1.0 # If JD has no skills, assume 100%
    else:
        matched_skills = set(jd_skills).intersection(set(resume_skills))
        skill_score = len(matched_skills) / len(jd_skills)
        
    # Semantic Match (30%)
    semantic_score = calculate_semantic_similarity(resume_text, jd_text)
    semantic_score = max(0.0, min(1.0, semantic_score)) # Clamp
    
    # Experience Match (20%)
    exp_score = 0.5 
    if exp_text:
        exp_sim = calculate_semantic_similarity(exp_text, jd_text)
        exp_score = max(0.5, exp_sim)
    else:
        if re.search(r'\d{4}', resume_text):
            exp_score = 0.4
        else:
            exp_score = 0.0
            
    # Education Match (10%)
    edu_score = 0.0
    if edu_text or re.search(r'\b(bachelor|master|phd|b\.s|m\.s|b\.a|degree)\b', resume_text.lower()):
        edu_score = 1.0
        
    # Final Score Calculation
    final_score = (
        (skill_score * 0.40) +
        (semantic_score * 0.30) +
        (exp_score * 0.20) +
        (edu_score * 0.10)
    ) * 100
    
    # 5. Suggestions Generation
    suggestions = []
    missing_skills = list(set(jd_skills) - set(resume_skills))
    
    if missing_skills:
        suggestions.append(f"Consider adding these missing skills: {', '.join(missing_skills[:5])}")
        
    if skill_score < 0.6:
        suggestions.append("Your resume lacks many core skills mentioned in the job description.")
        
    if semantic_score < 0.5:
        suggestions.append("The overall language doesn't align strongly with the job posting. Use more relevant keywords.")
        
    if not exp_text:
        suggestions.append("Could not clearly identify an 'Experience' section. Make sure headers are clear (e.g., 'Work Experience').")
        
    if exp_text and not re.search(r'\d+%|\$\d+|\d+x', exp_text):
        suggestions.append("Try to quantify your achievements in the experience section (e.g., 'improved performance by 30%').")
        
    if not edu_text and edu_score == 0.0:
        suggestions.append("Could not clearly identify your education. Ensure you have an 'Education' section.")
        
    # Create final response
    return {
        "ats_score": round(final_score, 1),
        "skill_match": round(skill_score, 2),
        "semantic_match": round(semantic_score, 2),
        "missing_skills": missing_skills,
        "matched_skills": list(set(jd_skills).intersection(set(resume_skills))),
        "suggestions": suggestions
    }
