from datetime import date, datetime, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from .models import User, Workout, Progress, Goal, Notification
from .schemas import WorkoutCreate, WorkoutUpdate, GoalCreate, GoalUpdate

# ---------------- PROGRESS SYNC HELPER ----------------
def sync_daily_progress(db: Session, user_id: int, target_date: date) -> Progress:
    """Calculate and upsert daily progress record for a user and date."""
    stats = db.query(
        func.count(Workout.id).label("total_workouts"),
        func.coalesce(func.sum(Workout.calories_burned), 0.0).label("total_calories")
    ).filter(
        Workout.user_id == user_id,
        Workout.workout_date == target_date
    ).first()

    total_workouts = stats.total_workouts if stats else 0
    total_calories = float(stats.total_calories) if stats else 0.0

    progress_record = db.query(Progress).filter(
        Progress.user_id == user_id,
        Progress.date == target_date
    ).first()

    if not progress_record:
        progress_record = Progress(
            user_id=user_id,
            total_workouts=total_workouts,
            total_calories=total_calories,
            date=target_date
        )
        db.add(progress_record)
    else:
        progress_record.total_workouts = total_workouts
        progress_record.total_calories = total_calories

    db.commit()
    db.refresh(progress_record)
    return progress_record

# ---------------- WORKOUT CRUD ----------------
def create_workout(db: Session, user_id: int, workout_in: WorkoutCreate) -> Workout:
    workout = Workout(
        user_id=user_id,
        workout_name=workout_in.workout_name,
        category=workout_in.category,
        duration=workout_in.duration,
        calories_burned=workout_in.calories_burned,
        workout_date=workout_in.workout_date
    )
    db.add(workout)
    db.commit()
    db.refresh(workout)

    # Sync daily progress table
    sync_daily_progress(db, user_id, workout.workout_date)

    # Trigger goal updates if calories / workout goals exist
    check_and_update_goal_progress(db, user_id)

    return workout

def get_workouts(
    db: Session,
    user_id: int,
    category: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
) -> List[Workout]:
    query = db.query(Workout).filter(Workout.user_id == user_id)

    if category and category.lower() != "all":
        query = query.filter(func.lower(Workout.category) == category.lower())

    if start_date:
        query = query.filter(Workout.workout_date >= start_date)

    if end_date:
        query = query.filter(Workout.workout_date <= end_date)

    if search:
        query = query.filter(Workout.workout_name.ilike(f"%{search}%"))

    return query.order_by(desc(Workout.workout_date), desc(Workout.id)).offset(skip).limit(limit).all()

def get_workout_by_id(db: Session, workout_id: int, user_id: int) -> Optional[Workout]:
    return db.query(Workout).filter(
        Workout.id == workout_id,
        Workout.user_id == user_id
    ).first()

def update_workout(
    db: Session,
    workout: Workout,
    workout_update: WorkoutUpdate
) -> Workout:
    old_date = workout.workout_date
    update_data = workout_update.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(workout, field, value)

    db.commit()
    db.refresh(workout)

    # Resync progress for affected dates
    sync_daily_progress(db, workout.user_id, workout.workout_date)
    if old_date != workout.workout_date:
        sync_daily_progress(db, workout.user_id, old_date)

    check_and_update_goal_progress(db, workout.user_id)
    return workout

def delete_workout(db: Session, workout: Workout) -> bool:
    user_id = workout.user_id
    w_date = workout.workout_date
    db.delete(workout)
    db.commit()

    # Resync daily progress
    sync_daily_progress(db, user_id, w_date)
    return True

# ---------------- GOAL CRUD ----------------
def create_goal(db: Session, user_id: int, goal_in: GoalCreate) -> Goal:
    goal = Goal(
        user_id=user_id,
        goal_type=goal_in.goal_type,
        target_value=goal_in.target_value,
        current_value=goal_in.current_value,
        deadline=goal_in.deadline,
        is_completed=(goal_in.current_value >= goal_in.target_value)
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)

    # Check notification trigger
    if goal.is_completed:
        create_notification(
            db, user_id,
            title="🎯 Goal Achieved!",
            message=f"Outstanding work! You have achieved your goal: {goal.goal_type} ({goal.target_value})!"
        )
    return goal

def get_goals(db: Session, user_id: int) -> List[Goal]:
    return db.query(Goal).filter(Goal.user_id == user_id).order_by(desc(Goal.created_at)).all()

def get_goal_by_id(db: Session, goal_id: int, user_id: int) -> Optional[Goal]:
    return db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == user_id).first()

def update_goal(db: Session, goal: Goal, goal_update: GoalUpdate) -> Goal:
    was_completed = goal.is_completed
    update_data = goal_update.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(goal, field, value)

    # Auto-detect completion
    if goal.current_value >= goal.target_value:
        goal.is_completed = True
        if not was_completed:
            create_notification(
                db, goal.user_id,
                title="🏆 Badhai Ho! Goal Conquered!",
                message=f"Spectacular achievement! You reached your milestone for {goal.goal_type} ({goal.target_value})! Shabaash!"
            )
    else:
        # Check 80% milestone
        ratio = (goal.current_value / goal.target_value) if goal.target_value > 0 else 0
        if ratio >= 0.8 and not was_completed:
            create_notification(
                db, goal.user_id,
                title="🔥 Shabaash! Almost There!",
                message=f"Zabardast energy! You're at {round(ratio * 100)}% of your goal: {goal.goal_type}. Bas thoda aur!"
            )

    db.commit()
    db.refresh(goal)
    return goal

def delete_goal(db: Session, goal: Goal) -> bool:
    db.delete(goal)
    db.commit()
    return True

def check_and_update_goal_progress(db: Session, user_id: int):
    """Auto-update any active goals based on aggregate workout statistics if applicable."""
    # Find active goals
    goals = db.query(Goal).filter(Goal.user_id == user_id, Goal.is_completed == False).all()
    if not goals:
        return

    # Aggregate total calories and workout count
    total_cals = db.query(func.coalesce(func.sum(Workout.calories_burned), 0.0)).filter(
        Workout.user_id == user_id
    ).scalar() or 0.0

    total_wks = db.query(func.count(Workout.id)).filter(
        Workout.user_id == user_id
    ).scalar() or 0

    for g in goals:
        lower_type = g.goal_type.lower()
        if "calorie" in lower_type:
            g.current_value = float(total_cals)
        elif "workout" in lower_type:
            g.current_value = float(total_wks)

        if g.current_value >= g.target_value:
            g.is_completed = True
            create_notification(
                db, user_id,
                title="🎉 Goal Completed!",
                message=f"Spectacular! You hit your goal target: {g.goal_type} ({g.target_value})!"
            )

    db.commit()

# ---------------- NOTIFICATION CRUD ----------------
def create_notification(db: Session, user_id: int, title: str, message: str) -> Notification:
    notif = Notification(
        user_id=user_id,
        title=title,
        message=message,
        is_read=False
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return notif

def get_notifications(db: Session, user_id: int) -> List[Notification]:
    return db.query(Notification).filter(
        Notification.user_id == user_id
    ).order_by(desc(Notification.created_at)).all()

def mark_notification_read(db: Session, notif_id: int, user_id: int) -> Optional[Notification]:
    notif = db.query(Notification).filter(
        Notification.id == notif_id,
        Notification.user_id == user_id
    ).first()
    if notif:
        notif.is_read = True
        db.commit()
        db.refresh(notif)
    return notif

def mark_all_notifications_read(db: Session, user_id: int) -> int:
    count = db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
    return count

def trigger_daily_reminders_if_needed(db: Session, user_id: int):
    """If user hasn't logged a workout today, ensure they receive a daily workout reminder."""
    today = date.today()
    today_workouts = db.query(Workout).filter(
        Workout.user_id == user_id,
        Workout.workout_date == today
    ).count()

    if today_workouts == 0:
        # Check if reminder already created today
        today_start = datetime.combine(today, datetime.min.time())
        existing = db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.title.ilike("%daily workout reminder%"),
            Notification.created_at >= today_start
        ).first()

        if not existing:
            create_notification(
                db, user_id,
                title="⏰ Fit India Daily Reminder",
                message="Namaste! Maintain your active workout streak today. Even a quick 20-min Surya Namaskar or evening Shatapawali walk makes a huge difference!"
            )

# ---------------- DASHBOARD SUMMARY & STREAK ----------------
def calculate_streak(db: Session, user_id: int) -> int:
    """Calculate current consecutive day streak of completed workouts."""
    dates_records = db.query(Workout.workout_date).filter(
        Workout.user_id == user_id
    ).distinct().order_by(desc(Workout.workout_date)).all()

    if not dates_records:
        return 0

    unique_dates = {rec[0] for rec in dates_records}
    today = date.today()
    yesterday = today - timedelta(days=1)

    # Streak is active if worked out today OR yesterday
    if today in unique_dates:
        curr = today
    elif yesterday in unique_dates:
        curr = yesterday
    else:
        return 0

    streak = 0
    while curr in unique_dates:
        streak += 1
        curr -= timedelta(days=1)

    return streak

def get_dashboard_summary(db: Session, user_id: int):
    today = date.today()
    week_ago = today - timedelta(days=7)
    month_ago = today - timedelta(days=30)

    # Today stats
    today_stats = db.query(
        func.count(Workout.id).label("count"),
        func.coalesce(func.sum(Workout.calories_burned), 0.0).label("cals"),
        func.coalesce(func.sum(Workout.duration), 0).label("dur")
    ).filter(
        Workout.user_id == user_id,
        Workout.workout_date == today
    ).first()

    # Week cals
    week_cals = db.query(func.coalesce(func.sum(Workout.calories_burned), 0.0)).filter(
        Workout.user_id == user_id,
        Workout.workout_date >= week_ago
    ).scalar() or 0.0

    # Month cals
    month_cals = db.query(func.coalesce(func.sum(Workout.calories_burned), 0.0)).filter(
        Workout.user_id == user_id,
        Workout.workout_date >= month_ago
    ).scalar() or 0.0

    # Streak
    streak = calculate_streak(db, user_id)

    # Active goals
    active_goals = db.query(Goal).filter(
        Goal.user_id == user_id,
        Goal.is_completed == False
    ).count()

    # Unread notifications
    unread_notifs = db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read == False
    ).count()

    return {
        "today_workouts": today_stats.count if today_stats else 0,
        "today_calories": float(today_stats.cals) if today_stats else 0.0,
        "today_duration": int(today_stats.dur) if today_stats else 0,
        "weekly_calories": float(week_cals),
        "monthly_calories": float(month_cals),
        "current_streak": streak,
        "active_goals_count": active_goals,
        "unread_notifications_count": unread_notifs
    }
