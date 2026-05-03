from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from typing import Optional
import uvicorn
from app.services.scorer import evaluate_resume
from app.services.parser import extract_text_from_pdf

app = FastAPI(
    title="ATS Scoring API",
    description="Evaluate resumes against job descriptions based on semantic similarity and skill matching.",
    version="1.0.0"
)

class ATSRequest(BaseModel):
    resume_text: str
    job_description: str

class ATSResponse(BaseModel):
    ats_score: float
    skill_match: float
    semantic_match: float
    missing_skills: list[str]
    matched_skills: list[str]
    suggestions: list[str]

@app.post("/ats-score", response_model=ATSResponse)
async def score_resume_text(request: ATSRequest):
    """
    Score a resume provided as raw text against a job description.
    """
    if not request.resume_text.strip() or not request.job_description.strip():
        raise HTTPException(status_code=400, detail="Must provide both resume_text and job_description")
        
    result = evaluate_resume(request.resume_text, request.job_description)
    return result

@app.post("/ats-score-pdf", response_model=ATSResponse)
async def score_resume_pdf(
    job_description: str = Form(...),
    resume_pdf: UploadFile = File(...)
):
    """
    Score a resume provided as a PDF upload against a job description.
    """
    if not resume_pdf.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Uploaded file must be a PDF")
        
    try:
        contents = await resume_pdf.read()
        resume_text = extract_text_from_pdf(contents)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse PDF: {str(e)}")
        
    if not resume_text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from the provided PDF")
        
    result = evaluate_resume(resume_text, job_description)
    return result

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
