import json
import random
import os
import sys
from faker import Faker
from datasets import load_dataset

# Add parent dir to path to import app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.services.scorer import evaluate_resume
from app.services.nlp_utils import extract_skills_from_text

fake = Faker()

def generate_synthetic_dataset(output_file: str, num_samples: int = 1000):
    """
    Generate a synthetic dataset of Resumes and Job Descriptions with ATS scores.
    """
    print(f"Loading datasets to synthesize {num_samples} pairs...")
    
    try:
        jd_dataset = load_dataset("jacob-hugging-face/job-descriptions", split="train")
        jds = [item["job_description"] for item in jd_dataset if item.get("job_description")]
    except Exception as e:
        print(f"Warning: Could not load JD dataset from HF: {e}")
        jds = [
            "Looking for a software engineer with Python, Django, and React experience. Required 3 years of ML and SQL.",
            "Data Scientist needed. Must know Python, Machine Learning, TensorFlow, PyTorch. Required PhD or Masters.",
            "Frontend developer with Vue, React, JavaScript, HTML, CSS. Minimum 2 years experience."
        ]
        
    print(f"Loaded {len(jds)} job descriptions. Starting synthesis...")
    
    common_skills = ["Python", "Java", "C++", "C#", "JavaScript", "TypeScript", "React", "Angular", "Vue", "Node", 
    "SQL", "MySQL", "AWS", "Azure", "Docker", "Kubernetes", "Machine Learning", "FastAPI", "Django", "Flask", 
    "PyTorch", "TensorFlow", "Git", "Agile", "REST API", "HTML", "CSS", "Linux"]
    
    dataset = []
    
    for i in range(num_samples):
        jd = random.choice(jds)
        
        match_quality = random.choices(["high", "medium", "low"], weights=[0.2, 0.5, 0.3])[0]
        
        skills_to_include = []
        if match_quality == "high":
            jd_skills = extract_skills_from_text(jd)
            skills_to_include = jd_skills + random.sample(common_skills, k=min(3, len(common_skills)))
        elif match_quality == "medium":
            skills_to_include = random.sample(common_skills, k=8)
        else:
            skills_to_include = random.sample(common_skills, k=4)
            
        resume_text = f"NAME: {fake.name()}\n\n"
        resume_text += f"SUMMARY: {fake.catch_phrase()}\n\n"
        resume_text += f"SKILLS: {', '.join(skills_to_include)}\n\n"
        
        resume_text += "EXPERIENCE\n"
        for _ in range(random.randint(1, 3)):
            resume_text += f"{fake.job()} at {fake.company()} ({random.randint(2015, 2020)} - Present)\n"
            if match_quality == "high" or match_quality == "medium":
                resume_text += f"Improved system performance by {random.randint(10, 50)}% using {' and '.join(skills_to_include[:2] if len(skills_to_include) >= 2 else ['technology'])}.\n"
            else:
                resume_text += f"{fake.bs()}.\n"
                
        resume_text += "\nEDUCATION\n"
        degree = random.choice(["Bachelor of Science in Computer Science", "Master of Science", "B.A. Business", "PhD Machine Learning"])
        resume_text += f"{degree}, {fake.company()} University ({random.randint(2010, 2018)})\n"
        
        # Calculate 'ground truth' score using our scorer engine (for synth dataset purposes)
        try:
            eval_result = evaluate_resume(resume_text, jd)
            
            sample = {
                "id": f"sample_{i}",
                "job_description": jd,
                "resume_text": resume_text,
                "ats_score": eval_result["ats_score"],
                "skill_match": eval_result["skill_match"],
                "semantic_match": eval_result["semantic_match"],
                "missing_skills": eval_result["missing_skills"]
            }
            dataset.append(sample)
        except Exception as e:
            pass # Skip on token length errors or other parsing errors
            
        if (i+1) % 100 == 0:
            print(f"Generated {i+1}/{num_samples} samples")
            
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(dataset, f, indent=2)
        
    print(f"Dataset generated and saved to {output_file}")

if __name__ == "__main__":
    # Default to 10 for quick testing, but we provide the capability for 10k
    samples_to_generate = 10 
    if len(sys.argv) > 1:
        samples_to_generate = int(sys.argv[1])
    generate_synthetic_dataset("dataset.json", samples_to_generate)
