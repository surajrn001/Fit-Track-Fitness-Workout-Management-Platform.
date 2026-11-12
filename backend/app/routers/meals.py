from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..schemas import MealCreate, MealUpdate, MealResponse, NutritionSummaryResponse
from ..security import get_current_user
from ..phase3_crud import (
    create_meal,
    get_meals,
    get_meal_by_id,
    update_meal,
    delete_meal,
    get_nutrition_summary,
)

router = APIRouter(prefix="/api/meals", tags=["Nutrition & Meals"])


@router.get("/", response_model=List[MealResponse])
def list_meals(
    meal_date: Optional[date] = Query(None, description="Filter by meal date"),
    meal_type: Optional[str] = Query(None, description="Breakfast, Lunch, Dinner, or Snacks"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_meals(db, user_id=current_user.id, target_date=meal_date, meal_type=meal_type)


@router.post("/", response_model=MealResponse, status_code=status.HTTP_201_CREATED)
def add_meal(
    meal_in: MealCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_meal(db, user_id=current_user.id, meal_in=meal_in)


@router.get("/summary", response_model=NutritionSummaryResponse)
def read_nutrition_summary(
    target_date: Optional[date] = Query(None, description="Target date for summary"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_nutrition_summary(db, user_id=current_user.id, target_date=target_date)


@router.put("/{meal_id}", response_model=MealResponse)
def edit_meal(
    meal_id: int,
    meal_in: MealUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    meal = get_meal_by_id(db, meal_id=meal_id, user_id=current_user.id)
    if not meal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meal entry not found or you do not have permission to edit it.",
        )
    return update_meal(db, meal=meal, meal_in=meal_in)


@router.delete("/{meal_id}", status_code=status.HTTP_200_OK)
def remove_meal(
    meal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    meal = get_meal_by_id(db, meal_id=meal_id, user_id=current_user.id)
    if not meal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meal entry not found or you do not have permission to delete it.",
        )
    delete_meal(db, meal=meal)
    return {"detail": "Meal entry deleted"}

