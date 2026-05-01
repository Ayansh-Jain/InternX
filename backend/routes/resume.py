from fastapi import APIRouter, UploadFile, File
from pydantic import BaseModel
from typing import List, Optional, Dict, Any, Union

from services.scoring import calculate_resume_score, calculate_resume_score_vs_jd
from services.generator import optimize_resume_content, customize_resume_for_job
from services.grammar import check_grammar
from services.parser import parse_resume_pdf
from services.bio_generator import process_bio_generation
from services.export import generate_pdf_from_html, generate_docx_from_data
from fastapi.responses import StreamingResponse

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
    achievements: Optional[List[str]] = []
    target: Optional[TargetRole] = TargetRole()

class AnalysisResponse(BaseModel):
    score: int
    feedback: List[Dict[str, str]]
    breakdown: Dict[str, int]

class GenerateResponse(BaseModel):
    success: bool
    optimizedData: Optional[Dict[str, Any]] = None
    suggestions: List[str]

class BioRequest(BaseModel):
    resume: Union[Dict[str, Any], str]
    job_role: str
    job_description: str

class BioResponse(BaseModel):
    job_role: str
    bio: str

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


@router.post("/parse-resume")
async def parse_resume_endpoint(file: UploadFile = File(...)):
    """
    Upload a resume PDF, parse its contents, and return structured JSON.
    """
    try:
        contents = await file.read()
        parsed_data = parse_resume_pdf(contents)
        
        return {
            "success": True,
            "data": parsed_data
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Failed to parse resume: {str(e)}"
        }

@router.post("/generate-bio", response_model=BioResponse)
async def generate_bio_endpoint(data: BioRequest):
    """
    Generate a tailored professional bio using RAG based on the resume and job description.
    """
    try:
        bio = process_bio_generation(data.resume, data.job_role, data.job_description)
        return BioResponse(job_role=data.job_role, bio=bio)
    except Exception as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=f"Failed to generate bio: {str(e)}")

class CustomizeRequest(BaseModel):
    resume_data: Dict[str, Any]
    job_description: str

@router.post("/customize-resume")
async def customize_resume(data: CustomizeRequest):
    """
    Customize a resume based on a job description using Claude.
    """
    try:
        customized_data = await customize_resume_for_job(data.resume_data, data.job_description)
        
        # Merge tailored sections with original data to calculate new scores
        merged_resume = data.resume_data.copy()
        if "experience" in customized_data:
            # Reconstruct responsibilities strings for scoring
            merged_experience = []
            for exp in customized_data["experience"]:
                bullets_text = []
                for bullet in exp.get("bullets", []):
                    # Combine all text segments into a single string for this bullet
                    text = "".join([segment.get("text", "") for segment in bullet.get("formatting", [])])
                    bullets_text.append(text)
                new_exp = exp.copy()
                new_exp["responsibilities"] = bullets_text
                merged_experience.append(new_exp)
            merged_resume["experience"] = merged_experience
            
        if "projects" in customized_data:
            merged_projects = []
            for proj in customized_data["projects"]:
                bullets_text = []
                for bullet in proj.get("bullets", []):
                    text = "".join([segment.get("text", "") for segment in bullet.get("formatting", [])])
                    bullets_text.append(text)
                new_proj = proj.copy()
                new_proj["description"] = " ".join(bullets_text)
                merged_projects.append(new_proj)
            merged_resume["projects"] = merged_projects

        # Calculate new match score
        match_info = calculate_resume_score_vs_jd(merged_resume, data.job_description)
        new_match_score = match_info["match_score"]
        
        # Calculate new total ATS score
        ats_info = calculate_resume_score(merged_resume)
        new_total_score = ats_info["total_score"]

        return {
            "success": True, 
            "data": customized_data,
            "new_match_score": new_match_score,
            "new_total_score": new_total_score
        }
    except Exception as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=str(e))


class HTMLPDFRequest(BaseModel):
    html: str

@router.post("/export/pdf")
async def export_pdf(request: HTMLPDFRequest):
    try:
        pdf_buffer = generate_pdf_from_html(request.html)
        return StreamingResponse(
            pdf_buffer, 
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=resume.pdf"}
        )
    except Exception as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=str(e))

class DocxExportRequest(BaseModel):
    resume_data: Dict[str, Any]

@router.post("/export/docx")
async def export_docx(request: DocxExportRequest):
    try:
        doc_buffer = generate_docx_from_data(request.resume_data)
        return StreamingResponse(
            doc_buffer,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": "attachment; filename=resume.docx"}
        )
    except Exception as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=str(e))

