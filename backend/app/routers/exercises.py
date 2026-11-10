from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..schemas import ExerciseResponse, ExerciseCreate, ExerciseLogRequest, WorkoutResponse, WorkoutPlanResponse, WorkoutPlanCreate
from ..security import get_current_user
from ..crud import get_exercises, get_exercise_by_id, log_exercise_as_workout, create_workout_plan

router = APIRouter(prefix="/api/exercises", tags=["Exercise Library"])

@router.get("/", response_model=List[ExerciseResponse])
def list_exercises(
    category: Optional[str] = Query(None, description="Filter by category (Cardio, Strength, Yoga)"),
    search: Optional[str] = Query(None, description="Search by name or description"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Module 8: Predefined exercises library with category filter and search."""
    return get_exercises(db=db, category=category, search=search)

@router.get("/{exercise_id}", response_model=ExerciseResponse)
def get_exercise(
    exercise_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    exercise = get_exercise_by_id(db=db, exercise_id=exercise_id)
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")
    return exercise

@router.post("/{exercise_id}/log", response_model=WorkoutResponse, status_code=status.HTTP_201_CREATED)
def log_exercise_to_workouts(
    exercise_id: int,
    log_req: ExerciseLogRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Module 8: 1-Click logging of exercise from library directly into user's workouts."""
    exercise = get_exercise_by_id(db=db, exercise_id=exercise_id)
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")
    return log_exercise_as_workout(db=db, user_id=current_user.id, exercise=exercise, log_req=log_req)

@router.post("/{exercise_id}/schedule", response_model=WorkoutPlanResponse, status_code=status.HTTP_201_CREATED)
def schedule_exercise_to_plan(
    exercise_id: int,
    plan_in: WorkoutPlanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Module 8: Schedule an exercise into the calendar planner."""
    exercise = get_exercise_by_id(db=db, exercise_id=exercise_id)
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")
    return create_workout_plan(db=db, user_id=current_user.id, plan_in=plan_in)
