import urllib.request
import urllib.error
import urllib.parse
import json

# Mock Resume Data
mock_resume = {
    "personal": {"fullName": "John Doe", "email": "john.doe@example.com"},
    "skills": {
        "technical": ["Python", "JavaScript", "React", "Node.js", "FastAPI"],
        "tools": ["Git", "Docker", "AWS"],
        "soft": ["Agile", "Problem Solving"]
    },
    "experience": [
        {
            "company": "Tech Corp",
            "role": "Software Engineer",
            "startDate": "2020",
            "endDate": "Present",
            "responsibilities": ["Developed REST APIs", "Optimized database queries"]
        }
    ],
    "projects": [
        {
            "title": "E-commerce Platform",
            "description": "A full-stack e-commerce site",
            "techStack": ["React", "Node.js", "MongoDB"],
            "achievements": "Increased sales by 20%"
        },
        {
            "title": "Machine Learning Model",
            "description": "Predicting customer churn",
            "techStack": ["Python", "scikit-learn", "Pandas"],
            "achievements": "Achieved 95% accuracy"
        }
    ],
    "education": [
        {
            "degree": "B.S. Computer Science",
            "college": "State University",
            "startYear": "2016",
            "endYear": "2020"
        }
    ]
}

url = "http://localhost:8000/api/generate-bio"

payload = {
    "resume": mock_resume,
    "job_role": "Software Engineer",
    "job_description": "We are looking for a Software Engineer with experience in Python, FastAPI, and React. You will be building scalable web applications."
}

print("Testing exact endpoint with dict...")
try:
    req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json'})
    response = urllib.request.urlopen(req)
    print(f"Status Code: {response.getcode()}")
    print(json.loads(response.read().decode('utf-8')))
except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code}")
    print(e.read().decode('utf-8'))
except Exception as e:
    print(f"Error: {e}")

print("Testing endpoint with string...")
payload_str = {
    "resume": json.dumps(mock_resume, indent=2),
    "job_role": "Machine Learning Engineer",
    "job_description": "Looking for an ML engineer with experience in Python, scikit-learn, and data modeling."
}

try:
    req = urllib.request.Request(url, data=json.dumps(payload_str).encode('utf-8'), headers={'Content-Type': 'application/json'})
    response = urllib.request.urlopen(req)
    print(f"Status Code: {response.getcode()}")
    print(json.loads(response.read().decode('utf-8')))
except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code}")
    print(e.read().decode('utf-8'))
except Exception as e:
    print(f"Error: {e}")
