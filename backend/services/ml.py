import logging
from typing import List, Dict, Any
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MLService:
    _instance = None
    _model = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MLService, cls).__new__(cls)
            cls._instance._initialize_model()
        return cls._instance

    def _initialize_model(self):
        """Initialize the sentence-transformer model."""
        try:
            logger.info("Loading sentence-transformers model...")
            # 'all-MiniLM-L6-v2' is a small and fast model producing 384-dimensional embeddings
            self._model = SentenceTransformer('all-MiniLM-L6-v2') 
            logger.info("Model loaded successfully.")
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            self._model = None

    def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding for a given text."""
        if not self._model:
            logger.warning("Model not loaded. Returning empty embedding.")
            return []
        
        if not text or not text.strip():
            return []

        try:
            embedding = self._model.encode(text)
            return embedding.tolist()
        except Exception as e:
            logger.error(f"Error generating embedding: {e}")
            return []

    def predict_audience(self, job_description: str, users: List[Dict[str, Any]]) -> Dict[str, float]:
        """
        Predict audience distribution for a job description based on user embeddings.
        Returns a dictionary with percentage breakdown by experience level.
        """
        if not self._model or not users:
            return {
                "students": 0,
                "entry_level": 0,
                "mid_level": 0,
                "senior_level": 0
            }

        # Generate embedding for job description
        job_embedding = self.generate_embedding(job_description)
        if not job_embedding:
            return {}

        # Prepare user embeddings and metadata
        user_embeddings = []
        valid_users = []

        for user in users:
            embedding = user.get("embedding")
            if embedding and len(embedding) == 384: # Ensure correct dimension
                user_embeddings.append(embedding)
                valid_users.append(user)

        if not user_embeddings:
            return {
                "students": 0,
                "entry_level": 0,
                "mid_level": 0,
                "senior_level": 0
            }

        # Calculate cosine similarity
        similarities = cosine_similarity([job_embedding], user_embeddings)[0]

        # Get top 100 users (or fewer if less users)
        # We want indices of top scores
        top_indices = np.argsort(similarities)[-100:]
        
        # Analyze top users
        distribution = {
            "students": 0,
            "entry_level": 0,
            "mid_level": 0,
            "senior_level": 0
        }

        total_top_users = len(top_indices)
        
        for idx in top_indices:
            user = valid_users[idx]
            role = user.get("role")
            
            # Simple heuristic mapping based on experience string in resumeData
            # This relies on the 'required_experience' format or manual entry in resume
            # For now, we'll try to guess based on profile data if available
            
            experience = "entry_level" # Default
            
            resume_data = user.get("profile", {}).get("resumeData", {})
            if resume_data:
                # Check experience list length or specific fields
                exp_list = resume_data.get("experience", [])
                years_of_exp = 0
                
                # Check for "Student" in bio or current role
                bio = user.get("profile", {}).get("bio", "").lower()
                if "student" in bio or "university" in bio:
                    experience = "students"
                elif exp_list:
                    # Rough estimation: 1 year per entry if no dates parsing
                    # Ideally we parse dates but keeping it simple for now
                    years_of_exp = len(exp_list) 
                    
                    if years_of_exp >= 5:
                        experience = "senior_level"
                    elif years_of_exp >= 2:
                        experience = "mid_level"
                    else:
                        experience = "entry_level"
                else:
                     # If no experience listed, assume student or entry level
                     experience = "students"

            distribution[experience] += 1

        # Normalize to percentages
        if total_top_users > 0:
            for key in distribution:
                distribution[key] = round(distribution[key] / total_top_users, 2)

        return distribution

