from datetime import date, datetime, timedelta, timezone
from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_, or_

from .models import User, Workout, Progress, Goal, Notification, WorkoutPlan, Exercise, Streak, Badge, UserBadge
from .schemas import (
    WorkoutCreate, WorkoutUpdate, GoalCreate, GoalUpdate,
    WorkoutPlanCreate, WorkoutPlanUpdate, ExerciseCreate, ExerciseLogRequest
)

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

    # Update streak
    update_user_streak(db, user_id)

    # Trigger goal updates if calories / workout goals exist
    check_and_update_goal_progress(db, user_id)

    # Check and award milestone badges
    check_and_award_badges(db, user_id)

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
    streak = update_user_streak(db, user_id)
    return streak.current_streak

def get_or_create_streak(db: Session, user_id: int) -> Streak:
    streak = db.query(Streak).filter(Streak.user_id == user_id).first()
    if not streak:
        streak = Streak(user_id=user_id, current_streak=0, longest_streak=0, last_workout_date=None)
        db.add(streak)
        db.commit()
        db.refresh(streak)
    return streak

def update_user_streak(db: Session, user_id: int) -> Streak:
    """Calculate and persist current consecutive day streak and longest streak."""
    streak = get_or_create_streak(db, user_id)

    dates_records = db.query(Workout.workout_date).filter(
        Workout.user_id == user_id
    ).distinct().order_by(desc(Workout.workout_date)).all()

    if not dates_records:
        streak.current_streak = 0
        streak.last_workout_date = None
        db.commit()
        db.refresh(streak)
        return streak

    unique_dates = {rec[0] for rec in dates_records}
    sorted_dates = sorted(list(unique_dates), reverse=True)
    today = date.today()
    yesterday = today - timedelta(days=1)

    streak.last_workout_date = sorted_dates[0] if sorted_dates else None

    # Calculate active consecutive streak
    if today in unique_dates:
        curr = today
    elif yesterday in unique_dates:
        curr = yesterday
    else:
        # Missed streak reset
        streak.current_streak = 0
        db.commit()
        db.refresh(streak)
        return streak

    curr_streak = 0
    while curr in unique_dates:
        curr_streak += 1
        curr -= timedelta(days=1)

    streak.current_streak = curr_streak
    streak.longest_streak = max(streak.longest_streak or 0, curr_streak)
    db.commit()
    db.refresh(streak)
    return streak

def get_streak_details(db: Session, user_id: int) -> Dict[str, Any]:
    streak = update_user_streak(db, user_id)
    today = date.today()
    yesterday = today - timedelta(days=1)

    if streak.last_workout_date == today:
        status = "active"
        msg = f"🔥 Zabardast! {streak.current_streak}-day streak active. You logged a workout today!"
    elif streak.last_workout_date == yesterday:
        status = "at_risk"
        msg = f"⚡ Agni alert! Maintain your {streak.current_streak}-day streak with a workout today."
    else:
        status = "resting"
        msg = "🌟 Start fresh today! 10-20 mins of Surya Namaskar or a walk begins your next streak."

    milestones = [3, 7, 14, 21, 30, 50, 100]
    next_milestone = next((m for m in milestones if m > streak.current_streak), streak.current_streak + 10)
    days_to_milestone = max(0, next_milestone - streak.current_streak)

    return {
        "user_id": user_id,
        "current_streak": streak.current_streak,
        "longest_streak": streak.longest_streak,
        "last_workout_date": streak.last_workout_date,
        "status": status,
        "next_milestone": next_milestone,
        "days_to_milestone": days_to_milestone,
        "streak_message": msg,
    }

# ---------------- MODULE 11: ACHIEVEMENT BADGES ----------------
def check_and_award_badges(db: Session, user_id: int) -> List[Badge]:
    """Check user milestones and award new badges."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return []

    earned_badge_ids = {
        ub.badge_id for ub in db.query(UserBadge).filter(UserBadge.user_id == user_id).all()
    }

    # Aggregate stats
    total_workouts = db.query(Workout).filter(Workout.user_id == user_id).count()
    total_cals = db.query(func.coalesce(func.sum(Workout.calories_burned), 0.0)).filter(
        Workout.user_id == user_id
    ).scalar() or 0.0
    completed_goals = db.query(Goal).filter(
        Goal.user_id == user_id, Goal.is_completed == True
    ).count()

    streak_obj = get_or_create_streak(db, user_id)
    best_streak = max(streak_obj.current_streak or 0, streak_obj.longest_streak or 0)

    all_badges = db.query(Badge).all()
    newly_awarded = []

    for b in all_badges:
        if b.id in earned_badge_ids:
            continue

        qualified = False
        if b.condition_type == "workouts_count" and total_workouts >= b.condition_value:
            qualified = True
        elif b.condition_type == "streak_days" and best_streak >= b.condition_value:
            qualified = True
        elif b.condition_type == "goals_completed" and completed_goals >= b.condition_value:
            qualified = True
        elif b.condition_type == "calories_total" and total_cals >= b.condition_value:
            qualified = True

        if qualified:
            ub = UserBadge(user_id=user_id, badge_id=b.id)
            db.add(ub)
            newly_awarded.append(b)
            create_notification(
                db, user_id,
                title=f"🎖️ Badge Unlocked: {b.name}!",
                message=f"Badhai ho! You unlocked the '{b.name}' badge: {b.description}."
            )

    if newly_awarded:
        db.commit()

    return newly_awarded

def get_all_badges_for_user(db: Session, user_id: int) -> List[Dict[str, Any]]:
    check_and_award_badges(db, user_id)

    earned_map = {
        ub.badge_id: ub.earned_at
        for ub in db.query(UserBadge).filter(UserBadge.user_id == user_id).all()
    }

    badges = db.query(Badge).order_by(Badge.id).all()
    result = []
    for b in badges:
        is_earned = b.id in earned_map
        result.append({
            "id": b.id,
            "name": b.name,
            "description": b.description,
            "icon": b.icon,
            "category": b.category,
            "is_unlocked": is_earned,
            "earned_at": earned_map.get(b.id)
        })
    return result

# ---------------- MODULE 7: WORKOUT PLANS & SCHEDULING ----------------
def create_workout_plan(db: Session, user_id: int, plan_in: WorkoutPlanCreate) -> WorkoutPlan:
    plan = WorkoutPlan(
        user_id=user_id,
        title=plan_in.title,
        description=plan_in.description,
        scheduled_date=plan_in.scheduled_date,
        is_completed=False
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)

    create_notification(
        db, user_id,
        title="📅 Workout Scheduled",
        message=f"Scheduled '{plan.title}' for {plan.scheduled_date.strftime('%d %b %Y')}. Consistency is power!"
    )
    return plan

def get_workout_plans(
    db: Session,
    user_id: int,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    upcoming_only: bool = False
) -> List[WorkoutPlan]:
    query = db.query(WorkoutPlan).filter(WorkoutPlan.user_id == user_id)
    if upcoming_only:
        query = query.filter(WorkoutPlan.scheduled_date >= date.today())
    if start_date:
        query = query.filter(WorkoutPlan.scheduled_date >= start_date)
    if end_date:
        query = query.filter(WorkoutPlan.scheduled_date <= end_date)
    return query.order_by(WorkoutPlan.scheduled_date.asc(), WorkoutPlan.id.asc()).all()

def get_workout_plan_by_id(db: Session, plan_id: int, user_id: int) -> Optional[WorkoutPlan]:
    return db.query(WorkoutPlan).filter(
        WorkoutPlan.id == plan_id, WorkoutPlan.user_id == user_id
    ).first()

def update_workout_plan(db: Session, plan: WorkoutPlan, plan_update: WorkoutPlanUpdate) -> WorkoutPlan:
    update_data = plan_update.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(plan, field, val)
    db.commit()
    db.refresh(plan)
    return plan

def delete_workout_plan(db: Session, plan: WorkoutPlan) -> bool:
    db.delete(plan)
    db.commit()
    return True

def complete_and_log_plan(db: Session, plan: WorkoutPlan) -> Workout:
    plan.is_completed = True
    db.commit()

    workout = Workout(
        user_id=plan.user_id,
        workout_name=plan.title,
        category="Strength",
        duration=30,
        calories_burned=220.0,
        workout_date=plan.scheduled_date or date.today()
    )
    db.add(workout)
    db.commit()
    db.refresh(workout)

    sync_daily_progress(db, plan.user_id, workout.workout_date)
    update_user_streak(db, plan.user_id)
    check_and_update_goal_progress(db, plan.user_id)
    check_and_award_badges(db, plan.user_id)

    create_notification(
        db, plan.user_id,
        title="✅ Scheduled Workout Completed!",
        message=f"Shabaash! '{plan.title}' marked completed and logged into your workout history."
    )
    return workout

# ---------------- MODULE 8: PREDEFINED EXERCISE LIBRARY ----------------
def get_exercises(db: Session, category: Optional[str] = None, search: Optional[str] = None) -> List[Exercise]:
    query = db.query(Exercise)
    if category and category.lower() != "all":
        query = query.filter(func.lower(Exercise.category) == category.lower())
    if search:
        query = query.filter(
            or_(
                Exercise.name.ilike(f"%{search}%"),
                Exercise.description.ilike(f"%{search}%")
            )
        )
    return query.order_by(Exercise.category, Exercise.name).all()

def get_exercise_by_id(db: Session, exercise_id: int) -> Optional[Exercise]:
    return db.query(Exercise).filter(Exercise.id == exercise_id).first()

def log_exercise_as_workout(
    db: Session, user_id: int, exercise: Exercise, log_req: ExerciseLogRequest
) -> Workout:
    w_date = log_req.workout_date or date.today()
    duration = log_req.duration or exercise.duration
    calories = log_req.calories_burned or exercise.calories_est

    workout = Workout(
        user_id=user_id,
        workout_name=exercise.name,
        category=exercise.category,
        duration=duration,
        calories_burned=calories,
        workout_date=w_date
    )
    db.add(workout)
    db.commit()
    db.refresh(workout)

    sync_daily_progress(db, user_id, w_date)
    update_user_streak(db, user_id)
    check_and_update_goal_progress(db, user_id)
    check_and_award_badges(db, user_id)

    create_notification(
        db, user_id,
        title=f"💪 {exercise.name} Logged!",
        message=f"Logged {duration} mins ({calories} kcal) of {exercise.name}. Keep moving forward!"
    )
    return workout

# ---------------- MODULE 9: PROGRESS COMPARISON ----------------
def calculate_metric_comparison(current: float, previous: float) -> Dict[str, Any]:
    diff = current - previous
    if previous > 0:
        pct = round((diff / previous) * 100, 1)
    elif current > 0:
        pct = 100.0
    else:
        pct = 0.0

    if diff > 0:
        trend = "up"
    elif diff < 0:
        trend = "down"
    else:
        trend = "same"

    return {
        "current": round(current, 1),
        "previous": round(previous, 1),
        "change": round(diff, 1),
        "pct_change": pct,
        "trend": trend
    }

def get_weekly_comparison(db: Session, user_id: int) -> Dict[str, Any]:
    today = date.today()
    start_this_week = today - timedelta(days=6)
    start_last_week = today - timedelta(days=13)
    end_last_week = today - timedelta(days=7)

    this_week_stats = db.query(
        func.count(Workout.id).label("workouts"),
        func.coalesce(func.sum(Workout.calories_burned), 0.0).label("calories"),
        func.coalesce(func.sum(Workout.duration), 0).label("duration"),
        func.count(func.distinct(Workout.workout_date)).label("active_days")
    ).filter(
        Workout.user_id == user_id,
        Workout.workout_date >= start_this_week,
        Workout.workout_date <= today
    ).first()

    last_week_stats = db.query(
        func.count(Workout.id).label("workouts"),
        func.coalesce(func.sum(Workout.calories_burned), 0.0).label("calories"),
        func.coalesce(func.sum(Workout.duration), 0).label("duration"),
        func.count(func.distinct(Workout.workout_date)).label("active_days")
    ).filter(
        Workout.user_id == user_id,
        Workout.workout_date >= start_last_week,
        Workout.workout_date <= end_last_week
    ).first()

    tw_cals = float(this_week_stats.calories) if this_week_stats else 0.0
    lw_cals = float(last_week_stats.calories) if last_week_stats else 0.0
    tw_wks = int(this_week_stats.workouts) if this_week_stats else 0
    lw_wks = int(last_week_stats.workouts) if last_week_stats else 0
    tw_dur = int(this_week_stats.duration) if this_week_stats else 0
    lw_dur = int(last_week_stats.duration) if last_week_stats else 0
    tw_days = int(this_week_stats.active_days) if this_week_stats else 0
    lw_days = int(last_week_stats.active_days) if last_week_stats else 0

    metrics = {
        "calories": calculate_metric_comparison(tw_cals, lw_cals),
        "workouts": calculate_metric_comparison(tw_wks, lw_wks),
        "duration": calculate_metric_comparison(tw_dur, lw_dur),
        "active_days": calculate_metric_comparison(tw_days, lw_days),
    }

    insights = []
    if metrics["calories"]["pct_change"] > 0:
        insights.append(f"🔥 Calories Burn: Up by {metrics['calories']['pct_change']}% compared to last week (+{metrics['calories']['change']} kcal)!")
    elif metrics["calories"]["pct_change"] < 0:
        insights.append(f"Calories burned is {abs(metrics['calories']['pct_change'])}% lower than last week. A great weekend push will close the gap!")
    else:
        insights.append("Consistent energy expenditure matched with last week.")

    if metrics["active_days"]["change"] >= 0 and tw_days >= 4:
        insights.append(f"🏆 High Discipline: Active on {tw_days} out of 7 days this week. Superb consistency!")
    elif tw_days < 3:
        insights.append("Suggested Goal: Try adding 15-min Surya Namaskar or evening walking to reach 4 active days this week.")

    if metrics["duration"]["change"] > 0:
        insights.append(f"⏱️ Training Volume: Trained {metrics['duration']['change']} more minutes this week (+{metrics['duration']['pct_change']}%).")

    return {
        "this_week": {
            "period": f"{start_this_week.strftime('%d %b')} – {today.strftime('%d %b')}",
            "calories": tw_cals,
            "workouts": tw_wks,
            "duration": tw_dur,
            "active_days": tw_days,
            "daily_avg_calories": round(tw_cals / 7, 1)
        },
        "last_week": {
            "period": f"{start_last_week.strftime('%d %b')} – {end_last_week.strftime('%d %b')}",
            "calories": lw_cals,
            "workouts": lw_wks,
            "duration": lw_dur,
            "active_days": lw_days,
            "daily_avg_calories": round(lw_cals / 7, 1)
        },
        "metrics": metrics,
        "insights": insights
    }

def get_monthly_comparison(db: Session, user_id: int) -> Dict[str, Any]:
    today = date.today()
    start_this_month = today - timedelta(days=29)
    start_last_month = today - timedelta(days=59)
    end_last_month = today - timedelta(days=30)

    this_m_stats = db.query(
        func.count(Workout.id).label("workouts"),
        func.coalesce(func.sum(Workout.calories_burned), 0.0).label("calories"),
        func.coalesce(func.sum(Workout.duration), 0).label("duration"),
        func.count(func.distinct(Workout.workout_date)).label("active_days")
    ).filter(
        Workout.user_id == user_id,
        Workout.workout_date >= start_this_month,
        Workout.workout_date <= today
    ).first()

    last_m_stats = db.query(
        func.count(Workout.id).label("workouts"),
        func.coalesce(func.sum(Workout.calories_burned), 0.0).label("calories"),
        func.coalesce(func.sum(Workout.duration), 0).label("duration"),
        func.count(func.distinct(Workout.workout_date)).label("active_days")
    ).filter(
        Workout.user_id == user_id,
        Workout.workout_date >= start_last_month,
        Workout.workout_date <= end_last_month
    ).first()

    tm_cals = float(this_m_stats.calories) if this_m_stats else 0.0
    lm_cals = float(last_m_stats.calories) if last_m_stats else 0.0
    tm_wks = int(this_m_stats.workouts) if this_m_stats else 0
    lm_wks = int(last_m_stats.workouts) if last_m_stats else 0
    tm_dur = int(this_m_stats.duration) if this_m_stats else 0
    lm_dur = int(last_m_stats.duration) if last_m_stats else 0
    tm_days = int(this_m_stats.active_days) if this_m_stats else 0
    lm_days = int(last_m_stats.active_days) if last_m_stats else 0

    metrics = {
        "calories": calculate_metric_comparison(tm_cals, lm_cals),
        "workouts": calculate_metric_comparison(tm_wks, lm_wks),
        "duration": calculate_metric_comparison(tm_dur, lm_dur),
        "active_days": calculate_metric_comparison(tm_days, lm_days),
    }

    insights = [
        f"Monthly Output: Burned {round(tm_cals)} kcal across {tm_wks} workouts and {tm_dur} active minutes.",
        f"Improvement: {metrics['calories']['pct_change']}% calorie change compared to the preceding 30 days.",
        f"Monthly Habit Index: {tm_days} workout days out of 30 days ({round((tm_days / 30) * 100)}% consistency)."
    ]

    return {
        "this_month": {
            "period": "Last 30 Days",
            "calories": tm_cals,
            "workouts": tm_wks,
            "duration": tm_dur,
            "active_days": tm_days
        },
        "last_month": {
            "period": "Previous 30 Days",
            "calories": lm_cals,
            "workouts": lm_wks,
            "duration": lm_dur,
            "active_days": lm_days
        },
        "metrics": metrics,
        "insights": insights
    }

# ---------------- MODULE 12: PERSONALIZED DASHBOARD ----------------
def get_personalized_dashboard_data(db: Session, user: User) -> Dict[str, Any]:
    summary = get_dashboard_summary(db, user.id)
    streak_info = get_streak_details(db, user.id)

    # Active goals with progress percentage
    goals = db.query(Goal).filter(Goal.user_id == user.id, Goal.is_completed == False).order_by(Goal.deadline.asc()).all()
    goals_list = []
    for g in goals:
        pct = round(min(100.0, (g.current_value / g.target_value) * 100), 1) if g.target_value > 0 else 0.0
        goals_list.append({
            "id": g.id,
            "user_id": g.user_id,
            "goal_type": g.goal_type,
            "target_value": g.target_value,
            "current_value": g.current_value,
            "deadline": g.deadline,
            "is_completed": g.is_completed,
            "created_at": g.created_at,
            "progress_percentage": pct
        })

    # Upcoming scheduled workouts (next 7 days)
    today = date.today()
    next_week = today + timedelta(days=7)
    plans = db.query(WorkoutPlan).filter(
        WorkoutPlan.user_id == user.id,
        WorkoutPlan.scheduled_date >= today,
        WorkoutPlan.scheduled_date <= next_week
    ).order_by(WorkoutPlan.scheduled_date.asc()).all()

    # Badges info
    badges = get_all_badges_for_user(db, user.id)
    unlocked_badges = [b for b in badges if b["is_unlocked"]]
    recent_badges = sorted(unlocked_badges, key=lambda x: x["earned_at"] or datetime.min, reverse=True)[:4]

    # Time-of-day greeting
    now_hour = datetime.now().hour
    if 5 <= now_hour < 12:
        greeting = f"सुप्रभात / Shubh Prabhat, {user.username}! 🌅 Ready for morning Surya Namaskar & fresh training?"
    elif 12 <= now_hour < 17:
        greeting = f"नमस्ते / Namaste, {user.username}! ☀️ Keep that midday athletic focus strong."
    elif 17 <= now_hour < 21:
        greeting = f"शुभ संध्या / Shubh Sandhya, {user.username}! 🌇 Perfect hour for an evening workout or Shatapawali."
    else:
        greeting = f"शुभ रात्रि / Shubh Ratri, {user.username}! 🌙 Rest, hydrate, and prepare for tomorrow's gains."

    desi_shlokas = [
        {"sanskrit": "शरीरमाद्यं खलु धर्मसाधनम्", "english": "The physical body is the foremost instrument for all purposeful action in life."},
        {"sanskrit": "योगः कर्मसु कौशलम्", "english": "Yoga is supreme skill, focus, and excellence in all action."},
        {"sanskrit": "उद्यमेन हि सिध्यन्ति कार्याणि न मनोरथैः", "english": "True accomplishments are achieved through rigorous effort, not mere daydreams."}
    ]
    shloka = desi_shlokas[today.day % len(desi_shlokas)]

    # Weekly improvement snippet
    weekly_comp = get_weekly_comparison(db, user.id)
    cal_change = weekly_comp["metrics"]["calories"]["pct_change"]
    if cal_change > 0:
        improvement_text = f"+{cal_change}% calorie burn compared to last week"
    elif cal_change < 0:
        improvement_text = f"{cal_change}% compared to last week"
    else:
        improvement_text = "Steady energy expenditure matching last week"

    return {
        "user": user,
        "greeting": greeting,
        "desi_shloka": shloka,
        "today_workouts": summary["today_workouts"],
        "today_calories": summary["today_calories"],
        "today_duration": summary["today_duration"],
        "weekly_calories": summary["weekly_calories"],
        "monthly_calories": summary["monthly_calories"],
        "streak": streak_info,
        "active_goals": goals_list,
        "upcoming_plans": plans,
        "recent_badges": recent_badges,
        "total_badges_unlocked": len(unlocked_badges),
        "weekly_improvement": improvement_text,
    }

def get_dashboard_summary(db: Session, user_id: int):
    today = date.today()
    week_ago = today - timedelta(days=7)
    month_ago = today - timedelta(days=30)

    today_stats = db.query(
        func.count(Workout.id).label("count"),
        func.coalesce(func.sum(Workout.calories_burned), 0.0).label("cals"),
        func.coalesce(func.sum(Workout.duration), 0).label("dur")
    ).filter(
        Workout.user_id == user_id,
        Workout.workout_date == today
    ).first()

    week_cals = db.query(func.coalesce(func.sum(Workout.calories_burned), 0.0)).filter(
        Workout.user_id == user_id,
        Workout.workout_date >= week_ago
    ).scalar() or 0.0

    month_cals = db.query(func.coalesce(func.sum(Workout.calories_burned), 0.0)).filter(
        Workout.user_id == user_id,
        Workout.workout_date >= month_ago
    ).scalar() or 0.0

    streak_obj = update_user_streak(db, user_id)

    active_goals = db.query(Goal).filter(
        Goal.user_id == user_id,
        Goal.is_completed == False
    ).count()

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
        "current_streak": streak_obj.current_streak,
        "active_goals_count": active_goals,
        "unread_notifications_count": unread_notifs
    }

