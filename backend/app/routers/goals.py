from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, Goal
from ..schemas import GoalCreate, GoalUpdate, GoalProgressUpdate, GoalResponse
from ..security import get_current_user
from ..crud import (
    create_goal,
    get_goals,
    get_goal_by_id,
    update_goal,
    delete_goal
)

router = APIRouter(prefix="/api/goals", tags=["Goal Setting"])

def serialize_goal(goal: Goal) -> GoalResponse:
    target = goal.target_value if goal.target_value > 0 else 1.0
    pct = min(100.0, round((goal.current_value / target) * 100.0, 1))
    return GoalResponse(
        id=goal.id,
        user_id=goal.user_id,
        goal_type=goal.goal_type,
        target_value=goal.target_value,
        current_value=goal.current_value,
        deadline=goal.deadline,
        is_completed=goal.is_completed,
        created_at=goal.created_at,
        progress_percentage=pct
    )

@router.get("/", response_model=List[GoalResponse])
def read_goals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve all goals for current user with computed progress percentage."""
    goals = get_goals(db=db, user_id=current_user.id)
    return [serialize_goal(g) for g in goals]

@router.post("/", response_model=GoalResponse, status_code=status.HTTP_201_CREATED)
def add_goal(
    goal_in: GoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Set a new fitness goal."""
    goal = create_goal(db=db, user_id=current_user.id, goal_in=goal_in)
    return serialize_goal(goal)

@router.get("/{goal_id}", response_model=GoalResponse)
def read_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Fetch a single goal with ownership validation."""
    goal = get_goal_by_id(db=db, goal_id=goal_id, user_id=current_user.id)
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found or access denied."
        )
    return serialize_goal(goal)

@router.put("/{goal_id}", response_model=GoalResponse)
def modify_goal(
    goal_id: int,
    goal_in: GoalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update goal parameters or status with ownership validation."""
    goal = get_goal_by_id(db=db, goal_id=goal_id, user_id=current_user.id)
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found or access denied."
        )
    updated = update_goal(db=db, goal=goal, goal_update=goal_in)
    return serialize_goal(updated)

@router.patch("/{goal_id}/progress", response_model=GoalResponse)
def log_goal_progress(
    goal_id: int,
    progress_in: GoalProgressUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Increment or set current progress value on a goal."""
    goal = get_goal_by_id(db=db, goal_id=goal_id, user_id=current_user.id)
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found or access denied."
        )
    goal_update = GoalUpdate(current_value=progress_in.current_value)
    updated = update_goal(db=db, goal=goal, goal_update=goal_update)
    return serialize_goal(updated)

@router.delete("/{goal_id}", status_code=status.HTTP_200_OK)
def remove_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a goal with ownership validation."""
    goal = get_goal_by_id(db=db, goal_id=goal_id, user_id=current_user.id)
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found or access denied."
        )
    delete_goal(db=db, goal=goal)
    return {"detail": "Goal deleted successfully", "id": goal_id}
