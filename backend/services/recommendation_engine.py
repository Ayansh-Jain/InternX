import logging
import time
from typing import List, Dict, Any, Tuple
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from datetime import datetime

from services.linucb_bandit import get_bandit

logger = logging.getLogger(__name__)

class RecommendationEngine:
    _instance = None
    _vocab_cache = {}
    _vocab_cache_time = 0
    _vocab_cache_ttl = 300  # 5 minutes

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(RecommendationEngine, cls).__new__(cls)
        return cls._instance

    def _normalize_text(self, text: str) -> str:
        """Simple text normalization."""
        if not text:
            return ""
        return text.strip().lower()

    def build_vocabulary(self, jobs: List[Dict[str, Any]]) -> Dict[str, int]:
        """
        Build a vocabulary from all jobs for one-hot encoding.
        Returns a dictionary mapping strings to indices.
        """
        current_time = time.time()
        if self._vocab_cache and (current_time - self._vocab_cache_time) < self._vocab_cache_ttl:
            return self._vocab_cache

        vocab_set = set()
        for job in jobs:
            # Add skills
            for skill in job.get("required_skills", []):
                vocab_set.add(f"skill_{self._normalize_text(skill)}")
            
            # Add employment type
            emp_type = job.get("employment_type")
            if emp_type:
                vocab_set.add(f"type_{self._normalize_text(str(emp_type))}")
                
            # Add location
            location = job.get("location")
            if location:
                vocab_set.add(f"loc_{self._normalize_text(location)}")
                
            # Add experience
            exp = job.get("required_experience")
            if exp:
                vocab_set.add(f"exp_{self._normalize_text(exp)}")

        # Create mapping
        vocab = {term: idx for idx, term in enumerate(sorted(vocab_set))}
        
        self._vocab_cache = vocab
        self._vocab_cache_time = current_time
        logger.info(f"Built recommendation vocabulary with {len(vocab)} terms")
        
        return vocab

    def job_to_feature_vector(self, job: Dict[str, Any], vocab: Dict[str, int]) -> List[float]:
        """
        Convert a job document into a one-hot encoded numerical vector.
        """
        if not vocab:
            return []

        vector = np.zeros(len(vocab))
        
        # Add skills
        for skill in job.get("required_skills", []):
            term = f"skill_{self._normalize_text(skill)}"
            if term in vocab:
                vector[vocab[term]] = 1.0
                
        # Add employment type
        emp_type = job.get("employment_type")
        if emp_type:
            term = f"type_{self._normalize_text(str(emp_type))}"
            if term in vocab:
                vector[vocab[term]] = 1.0
                
        # Add location
        location = job.get("location")
        if location:
            term = f"loc_{self._normalize_text(location)}"
            if term in vocab:
                vector[vocab[term]] = 1.0
                
        # Add experience
        exp = job.get("required_experience")
        if exp:
            term = f"exp_{self._normalize_text(exp)}"
            if term in vocab:
                vector[vocab[term]] = 1.0

        num_features = np.sum(vector)
        # Normalize the job vector so jobs with many skills don't dominate
        if num_features > 0:
            vector = vector / np.sqrt(num_features)

        return vector.tolist()

    def update_preference_vector(
        self, 
        current_vector: List[float], 
        job_vector: List[float], 
        action: str,
        vocab_size: int
    ) -> List[float]:
        """
        Update a user's preference vector based on an interaction.
        Weights: view=1, click=2, apply=3, like=4.
        """
        weights = {
            "view": 1.0,
            "click": 2.0,
            "apply": 3.0,
            "like": 4.0
        }
        
        weight = weights.get(action, 1.0)
        
        if not current_vector or len(current_vector) != vocab_size:
            current_np = np.zeros(vocab_size)
        else:
            current_np = np.array(current_vector)
            
        if not job_vector or len(job_vector) != vocab_size:
            job_np = np.zeros(vocab_size)
        else:
            job_np = np.array(job_vector)

        # Update and apply decay to old preferences implicitly by adding normalized values
        updated_np = current_np + (weight * job_np)
        
        # L2 Normalize the updated user vector
        norm = np.linalg.norm(updated_np)
        if norm > 0:
            updated_np = updated_np / norm
            
        return updated_np.tolist()

    def get_recommendations(
        self, 
        user_vector: List[float], 
        jobs: List[Dict[str, Any]], 
        vocab: Dict[str, int],
        applied_job_ids: set,
        limit: int = 20
    ) -> List[Tuple[Dict[str, Any], int]]:
        """
        Get recommended jobs for a user vector.
        Returns a list of tuples (job, recommendation_score).
        Applies an 80/20 explore/exploit split.
        """
        if not jobs:
            return []

        vocab_size = len(vocab)
        valid_jobs = []
        job_vectors = []
        
        for job in jobs:
            job_id_str = str(job.get("_id"))
            if job_id_str not in applied_job_ids:
                vector = self.job_to_feature_vector(job, vocab)
                if len(vector) == vocab_size:
                    valid_jobs.append(job)
                    job_vectors.append(vector)

        if not valid_jobs:
            return []

        # If user vector is empty or invalid, fallback to recency
        if not user_vector or len(user_vector) != vocab_size or np.sum(user_vector) == 0:
            logger.info("Cold start: returning most recent jobs")
            # Return sorted by recency
            recent_jobs = sorted(valid_jobs, key=lambda x: x.get("created_at", datetime.min), reverse=True)[:limit]
            return [(job, 0) for job in recent_jobs]

        # ── Blended LinUCB + cosine scoring ───────────────────────────────
        # cosine gives a safe baseline; bandit contribution grows as it learns.
        # Blend: 40% cosine + 60% UCB (both normalised to [0,1] before mixing).
        bandit = get_bandit()
        user_np = np.array(user_vector, dtype=np.float64)
        scored_jobs_raw = []

        for job, job_vec in zip(valid_jobs, job_vectors):
            job_np = np.array(job_vec, dtype=np.float64)

            # Cosine similarity → [0, 1] (already in [-1,1], clip low end)
            cos_sim = float(cosine_similarity([user_np], [job_np])[0][0])
            cos_norm = float(np.clip((cos_sim + 1) / 2, 0, 1))

            # LinUCB UCB score; normalise with sigmoid so it's on [0,1]
            job_id_str = str(job.get("_id", ""))
            context = np.concatenate([user_np, job_np])
            ucb_raw = bandit.score(job_id_str, context)
            ucb_norm = float(1 / (1 + np.exp(-ucb_raw)))  # sigmoid

            # Blended final score scaled to 0-100
            final = 0.4 * cos_norm + 0.6 * ucb_norm
            scored_jobs_raw.append((job, int(round(final * 100))))

        scored_jobs = scored_jobs_raw
        scored_jobs.sort(key=lambda x: x[1], reverse=True)
        
        # 80/20 split: 80% top matches, 20% random from the rest (exploration)
        top_count = int(limit * 0.8)
        random_count = limit - top_count
        
        top_jobs = scored_jobs[:top_count]
        remaining_jobs = scored_jobs[top_count:]
        
        final_jobs = top_jobs
        if remaining_jobs and random_count > 0:
            # Select random jobs with probability proportional to their score (roulette wheel selection)
            # or simply uniform random to ensure exploration
            np.random.shuffle(remaining_jobs)
            final_jobs.extend(remaining_jobs[:random_count])
            
        return final_jobs[:limit]

class RecommendationCache:
    """Simple in-memory TTL cache for recommendations."""
    _instance = None
    _cache = {}
    _ttl = 60  # 60 seconds

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(RecommendationCache, cls).__new__(cls)
        return cls._instance

    def get(self, key: str) -> Any:
        entry = self._cache.get(key)
        if entry:
            if (time.time() - entry['time']) < self._ttl:
                return entry['data']
            else:
                del self._cache[key]
        return None

    def set(self, key: str, data: Any):
        self._cache[key] = {
            'data': data,
            'time': time.time()
        }

    def invalidate(self, key: str):
        if key in self._cache:
            del self._cache[key]
