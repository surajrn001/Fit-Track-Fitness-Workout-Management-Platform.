from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..schemas import WorkoutPlanCreate, WorkoutPlanUpdate, WorkoutPlanResponse, WorkoutResponse
from ..security import get_current_user
from ..crud import (
    create_workout_plan, get_workout_plans, get_workout_plan_by_id,
    update_workout_plan, delete_workout_plan, complete_and_log_plan
)

router = APIRouter(prefix="/api/plans", tags=["Workout Plans & Scheduling"])

@router.get("/", response_model=List[WorkoutPlanResponse])
def list_plans(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    upcoming_only: bool = Query(False, description="Filter for upcoming plans only"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Module 7: Retrieve scheduled workout plans for current user."""
    return get_workout_plans(
        db=db,
        user_id=current_user.id,
        start_date=start_date,
        end_date=end_date,
        upcoming_only=upcoming_only
    )

@router.post("/", response_model=WorkoutPlanResponse, status_code=status.HTTP_201_CREATED)
def create_plan(
    plan_in: WorkoutPlanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Module 7: Schedule a new workout plan."""
    return create_workout_plan(db=db, user_id=current_user.id, plan_in=plan_in)

@router.get("/{plan_id}", response_model=WorkoutPlanResponse)
def get_single_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    plan = get_workout_plan_by_id(db=db, plan_id=plan_id, user_id=current_user.id)
    if not plan:
        raise HTTPException(status_code=404, detail="Scheduled workout plan not found")
    return plan

@router.put("/{plan_id}", response_model=WorkoutPlanResponse)
def update_plan(
    plan_id: int,
    plan_in: WorkoutPlanUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    plan = get_workout_plan_by_id(db=db, plan_id=plan_id, user_id=current_user.id)
    if not plan:
        raise HTTPException(status_code=404, detail="Scheduled workout plan not found")
    return update_workout_plan(db=db, plan=plan, plan_update=plan_in)

@router.delete("/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    plan = get_workout_plan_by_id(db=db, plan_id=plan_id, user_id=current_user.id)
    if not plan:
        raise HTTPException(status_code=404, detail="Scheduled workout plan not found")
    delete_workout_plan(db=db, plan=plan)
    return None

@router.post("/{plan_id}/complete", response_model=WorkoutResponse)
def mark_plan_completed_and_log(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Module 7: Mark plan as completed and automatically log it into workout history."""
    plan = get_workout_plan_by_id(db=db, plan_id=plan_id, user_id=current_user.id)
    if not plan:
        raise HTTPException(status_code=404, detail="Scheduled workout plan not found")
    workout = complete_and_log_plan(db=db, plan=plan)
    return workout
