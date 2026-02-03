from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

from services.scoring import calculate_resume_score
from services.generator import optimize_resume_content
from services.grammar import check_grammar

router = APIRouter()

# Pydantic Models
class PersonalInfo(BaseModel):
    fullName: Optional[str] = ""
    email: Optional[str] = ""
    phone: Optional[str] = ""
    location: Optional[str] = ""
    linkedIn: Optional[str] = ""
    github: Optional[str] = ""
    portfolio: Optional[str] = ""

class Education(BaseModel):
    degree: Optional[str] = ""
    college: Optional[str] = ""
    startYear: Optional[str] = ""
    endYear: Optional[str] = ""
    cgpa: Optional[str] = ""

class Skills(BaseModel):
    technical: Optional[List[str]] = []
    tools: Optional[List[str]] = []
    soft: Optional[List[str]] = []

class Experience(BaseModel):
    company: Optional[str] = ""
    role: Optional[str] = ""
    startDate: Optional[str] = ""
    endDate: Optional[str] = ""
    responsibilities: Optional[List[str]] = []

class Project(BaseModel):
    title: Optional[str] = ""
    description: Optional[str] = ""
    techStack: Optional[List[str]] = []
    achievements: Optional[str] = ""

class TargetRole(BaseModel):
    jobRole: Optional[str] = ""
    experienceLevel: Optional[str] = "fresher"

class ResumeData(BaseModel):
    personal: Optional[PersonalInfo] = PersonalInfo()
    education: Optional[List[Education]] = []
    skills: Optional[Skills] = Skills()
    experience: Optional[List[Experience]] = []
    projects: Optional[List[Project]] = []
    target: Optional[TargetRole] = TargetRole()

class AnalysisResponse(BaseModel):
    score: int
    feedback: List[Dict[str, str]]
    breakdown: Dict[str, int]

class GenerateResponse(BaseModel):
    success: bool
    optimizedData: Optional[Dict[str, Any]] = None
    suggestions: List[str]

# Available templates
TEMPLATES = [
    {
        "id": "classic",
        "name": "Classic",
        "description": "Traditional single-column layout with clean sections",
        "atsScore": 95
    },
    {
        "id": "modern",
        "name": "Modern",
        "description": "Contemporary design with subtle accents",
        "atsScore": 92
    },
    {
        "id": "minimal",
        "name": "Minimal",
        "description": "Clean and minimal design for tech roles",
        "atsScore": 98
    }
]


@router.post("/generate-resume", response_model=GenerateResponse)
async def generate_resume(data: ResumeData):
    """
    Generate an ATS-optimized resume from the provided data.
    Optimizes content with action verbs and quantified achievements.
    """
    try:
        optimized_data, suggestions = optimize_resume_content(data.model_dump())
        
        return GenerateResponse(
            success=True,
            optimizedData=optimized_data,
            suggestions=suggestions
        )
    except Exception as e:
        return GenerateResponse(
            success=False,
            optimizedData=None,
            suggestions=[f"Error generating resume: {str(e)}"]
        )


@router.post("/analyze-resume", response_model=AnalysisResponse)
async def analyze_resume(data: ResumeData):
    """
    Analyze resume and return ATS score with detailed feedback.
    Scoring based on keywords, quantification, grammar, completeness,
    action verbs, and ATS readability.
    """
    score_result = calculate_resume_score(data.model_dump())
    
    return AnalysisResponse(
        score=score_result["total_score"],
        feedback=score_result["feedback"],
        breakdown=score_result["breakdown"]
    )


@router.get("/templates")
async def get_templates():
    """
    Get available resume templates with their ATS compatibility scores.
    """
    return {"templates": TEMPLATES}


@router.post("/check-grammar")
async def check_grammar_endpoint(data: ResumeData):
    """
    Check grammar and spelling in resume content.
    """
    issues = check_grammar(data.model_dump())
    return {"issues": issues}
