from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..schemas import BadgeResponse
from ..security import get_current_user
from ..crud import get_all_badges_for_user, check_and_award_badges

router = APIRouter(prefix="/api/badges", tags=["Achievement Badges"])

@router.get("/", response_model=List[BadgeResponse])
def list_badges(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Module 11: Get list of all achievement badges with user's unlocked status and timestamps."""
    return get_all_badges_for_user(db=db, user_id=current_user.id)

@router.post("/check", response_model=List[BadgeResponse])
def trigger_badge_check(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Module 11: Check milestone requirements and return newly awarded badges."""
    new_badges = check_and_award_badges(db=db, user_id=current_user.id)
    return [
        {
            "id": b.id,
            "name": b.name,
            "description": b.description,
            "icon": b.icon,
            "category": b.category,
            "is_unlocked": True,
            "earned_at": None
        }
        for b in new_badges
    ]
