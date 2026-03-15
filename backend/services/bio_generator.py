import os
from typing import List, Dict, Any
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from dotenv import load_dotenv

load_dotenv()

# We lazy-load the embedder to avoid slowing down API startup until it's actually used
_embedder = None

def get_embedder():
    global _embedder
    if _embedder is None:
        from sentence_transformers import SentenceTransformer
        # using the standard fast and small model
        _embedder = SentenceTransformer('all-MiniLM-L6-v2')
    return _embedder

def chunk_resume(resume_data: Any) -> List[str]:
    chunks = []
    
    if isinstance(resume_data, str):
        return [c.strip() for c in resume_data.split('\n\n') if len(c.strip()) > 10]
    
    # Skills chunk
    skills = resume_data.get("skills", {})
    if isinstance(skills, dict):
        tech_skills = skills.get("technical", []) or []
        tools = skills.get("tools", []) or []
        soft = skills.get("soft", []) or []
        all_skills = tech_skills + tools + soft
        if all_skills:
            chunks.append("Skills: " + ", ".join(all_skills))
            
    # Experience chunks
    experiences = resume_data.get("experience", [])
    for exp in experiences:
        company = exp.get("company", "")
        role = exp.get("role", "")
        resp = " ".join(exp.get("responsibilities", []) or [])
        exp_text = f"Experience at {company} as {role}: {resp}"
        if company or role or resp:
            chunks.append(exp_text)
            
    # Project chunks
    projects = resume_data.get("projects", [])
    for proj in projects:
        title = proj.get("title", "")
        desc = proj.get("description", "")
        tech_list = proj.get("techStack", []) or []
        tech = ", ".join(tech_list)
        achievements = proj.get("achievements", "")
        proj_text = f"Project {title} built with {tech}. Description: {desc}. Achievements: {achievements}"
        if title or desc:
            chunks.append(proj_text)
            
    # Education chunks
    educations = resume_data.get("education", [])
    for ed in educations:
        degree = ed.get("degree", "")
        college = ed.get("college", "")
        ed_text = f"Education: {degree} at {college}"
        if degree or college:
            chunks.append(ed_text)
            
    return chunks

def retrieve_relevant_chunks(chunks: List[str], query: str, top_k: int = 4) -> List[str]:
    if not chunks:
        return []
    
    embedder = get_embedder()
    
    # Generate embeddings
    chunk_embeddings = embedder.encode(chunks)
    query_embedding = embedder.encode([query])
    
    # Calculate similarities mapping
    similarities = cosine_similarity(query_embedding, chunk_embeddings)[0]
    
    # Get top k indices
    top_indices = np.argsort(similarities)[::-1][:top_k]
    
    return [chunks[i] for i in top_indices]

def generate_bio_with_llm(relevant_chunks: List[str], job_role: str, job_description: str) -> str:
    from groq import Groq
    
    # Check for Groq key first, fallback to OpenAI if they actually have a paid one
    groq_key = os.environ.get("GROQ_API_KEY")
    openai_key = os.environ.get("OPENAI_API_KEY")
    
    if not groq_key and not openai_key:
        raise ValueError("GROQ_API_KEY environment variable is not set. Please get a free API key from console.groq.com and set it in your .env file.")
        
    context = "\n---\n".join(relevant_chunks)
    
    prompt = f"""You are an expert resume writer and recruiter assistant.

Your task is to generate a professional bio tailored to a specific job application.

You will receive:
* job role: {job_role}
* job description: {job_description}
* relevant sections from a candidate's resume:
{context}

Write a concise professional bio that highlights the candidate's most relevant skills and projects.

Guidelines:
* 80 to 120 words
* first person professional tone (e.g., "I am a skilled...", "My experience includes...")
* ATS friendly formatting
* align strictly with the job description
* only use information present in the resume
* highlight relevant projects

CRITICAL INSTRUCTIONS: 
- Output ONLY the raw bio text.
- Do NOT include any conversational preamble (e.g., "Here is a tailored bio:").
- Do NOT include any concluding remarks, watermarks, or caveats (e.g., do NOT say "This bio was AI-optimized").
- Do NOT wrap the bio in quotation marks.

Write the bio now:
"""

    if groq_key:
        client = Groq(api_key=groq_key)
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",  # Fast, free tier model
            messages=[
                {"role": "system", "content": "You are a professional resume writer and recruiter assistant. You must obey all formatting constraints perfectly without adding your own commentary."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=250
        )
    else:
        from openai import OpenAI
        client = OpenAI(api_key=openai_key)
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a professional resume writer and recruiter assistant. You must obey all formatting constraints perfectly without adding your own commentary."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=250
        )
        
    return response.choices[0].message.content.strip()

def process_bio_generation(resume_data: Dict[str, Any], job_role: str, job_description: str) -> str:
    # 1. Chunk resume
    chunks = chunk_resume(resume_data)
    
    # 2. Retrieve relevant chunks
    relevant_chunks = retrieve_relevant_chunks(chunks, job_description, top_k=4)
    
    # 3. Generate bio
    bio = generate_bio_with_llm(relevant_chunks, job_role, job_description)
    
    return bio
