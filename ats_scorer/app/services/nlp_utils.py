import spacy
from sentence_transformers import SentenceTransformer, util
import re

# Load models (this takes some time on first import)
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    # If not found, download it programmatically
    import spacy.cli
    spacy.cli.download("en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

try:
    embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
except Exception as e:
    print(f"Error loading sentence-transformers model: {e}")
    embedding_model = None

# A mock ontology of skills for MVP purposes
COMMON_SKILLS = set([
    "python", "java", "c++", "c#", "javascript", "typescript", "react", "angular", "vue", "node", 
    "node.js", "sql", "mysql", "postgresql", "mongodb", "nosql", "aws", "azure", "gcp", "docker",
    "kubernetes", "k8s", "machine learning", "ml", "deep learning", "ai", "fastapi", "django", "flask", 
    "pytorch", "tensorflow", "keras", "nlp", "data science", "git", "github", "gitlab", "cicd",
    "agile", "scrum", "project management", "excel", "communication", "leadership", "rest api", "graphql",
    "html", "css", "linux", "bash", "shell"
])

def extract_skills_from_text(text: str) -> list[str]:
    """
    Extract potential skills from text using NLP and regex.
    """
    found_skills = set()
    text_lower = text.lower()
    
    for skill in COMMON_SKILLS:
        if re.search(r'\b' + re.escape(skill) + r'\b', text_lower):
            found_skills.add(skill)
            
    return list(found_skills)

def extract_keywords_from_text(text: str) -> list[str]:
    """
    Extract important keywords (nouns, proper nouns) from text using spaCy.
    """
    doc = nlp(text)
    keywords = set()
    for token in doc:
        if token.is_alpha and not token.is_stop and len(token.text) > 2:
            if token.pos_ in ["NOUN", "PROPN"]:
                keywords.add(token.text.lower())
    return list(keywords)

def calculate_semantic_similarity(text1: str, text2: str) -> float:
    """
    Calculate the cosine similarity between two texts using Sentence Transformers.
    """
    if not text1 or not text2 or embedding_model is None:
        return 0.0
        
    embeddings1 = embedding_model.encode(text1, convert_to_tensor=True)
    embeddings2 = embedding_model.encode(text2, convert_to_tensor=True)
    
    cosine_scores = util.cos_sim(embeddings1, embeddings2)
    return float(cosine_scores[0][0])
