from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..schemas import (
    WaterLogCreate,
    WaterLogResponse,
    WaterSummaryResponse,
    WaterGoalUpdate,
    ReminderSettingResponse,
)
from ..security import get_current_user
from ..phase3_crud import (
    log_water,
    delete_water_log,
    update_water_goal,
    get_water_summary,
)

router = APIRouter(prefix="/api/water", tags=["Water Intake"])


@router.get("/", response_model=WaterSummaryResponse)
def read_water_summary(
    target_date: Optional[date] = Query(None, description="Date for water tracking summary"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_water_summary(db, user_id=current_user.id, target_date=target_date)


@router.post("/", response_model=WaterLogResponse, status_code=status.HTTP_201_CREATED)
def add_water_entry(
    water_in: WaterLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return log_water(db, user_id=current_user.id, water_in=water_in)


@router.put("/goal", response_model=ReminderSettingResponse)
def set_water_goal(
    goal_in: WaterGoalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_water_goal(db, user_id=current_user.id, goal_ml=goal_in.daily_water_goal_ml)


@router.delete("/{entry_id}", status_code=status.HTTP_200_OK)
def remove_water_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    deleted = delete_water_log(db, entry_id=entry_id, user_id=current_user.id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Water entry not found or you do not have permission to delete it.",
        )
    return {"detail": "Water entry removed"}

