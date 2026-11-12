from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, Workout
from ..schemas import WorkoutCreate, WorkoutUpdate, WorkoutResponse, SuggestionsResponse
from ..security import get_current_user
from ..crud import (
    create_workout,
    get_workouts,
    get_workout_by_id,
    update_workout,
    delete_workout
)
from ..phase3_crud import get_workout_suggestions

router = APIRouter(prefix="/api/workouts", tags=["Workouts"])

CATEGORIES = [
    {"id": "Cardio", "name": "Cardio", "icon": "Flame", "color": "#f97316"},
    {"id": "Strength", "name": "Strength", "icon": "Dumbbell", "color": "#3b82f6"},
    {"id": "Yoga", "name": "Yoga", "icon": "Heart", "color": "#10b981"},
    {"id": "HIIT", "name": "HIIT", "icon": "Zap", "color": "#ef4444"},
    {"id": "Pilates", "name": "Pilates", "icon": "Activity", "color": "#a855f7"},
    {"id": "Cycling", "name": "Cycling", "icon": "Compass", "color": "#06b6d4"},
    {"id": "Walking", "name": "Walking", "icon": "Footprints", "color": "#84cc16"},
]

@router.get("/categories", response_model=List[dict])
def get_categories():
    """Return available workout categories with metadata."""
    return CATEGORIES

@router.get("/suggestions", response_model=SuggestionsResponse)
def read_workout_suggestions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return tailored workout recommendations based on history, goals, and streak."""
    return get_workout_suggestions(db, user_id=current_user.id)

@router.get("/", response_model=List[WorkoutResponse])
def read_workouts(
    category: Optional[str] = Query(None, description="Filter by category"),
    start_date: Optional[date] = Query(None, description="Filter start date"),
    end_date: Optional[date] = Query(None, description="Filter end date"),
    search: Optional[str] = Query(None, description="Search workout name"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Fetch user workouts with optional filters."""
    return get_workouts(
        db=db,
        user_id=current_user.id,
        category=category,
        start_date=start_date,
        end_date=end_date,
        search=search,
        skip=skip,
        limit=limit
    )

@router.post("/", response_model=WorkoutResponse, status_code=status.HTTP_201_CREATED)
def add_workout(
    workout_in: WorkoutCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a new workout for the authenticated user."""
    return create_workout(db=db, user_id=current_user.id, workout_in=workout_in)

@router.get("/{workout_id}", response_model=WorkoutResponse)
def read_workout(
    workout_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Fetch a single workout by ID with user ownership validation."""
    workout = get_workout_by_id(db, workout_id=workout_id, user_id=current_user.id)
    if not workout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workout not found or you do not have permission to view it."
        )
    return workout

@router.put("/{workout_id}", response_model=WorkoutResponse)
def modify_workout(
    workout_id: int,
    workout_in: WorkoutUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a workout with user ownership validation."""
    workout = get_workout_by_id(db, workout_id=workout_id, user_id=current_user.id)
    if not workout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workout not found or you do not have permission to edit it."
        )
    return update_workout(db=db, workout=workout, workout_update=workout_in)

@router.delete("/{workout_id}", status_code=status.HTTP_200_OK)
def remove_workout(
    workout_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a workout with user ownership validation."""
    workout = get_workout_by_id(db, workout_id=workout_id, user_id=current_user.id)
    if not workout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workout not found or you do not have permission to delete it."
        )
    delete_workout(db=db, workout=workout)
    return {"detail": "Workout deleted successfully", "id": workout_id}
