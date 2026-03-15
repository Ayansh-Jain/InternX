import json
from app.services.scorer import evaluate_resume

if __name__ == "__main__":
    job_description = """
    We are looking for a Backend Software Engineer. 
    Requirements:
    - 3+ years of experience with Python and FastAPI.
    - Strong knowledge of SQL databases like PostgreSQL.
    - Experience deploying with Docker and AWS.
    - Familiarity with CI/CD pipelines (Git, GitHub Actions, Agile).
    - Bachelors Degree in Computer Science or related field.
    """
    
    resume_text = """
    John Doe
    Backend Developer
    
    SKILLS
    Python, Django, FastAPI, PostgreSQL, MongoDB, Git, Docker
    
    EXPERIENCE
    Software Engineer at TechCorp (2020 - Present)
    - Developed REST APIs using Python and FastAPI.
    - Improved database query performance by 40% in PostgreSQL.
    - Containerized applications using Docker.
    
    EDUCATION
    Bachelor of Science in Computer Science
    University of Somewhere (2016 - 2020)
    """
    
    print("\n================ ATS Scoring Example ================")
    print("Job Description Preview:", job_description.strip()[:100] + "...")
    print("Resume Preview:", resume_text.strip()[:100] + "...\n")
    print("Evaluating Resume against JD...\n")
    
    result = evaluate_resume(resume_text, job_description)
    
    print(json.dumps(result, indent=2))
    print("=====================================================\n")
