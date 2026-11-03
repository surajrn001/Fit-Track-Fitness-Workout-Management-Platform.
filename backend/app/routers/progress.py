from datetime import date, timedelta
from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from ..database import get_db
from ..models import User, Progress, Workout
from ..schemas import ProgressResponse, DashboardSummaryResponse
from ..security import get_current_user
from ..crud import get_dashboard_summary, sync_daily_progress

router = APIRouter(prefix="/api/progress", tags=["Daily Progress"])

@router.get("/summary", response_model=DashboardSummaryResponse)
def get_summary_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve high-level dashboard metrics, streak, and daily totals."""
    return get_dashboard_summary(db=db, user_id=current_user.id)

@router.get("/daily", response_model=List[ProgressResponse])
def get_daily_records(
    days: int = Query(30, ge=1, le=365, description="Number of past days to fetch"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Fetch user's daily progress records for the past N days."""
    start_date = date.today() - timedelta(days=days)
    records = db.query(Progress).filter(
        Progress.user_id == current_user.id,
        Progress.date >= start_date
    ).order_by(desc(Progress.date)).all()
    return records

@router.get("/today", response_model=ProgressResponse)
def get_today_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get or compute today's synced progress entry."""
    today = date.today()
    record = sync_daily_progress(db=db, user_id=current_user.id, target_date=today)
    return record

@router.post("/sync-all")
def resync_all_user_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Iterate over all workout dates for the user and synchronize the progress table."""
    workout_dates = db.query(Workout.workout_date).filter(
        Workout.user_id == current_user.id
    ).distinct().all()

    synced_count = 0
    for (w_date,) in workout_dates:
        sync_daily_progress(db, current_user.id, w_date)
        synced_count += 1

    return {"detail": f"Successfully synchronized {synced_count} progress days"}
