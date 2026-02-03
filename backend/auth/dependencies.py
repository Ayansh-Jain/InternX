"""
FastAPI dependencies for authentication and authorization.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List, Optional

from .security import decode_token
from models.user import UserRole, TokenData
from database import Database, USERS_COLLECTION

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """
    Get the current authenticated user from the JWT token.
    """
    token = credentials.credentials
    payload = decode_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check token type
    if payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Fetch user from database
    from bson import ObjectId
    users_collection = Database.get_collection(USERS_COLLECTION)
    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user is blocked
    if user.get("status") == "blocked":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been blocked. Contact support for assistance.",
        )
    
    return user


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False))
) -> Optional[dict]:
    """
    Get current user if authenticated, otherwise return None.
    """
    if credentials is None:
        return None
    
    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None


def require_role(allowed_roles: List[UserRole]):
    """
    Dependency factory that creates a role checker.
    Usage: Depends(require_role([UserRole.ADMIN]))
    """
    async def role_checker(current_user: dict = Depends(get_current_user)) -> dict:
        user_role = current_user.get("role")
        if user_role not in [role.value for role in allowed_roles]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {[r.value for r in allowed_roles]}",
            )
        return current_user
    return role_checker


# Convenience dependencies for specific roles
async def require_admin(current_user: dict = Depends(get_current_user)) -> dict:
    """Require admin role."""
    if current_user.get("role") != UserRole.ADMIN.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user


async def require_job_provider(current_user: dict = Depends(get_current_user)) -> dict:
    """Require job provider role."""
    if current_user.get("role") != UserRole.JOB_PROVIDER.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Job Provider access required",
        )
    return current_user


async def require_job_searcher(current_user: dict = Depends(get_current_user)) -> dict:
    """Require job searcher role."""
    if current_user.get("role") != UserRole.JOB_SEARCHER.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Job Searcher access required",
        )
    return current_user
