"""
REINFORCE Applicant Ranker — online learning MLP.

Replaces the keyword-overlap `calculate_match_percentage()` with a small
neural network that improves from every provider accept/reject decision.

Architecture:
    Input  (8)  → Linear(8→16) → ReLU → Linear(16→1) → Sigmoid → score ∈ [0,1]
    Total parameters: 8×16+16 + 16×1+1 = 161

Feature vector (8 dimensions):
    [0] skill_overlap_ratio        — existing formula, 0.0–1.0
    [1] experience_match           — 1 if level matches job req, else 0
    [2] embedding_cosine_sim       — cosine(resume_emb, job_emb), clipped to [0,1]
    [3] has_cover_letter           — 1/0
    [4] skills_count_norm          — user skill count / 30
    [5] job_skills_count_norm      — job required skills / 20
    [6] education_level            — 0=none, 0.33=associate, 0.67=bachelor, 1.0=master+
    [7] bio_job_title_overlap      — word overlap ratio bio ↔ job title

Online REINFORCE update (one step, Adam, lr=0.001):
    loss = −reward × log(predicted_score + ε)
    optimizer.zero_grad(); loss.backward(); optimizer.step()

Rewards:
    accepted     → +1.0
    shortlisted  → +0.5
    rejected     → −1.0
    other        →  no update
"""

import logging
import re
import threading
from pathlib import Path
from typing import Optional

import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim

logger = logging.getLogger(__name__)

FEATURE_DIM = 8
EPS = 1e-7  # numerical stability in log

# Reward mapping for provider decisions
STATUS_REWARDS = {
    "accepted":    1.0,
    "shortlisted": 0.5,
    "rejected":   -1.0,
}


# ── Network ───────────────────────────────────────────────────────────────────

class _RankerNet(nn.Module):
    def __init__(self, in_dim: int = FEATURE_DIM, hidden: int = 16):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(in_dim, hidden),
            nn.ReLU(),
            nn.Linear(hidden, 1),
            nn.Sigmoid(),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.net(x).squeeze(-1)


# ── Main class ────────────────────────────────────────────────────────────────

class ApplicantRanker:
    """
    Online REINFORCE ranker for applicant–job matching.

    Singleton — all routes share the same weights.
    Thread-safe via a single lock around forward + backward passes.
    """

    _instance: Optional["ApplicantRanker"] = None
    _lock = threading.Lock()

    def __new__(cls, lr: float = 0.001, weight_decay: float = 0.01):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    inst = super().__new__(cls)
                    inst._init(lr, weight_decay)
                    cls._instance = inst
        return cls._instance

    def _init(self, lr: float, weight_decay: float):
        self._model = _RankerNet()
        self._optimizer = optim.Adam(
            self._model.parameters(), lr=lr, weight_decay=weight_decay
        )
        self._update_lock = threading.Lock()
        logger.info(
            "ApplicantRanker initialized — %d parameters",
            sum(p.numel() for p in self._model.parameters()),
        )

    # ── Feature extraction ────────────────────────────────────────────────────

    def extract_features(self, user: dict, job: dict) -> torch.Tensor:
        """
        Build the 8-dimensional feature tensor from raw user/job dicts.
        Safe: returns zero-vector on any error.
        """
        try:
            feats = np.zeros(FEATURE_DIM, dtype=np.float32)

            profile = user.get("profile", {})
            resume_data = profile.get("resumeData", {}) or {}

            # ── [0] Skill overlap ratio ───────────────────────────────────────
            user_skills_raw: list = []
            skills_section = resume_data.get("skills", {}) or {}
            user_skills_raw.extend(skills_section.get("technical", []) or [])
            user_skills_raw.extend(skills_section.get("tools", []) or [])

            job_skills = job.get("required_skills", []) or []
            if job_skills:
                matched = sum(
                    1
                    for js in job_skills
                    if any(
                        _normalize_skill(js) in _normalize_skill(us)
                        or _normalize_skill(us) in _normalize_skill(js)
                        for us in user_skills_raw
                        if us
                    )
                )
                feats[0] = matched / len(job_skills)
            else:
                feats[0] = 0.75  # no requirements — assume decent match

            # ── [1] Experience level match ────────────────────────────────────
            job_req_exp = (job.get("required_experience") or "").lower()
            exp_list = resume_data.get("experience", []) or []
            user_exp_count = len(exp_list)

            # Map job requirement to expected year range
            if any(k in job_req_exp for k in ("entry", "junior", "0-1", "fresher", "intern")):
                feats[1] = 1.0 if user_exp_count <= 1 else 0.3
            elif any(k in job_req_exp for k in ("mid", "2-4", "2-5", "intermediate")):
                feats[1] = 1.0 if 1 < user_exp_count <= 4 else 0.4
            elif any(k in job_req_exp for k in ("senior", "5+", "lead", "principal")):
                feats[1] = 1.0 if user_exp_count >= 4 else 0.2
            else:
                feats[1] = 0.5  # unknown requirement

            # ── [2] Embedding cosine similarity ──────────────────────────────
            # Use pre-computed embeddings if available; skip if not (cold start)
            user_emb = user.get("embedding")
            job_emb = job.get("embedding")
            if user_emb and job_emb:
                u = np.array(user_emb, dtype=np.float32)
                j = np.array(job_emb, dtype=np.float32)
                norm_u = np.linalg.norm(u)
                norm_j = np.linalg.norm(j)
                if norm_u > 0 and norm_j > 0:
                    sim = float(np.dot(u, j) / (norm_u * norm_j))
                    feats[2] = float(np.clip((sim + 1) / 2, 0, 1))  # map [-1,1]→[0,1]
            else:
                feats[2] = feats[0]  # fall back to skill overlap as proxy

            # ── [3] Has cover letter ──────────────────────────────────────────
            # Populated at score() time from the application data
            # (set externally via the score_with_cover_letter flag)
            feats[3] = 0.0  # default; overridden in score()

            # ── [4] User skills count (normalized) ───────────────────────────
            feats[4] = min(1.0, len(user_skills_raw) / 30.0)

            # ── [5] Job required skills count (normalized) ───────────────────
            feats[5] = min(1.0, len(job_skills) / 20.0)

            # ── [6] Education level ───────────────────────────────────────────
            education = resume_data.get("education", []) or []
            edu_score = 0.0
            for edu in education:
                degree = (edu.get("degree") or "").lower()
                if any(k in degree for k in ("phd", "doctorate", "master", "mba", "ms ", "m.s")):
                    edu_score = max(edu_score, 1.0)
                elif any(k in degree for k in ("bachelor", "b.s", "b.tech", "be", "btech", "b.e")):
                    edu_score = max(edu_score, 0.67)
                elif any(k in degree for k in ("associate", "diploma")):
                    edu_score = max(edu_score, 0.33)
            feats[6] = edu_score

            # ── [7] Bio ↔ job title word overlap ─────────────────────────────
            bio = (profile.get("bio") or "").lower()
            job_title = (job.get("title") or "").lower()
            bio_words = set(re.findall(r"\b\w+\b", bio))
            title_words = set(re.findall(r"\b\w+\b", job_title))
            if title_words:
                feats[7] = len(bio_words & title_words) / len(title_words)

            return torch.tensor(feats, dtype=torch.float32)

        except Exception as exc:
            logger.error("ApplicantRanker.extract_features error: %s", exc)
            return torch.zeros(FEATURE_DIM, dtype=torch.float32)

    # ── Scoring ───────────────────────────────────────────────────────────────

    def score(
        self,
        user: dict,
        job: dict,
        has_cover_letter: bool = False,
    ) -> int:
        """
        Return match percentage (0–100). Drop-in replacement for
        calculate_match_percentage(user, job).

        Also returns the raw feature tensor so callers can store it
        for the later online_update call.
        """
        features = self.extract_features(user, job)
        if has_cover_letter:
            features[3] = 1.0

        with self._update_lock:
            self._model.eval()
            with torch.no_grad():
                raw_score = float(self._model(features.unsqueeze(0)))

        pct = int(round(raw_score * 100))
        logger.debug("ApplicantRanker.score → %d%%", pct)
        return pct

    def score_with_features(
        self,
        user: dict,
        job: dict,
        has_cover_letter: bool = False,
    ) -> tuple[int, list]:
        """
        Like score() but also returns the feature vector as a plain list
        so callers can persist it to MongoDB for the later online update.
        """
        features = self.extract_features(user, job)
        if has_cover_letter:
            features[3] = 1.0

        with self._update_lock:
            self._model.eval()
            with torch.no_grad():
                raw_score = float(self._model(features.unsqueeze(0)))

        pct = int(round(raw_score * 100))
        return pct, features.tolist()

    # ── Online update ─────────────────────────────────────────────────────────

    def online_update(self, features: list | torch.Tensor, reward: float):
        """
        Single REINFORCE gradient step.

        loss = −reward × log(score + ε)

        Positive reward (accept)  → push score up.
        Negative reward (reject)  → push score down.
        """
        if isinstance(features, list):
            feat_tensor = torch.tensor(features, dtype=torch.float32)
        else:
            feat_tensor = features.clone().detach().float()

        with self._update_lock:
            self._model.train()
            self._optimizer.zero_grad()
            score = self._model(feat_tensor.unsqueeze(0))  # (1,)
            loss = -reward * torch.log(score + EPS)
            loss.backward()
            self._optimizer.step()

        logger.info(
            "ApplicantRanker online_update reward=%.1f score_before=%.3f loss=%.4f",
            reward, float(score.detach()), float(loss.detach()),
        )

    # ── Persistence ───────────────────────────────────────────────────────────

    def save(self, path: str):
        try:
            torch.save(
                {
                    "model_state": self._model.state_dict(),
                    "optimizer_state": self._optimizer.state_dict(),
                },
                path,
            )
            logger.info("ApplicantRanker weights saved → %s", path)
        except Exception as exc:
            logger.error("ApplicantRanker save failed: %s", exc)

    def load(self, path: str):
        p = Path(path)
        if not p.exists():
            logger.info("ApplicantRanker: no weights at %s — starting fresh", path)
            return
        try:
            checkpoint = torch.load(path, map_location="cpu", weights_only=True)
            self._model.load_state_dict(checkpoint["model_state"])
            self._optimizer.load_state_dict(checkpoint["optimizer_state"])
            logger.info("ApplicantRanker weights loaded ← %s", path)
        except Exception as exc:
            logger.error("ApplicantRanker load failed: %s — starting fresh", exc)


# ── Helpers ───────────────────────────────────────────────────────────────────

def _normalize_skill(s: str) -> str:
    if not s:
        return ""
    clean = re.sub(r"[^a-zA-Z0-9+#.]", "", s.lower())
    if clean.endswith(".") and not clean.endswith(".net"):
        clean = clean[:-1]
    return clean


def get_ranker() -> ApplicantRanker:
    """Return the singleton ranker instance."""
    return ApplicantRanker()
