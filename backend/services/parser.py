"""
Resume Parser Service
Extracts and structures data from PDF resumes.
"""

import re
import fitz  # PyMuPDF
from typing import Dict, Any, List

def parse_resume_pdf(pdf_bytes: bytes) -> Dict[str, Any]:
    """
    Parse a resume PDF and extract structured data.
    """
    print("--- Starting Resume Parsing ---")
    # Extract text from PDF
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    doc.close()

    print(f"Extracted {len(text)} characters of text")

    # Initialize structured data
    data = {
        "personal": {
            "fullName": "",
            "email": "",
            "phone": "",
            "location": "",
            "linkedIn": "",
            "github": "",
            "portfolio": ""
        },
        "education": [],
        "skills": {
            "technical": [],
            "tools": [],
            "soft": []
        },
        "experience": [],
        "projects": [],
        "achievements": [],
        "target": {
            "jobRole": "",
            "experienceLevel": "fresher"
        }
    }

    # 1. Extract Personal Info (Regex based)
    data["personal"]["email"] = _extract_email(text)
    data["personal"]["phone"] = _extract_phone(text)
    data["personal"]["fullName"] = _extract_name(text)
    data["personal"]["linkedIn"] = _extract_linkedin(text)
    data["personal"]["github"] = _extract_github(text)
    
    print(f"Extracted Personal Info: {data['personal']}")

    # 2. Extract Sections (Heuristic based)
    sections = _split_into_sections(text)
    print(f"Detected sections: {list(sections.keys())}")
    
    if "education" in sections:
        data["education"] = _parse_education_section(sections["education"])
    
    if "experience" in sections:
        data["experience"] = _parse_experience_section(sections["experience"])
    
    if "skills" in sections:
        all_skills = _extract_list_items(sections["skills"])
        print(f"Extracted {len(all_skills)} total skills")
        
        # Split skills based on keyword heuristics or just spread them
        for skill in all_skills:
            skill_lower = skill.lower()
            if any(t in skill_lower for t in ["python", "java", "c++", "javascript", "react", "node", "sql", "html", "css", "mongodb"]):
                data["skills"]["technical"].append(skill)
            elif any(t in skill_lower for t in ["git", "docker", "aws", "vscode", "linux", "trello", "jira", "figma"]):
                data["skills"]["tools"].append(skill)
            else:
                # If we have space in tools/tech, put it there, otherwise soft
                if len(data["skills"]["technical"]) < 15:
                    data["skills"]["technical"].append(skill)
                elif len(data["skills"]["tools"]) < 10:
                    data["skills"]["tools"].append(skill)
                else:
                    data["skills"]["soft"].append(skill)
        
        # Remove duplicates
        data["skills"]["technical"] = list(set(data["skills"]["technical"]))
        data["skills"]["tools"] = list(set(data["skills"]["tools"]))
        data["skills"]["soft"] = list(set(data["skills"]["soft"]))
    
    if "projects" in sections:
        data["projects"] = _parse_projects_section(sections["projects"])
        
    if "achievements" in sections:
        data["achievements"] = _extract_list_items(sections["achievements"])

    print("--- Parsing Complete ---")
    return data

def _extract_email(text: str) -> str:
    match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
    return match.group(0) if match else ""

def _extract_phone(text: str) -> str:
    # Matches various phone formats
    match = re.search(r'(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}', text)
    return match.group(0) if match else ""

def _extract_name(text: str) -> str:
    # Usually the first 1-2 lines contain the name, but skip common labels
    lines = [l.strip() for l in text.strip().split('\n') if l.strip()]
    skip_keywords = ["resume", "cv", "curriculum", "vitae", "portfolio", "profile", "contact"]
    
    for line in lines[:8]:
        # Skip if it's too short or too long
        if len(line.split()) > 4 or len(line) < 3: continue
        # Skip if it contains email/phone/github
        if "@" in line or any(d in line for d in "0123456789") or "/" in line: continue
        # Skip common headers
        if any(kw in line.lower() for kw in skip_keywords): continue
        
        return line
    return lines[0] if lines else ""

def _extract_linkedin(text: str) -> str:
    match = re.search(r'(linkedin\.com/in/[\w-]+)', text, re.I)
    return match.group(0) if match else ""

def _extract_github(text: str) -> str:
    match = re.search(r'(github\.com/[\w-]+)', text, re.I)
    return match.group(0) if match else ""

def _split_into_sections(text: str) -> Dict[str, str]:
    sections = {}
    
    # Common section headers as regex patterns
    header_patterns = {
        "education": r'^.*(education|academic|qualifications|schooling|educational).*$',
        "experience": r'^.*(experience|work|employment|history|professional|career).*$',
        "skills": r'^.*(skills|technical skills|expertise|competencies|tools|technologies).*$',
        "projects": r'^.*(projects|personal projects|portfolio|key projects).*$',
        "achievements": r'^.*(achievements|awards|honors|certifications|extracurriculars).*$'
    }
    
    lines = text.split('\n')
    current_section = "personal"
    section_content = []
    
    for line in lines:
        clean_line = line.strip()
        if not clean_line: continue
        
        found_section = None
        # Only check for header if the line is short (typical of headers)
        if len(clean_line) < 40:
            for section_name, pattern in header_patterns.items():
                if re.match(pattern, clean_line, re.I):
                    found_section = section_name
                    break
        
        if found_section:
            if current_section:
                sections[current_section] = sections.get(current_section, "") + '\n' + '\n'.join(section_content)
            current_section = found_section
            section_content = []
        else:
            section_content.append(line)
            
    if current_section:
        sections[current_section] = sections.get(current_section, "") + '\n' + '\n'.join(section_content)
        
    return {k: v.strip() for k, v in sections.items()}

def _parse_education_section(content: str) -> List[Dict]:
    items = []
    # Degrees and common schooling terms
    degree_keywords = ["bachelor", "master", "phd", "b.tech", "m.tech", "b.e", "b.sc", "diploma", "school", "university", "college"]
    
    blocks = re.split(r'\n\s*\n', content)
    for block in blocks:
        lines = [l.strip() for l in block.split('\n') if l.strip()]
        if not lines: continue
        
        # Heuristic: the line containing a degree keyword is the degree
        degree_line = ""
        college_line = ""
        for line in lines:
            if any(kw in line.lower() for kw in degree_keywords):
                degree_line = line
                break
        
        if degree_line:
            idx = lines.index(degree_line)
            # College is usually nearby
            college_line = lines[idx+1] if idx+1 < len(lines) else (lines[idx-1] if idx > 0 else "")
            
            years = re.findall(r'\b(20\d{2})\b', block)
            start = years[0] if len(years) > 1 else ""
            end = years[1] if len(years) > 1 else (years[0] if len(years) == 1 else "")
            
            items.append({
                "degree": degree_line,
                "college": college_line,
                "startYear": start,
                "endYear": end,
                "cgpa": ""
            })
            
    return items if items else [{"degree": content.split('\n')[0], "college": "", "startYear": "", "endYear": "", "cgpa": ""}]

def _parse_experience_section(content: str) -> List[Dict]:
    # Split by double newlines or lines that look like "Date - Date" or "Present"
    # Actually, let's keep it simple but look for company/role
    items = []
    blocks = re.split(r'\n\s*\n', content)
    for block in blocks:
        lines = [l.strip() for l in block.split('\n') if l.strip()]
        if len(lines) < 2: continue
        
        # Check if line looks like a date range
        date_match = re.search(r'\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|20\d{2}|present)\b', block, re.I)
        
        items.append({
            "company": lines[0],
            "role": lines[1],
            "startDate": "", # Parsing dates precisely is hard without NLP
            "endDate": "",
            "responsibilities": [l for l in lines[2:] if len(l) > 10][:5]
        })
    
    return items if items else [{"company": "Experience Found", "role": "Details inside", "startDate": "", "endDate": "", "responsibilities": [content[:200]]}]

def _parse_projects_section(content: str) -> List[Dict]:
    items = []
    # Project blocks are usually separated by 2+ newlines or specific indicators
    blocks = re.split(r'\n\s*\n', content)
    
    for block in blocks:
        lines = [l.strip() for l in block.split('\n') if l.strip()]
        if not lines: continue
        
        # Heuristic: First line is the title/header
        title_line = lines[0]
        tech_stack = []
        
        # 1. Extraction of Tech Stack from Title line (Common in resumes)
        # Patterns: "(React, Node)", "| React, Node", "- Python, AWS"
        for sep in [r'\(', r'\|', r'\-', r':']:
            m = re.search(sep + r'\s*(.*)', title_line)
            if m:
                potential_tech = m.group(1).strip()
                # If it's in parens, remove the closing one
                if sep == r'\(': potential_tech = potential_tech.rstrip(')')
                
                # Verify if it looks like a tech stack (short tags)
                tags = _extract_list_items(potential_tech)
                if tags and len(tags) < 10:
                    tech_stack.extend(tags)
                    # Clean title line for the actual name
                    title_line = title_line[:m.start()].strip()
                    break

        # 2. Sequential Extraction from the rest of the lines
        description_lines = []
        for line in lines[1:]:
            # Check for specific "Stack" or "Technologies" labels
            tech_label_match = re.search(r'\b(tech|stack|technologies|tools|built with|used):\s*(.*)', line, re.I)
            if tech_label_match:
                tech_stack.extend(_extract_list_items(tech_label_match.group(2)))
                continue
            
            # Clean bullet points and symbols
            clean_line = re.sub(r'^[\-\*•#\>]\s*', '', line)
            if clean_line:
                description_lines.append(clean_line)
        
        # Final Title cleanup (Remove common suffix symbols)
        title = title_line.strip().rstrip(':').strip()
        
        if title and len(title) > 2:
            # Join description lines but keep them relatively concise
            full_description = " ".join(description_lines)
            
            items.append({
                "title": title,
                "description": full_description if full_description else "Successfully implemented this project.",
                "techStack": list(set(tech_stack))
            })
            
    return items if items else [{"title": "Major Project", "description": "Successfully completed a significant engineering project.", "techStack": []}]

def _extract_list_items(content: str) -> List[str]:
    items = []
    # Split by common delimiters
    parts = re.split(r'[,•\|\n\t;]', content)
    for part in parts:
        clean = part.strip()
        # Remove category labels (e.g. "Languages: Python" -> "Python")
        clean = re.sub(r'^.*:\s*', '', clean)
        # Clean up bullet points and common punctuation
        clean = re.sub(r'^[\-\*•#\>]\s*', '', clean)
        clean = clean.strip().rstrip('.')
        
        if clean and len(clean) > 1 and len(clean) < 40:
            if clean.lower() not in ["skills", "technical", "tools", "soft"]:
                items.append(clean)
    return items
