from datetime import date, timedelta
from typing import List, Literal
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database import get_db
from ..models import User, Workout
from ..schemas import (
    WeeklyAnalyticsResponse,
    MonthlyAnalyticsResponse,
    DailyTrend,
    CategoryStat,
    AdvancedAnalyticsResponse,
)
from ..security import get_current_user
from ..phase3_crud import get_advanced_analytics

router = APIRouter(prefix="/api/analytics", tags=["Reports & Analytics"])

DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

@router.get("/weekly", response_model=WeeklyAnalyticsResponse)
def get_weekly_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Weekly report: Last 7 days calories burned, duration, workout count, and category split."""
    today = date.today()
    days_data: List[DailyTrend] = []
    total_cals = 0.0
    total_dur = 0
    total_count = 0

    # Build the 7 days (from 6 days ago up to today)
    for i in range(6, -1, -1):
        target_d = today - timedelta(days=i)
        stats = db.query(
            func.count(Workout.id).label("cnt"),
            func.coalesce(func.sum(Workout.calories_burned), 0.0).label("cals"),
            func.coalesce(func.sum(Workout.duration), 0).label("dur")
        ).filter(
            Workout.user_id == current_user.id,
            Workout.workout_date == target_d
        ).first()

        cals = float(stats.cals) if stats else 0.0
        dur = int(stats.dur) if stats else 0
        cnt = int(stats.cnt) if stats else 0

        total_cals += cals
        total_dur += dur
        total_count += cnt

        days_data.append(DailyTrend(
            date=target_d.isoformat(),
            day_name=DAY_NAMES[target_d.weekday()],
            calories=cals,
            duration=dur,
            count=cnt
        ))

    # Category stats for this 7-day period
    seven_days_ago = today - timedelta(days=6)
    cat_query = db.query(
        Workout.category,
        func.count(Workout.id).label("cnt"),
        func.coalesce(func.sum(Workout.calories_burned), 0.0).label("cals"),
        func.coalesce(func.sum(Workout.duration), 0).label("dur")
    ).filter(
        Workout.user_id == current_user.id,
        Workout.workout_date >= seven_days_ago
    ).group_by(Workout.category).all()

    categories = [
        CategoryStat(
            category=row[0],
            count=int(row[1]),
            calories=float(row[2]),
            duration=int(row[3])
        )
        for row in cat_query
    ]

    return WeeklyAnalyticsResponse(
        days=days_data,
        total_calories=round(total_cals, 1),
        total_duration=total_dur,
        total_workouts=total_count,
        categories=categories
    )

@router.get("/monthly", response_model=MonthlyAnalyticsResponse)
def get_monthly_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Monthly report: 30-day overview of daily calories, durations, and category distribution."""
    today = date.today()
    thirty_days_ago = today - timedelta(days=29)

    days_data: List[DailyTrend] = []
    total_cals = 0.0
    total_dur = 0
    total_count = 0

    # Query all workouts in the 30-day window
    workouts = db.query(
        Workout.workout_date,
        func.count(Workout.id).label("cnt"),
        func.coalesce(func.sum(Workout.calories_burned), 0.0).label("cals"),
        func.coalesce(func.sum(Workout.duration), 0).label("dur")
    ).filter(
        Workout.user_id == current_user.id,
        Workout.workout_date >= thirty_days_ago,
        Workout.workout_date <= today
    ).group_by(Workout.workout_date).all()

    workout_map = {
        row[0]: (int(row[1]), float(row[2]), int(row[3]))
        for row in workouts
    }

    for i in range(29, -1, -1):
        target_d = today - timedelta(days=i)
        cnt, cals, dur = workout_map.get(target_d, (0, 0.0, 0))
        total_cals += cals
        total_dur += dur
        total_count += cnt
        days_data.append(DailyTrend(
            date=target_d.isoformat(),
            day_name=DAY_NAMES[target_d.weekday()],
            calories=cals,
            duration=dur,
            count=cnt
        ))

    cat_query = db.query(
        Workout.category,
        func.count(Workout.id).label("cnt"),
        func.coalesce(func.sum(Workout.calories_burned), 0.0).label("cals"),
        func.coalesce(func.sum(Workout.duration), 0).label("dur")
    ).filter(
        Workout.user_id == current_user.id,
        Workout.workout_date >= thirty_days_ago
    ).group_by(Workout.category).all()

    categories = [
        CategoryStat(
            category=row[0],
            count=int(row[1]),
            calories=float(row[2]),
            duration=int(row[3])
        )
        for row in cat_query
    ]

    return MonthlyAnalyticsResponse(
        month_name=today.strftime("%B %Y"),
        total_calories=round(total_cals, 1),
        total_duration=total_dur,
        total_workouts=total_count,
        daily_data=days_data,
        categories=categories
    )


@router.get("/advanced", response_model=AdvancedAnalyticsResponse)
def read_advanced_analytics(
    period: Literal["weekly", "monthly"] = Query("monthly", description="Analysis window"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Performance trends, consistency score, goal completion rate, and nutrition balance."""
    return get_advanced_analytics(db, user_id=current_user.id, period=period)
