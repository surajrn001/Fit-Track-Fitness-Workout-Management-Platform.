from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..schemas import StreakResponse
from ..security import get_current_user
from ..crud import get_streak_details

router = APIRouter(prefix="/api/streak", tags=["Streak Tracking System"])

@router.get("/", response_model=StreakResponse)
def get_user_streak(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_streak_details(db=db, user_id=current_user.id)
