import fitz  # PyMuPDF
import re

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract all text from a PDF file."""
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    return text

def detect_sections(text: str) -> dict:
    """
    Rudimentary section detection to split resume into Education, Experience, Skills.
    """
    sections = {"experience": "", "education": "", "skills": ""}
    
    # Common headers
    exp_headers = r"^(EXPERIENCE|WORK HISTORY|EMPLOYMENT|WORK EXPERIENCE)"
    edu_headers = r"^(EDUCATION|ACADEMIC BACKGROUND)"
    skill_headers = r"^(SKILLS|CORE COMPETENCIES|TECHNICAL SKILLS)"
    
    lines = text.split("\n")
    current_section = None
    
    for line in lines:
        upper_line = line.strip().upper()
        if re.match(exp_headers, upper_line):
            current_section = "experience"
            continue
        elif re.match(edu_headers, upper_line):
            current_section = "education"
            continue
        elif re.match(skill_headers, upper_line):
            current_section = "skills"
            continue
            
        if current_section and len(line.strip()) > 0:
            sections[current_section] += line + "\n"
            
    return sections
