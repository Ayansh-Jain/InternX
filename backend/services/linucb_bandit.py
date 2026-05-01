"""
LinUCB Contextual Bandit for Job Recommendation.

Each job is treated as a bandit "arm". The context vector for a
(user, job) pair is the concatenation of the user's preference vector
and the job's feature vector, both of dimension `vocab_size`.

UCB score for arm (job):
    score = theta_hat · x  +  alpha * sqrt(x^T A_inv x)

where:
    x         = context vector (2 * vocab_size)
    theta_hat = A_inv @ b  (estimated reward parameter)
    A         = I + sum of outer(x, x) for observed contexts
    b         = sum of (reward * x) for observed contexts

Online update uses the Sherman-Morrison formula for O(d²) incremental
A_inv updates instead of a full O(d³) matrix inversion every call.
"""

import logging
import pickle
import threading
from pathlib import Path
from typing import Dict, Optional

import numpy as np

logger = logging.getLogger(__name__)


class _ArmState:
    """Per-arm (per-job) LinUCB state."""

    __slots__ = ("A_inv", "b", "theta_hat")

    def __init__(self, d: int):
        self.A_inv: np.ndarray = np.eye(d, dtype=np.float64)   # d×d
        self.b: np.ndarray = np.zeros(d, dtype=np.float64)      # d
        self.theta_hat: np.ndarray = np.zeros(d, dtype=np.float64)  # A_inv @ b


class LinUCBBandit:
    """
    Disjoint LinUCB bandit — one independent linear model per job arm.

    Args:
        context_dim: Dimensionality of the context vector (2 × vocab_size).
        alpha:       Exploration coefficient. Higher -> more exploration.
                     0.5 is a good starting point.
    """

    _instance: Optional["LinUCBBandit"] = None
    _lock = threading.Lock()

    def __new__(cls, context_dim: int = 0, alpha: float = 0.5):
        # Singleton so all routes share the same model state.
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    inst = super().__new__(cls)
                    inst._init(context_dim, alpha)
                    cls._instance = inst
        return cls._instance

    def _init(self, context_dim: int, alpha: float):
        self.context_dim: int = context_dim
        self.alpha: float = alpha
        self._arms: Dict[str, _ArmState] = {}
        self._arms_lock = threading.Lock()

    # ── Public API ────────────────────────────────────────────────────────────

    def score(self, job_id: str, context: np.ndarray) -> float:
        """
        Return the UCB score for a (job, context) pair.
        Thread-safe read; creates a new arm on first encounter.
        """
        d = len(context)
        self._maybe_resize(d)

        with self._arms_lock:
            arm = self._get_or_create_arm(job_id, d)
            exploit = float(arm.theta_hat @ context)
            explore = float(
                self.alpha * np.sqrt(np.clip(context @ arm.A_inv @ context, 0, None))
            )
        return exploit + explore

    def update(self, job_id: str, context: np.ndarray, reward: float):
        """
        Online update for a single (job, context, reward) observation.
        Uses the Sherman-Morrison rank-1 update for A_inv:
            A_inv_new = A_inv - (A_inv x xᵀ A_inv) / (1 + xᵀ A_inv x)
        This keeps the update O(d²) instead of O(d³).
        """
        d = len(context)
        self._maybe_resize(d)

        with self._arms_lock:
            arm = self._get_or_create_arm(job_id, d)
            x = context.astype(np.float64)

            # Sherman-Morrison incremental inverse update
            A_inv_x = arm.A_inv @ x                         # (d,)
            denom = 1.0 + float(x @ A_inv_x)
            arm.A_inv -= np.outer(A_inv_x, A_inv_x) / denom

            # Update b vector
            arm.b += reward * x

            # Recompute theta_hat
            arm.theta_hat = arm.A_inv @ arm.b

        logger.debug(
            "LinUCB updated arm=%s reward=%.3f exploit=%.3f",
            job_id, reward, float(arm.theta_hat @ context),
        )

    def num_arms(self) -> int:
        with self._arms_lock:
            return len(self._arms)

    # ── Persistence ───────────────────────────────────────────────────────────

    def save(self, path: str):
        """Pickle the bandit state to disk."""
        try:
            with self._arms_lock:
                state = {
                    "context_dim": self.context_dim,
                    "alpha": self.alpha,
                    "arms": {
                        jid: {
                            "A_inv": arm.A_inv,
                            "b": arm.b,
                            "theta_hat": arm.theta_hat,
                        }
                        for jid, arm in self._arms.items()
                    },
                }
            with open(path, "wb") as f:
                pickle.dump(state, f)
            logger.info("LinUCB state saved -> %s (%d arms)", path, len(state["arms"]))
        except Exception as exc:
            logger.error("LinUCB save failed: %s", exc)

    def load(self, path: str):
        """Load bandit state from disk; silently skip if file absent."""
        p = Path(path)
        if not p.exists():
            logger.info("LinUCB: no state file at %s — starting fresh", path)
            return
        try:
            with open(path, "rb") as f:
                state = pickle.load(f)
            d = state.get("context_dim", self.context_dim)
            self.context_dim = d
            self.alpha = state.get("alpha", self.alpha)
            with self._arms_lock:
                self._arms = {}
                for jid, arm_data in state.get("arms", {}).items():
                    arm = _ArmState(d)
                    arm.A_inv = arm_data["A_inv"]
                    arm.b = arm_data["b"]
                    arm.theta_hat = arm_data["theta_hat"]
                    self._arms[jid] = arm
            logger.info(
                "LinUCB state loaded <- %s (%d arms)", path, len(self._arms)
            )
        except Exception as exc:
            logger.error("LinUCB load failed: %s — starting fresh", exc)

    # ── Helpers ───────────────────────────────────────────────────────────────

    def _get_or_create_arm(self, job_id: str, d: int) -> _ArmState:
        """Must be called with _arms_lock held."""
        if job_id not in self._arms:
            self._arms[job_id] = _ArmState(d)
        return self._arms[job_id]

    def _maybe_resize(self, d: int):
        """If vocab grew, update context_dim (new arms pick up the right size)."""
        if d != self.context_dim and d > 0:
            logger.debug("LinUCB context_dim updated %d -> %d", self.context_dim, d)
            self.context_dim = d


# ── Reward mapping ────────────────────────────────────────────────────────────

INTERACTION_REWARDS: Dict[str, float] = {
    "view":  0.2,
    "click": 0.5,
    "like":  0.8,
    "apply": 1.0,
}


def get_bandit() -> LinUCBBandit:
    """Return the singleton bandit instance (creates with defaults if needed)."""
    return LinUCBBandit(context_dim=0, alpha=0.5)
