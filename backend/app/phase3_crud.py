from datetime import date, datetime, timedelta
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from .models import (
    Meal, WaterTracking, ExternalIntegration, ReminderSetting,
    Workout, Goal, Notification, utc_now
)
from .schemas import (
    MealCreate, MealUpdate, WaterLogCreate, ReminderSettingUpdate,
    WorkoutCreate, IntegrationSyncRequest
)
from .crud import (
    create_notification, create_workout, get_streak_details
)

MEAL_TYPES = ("Breakfast", "Lunch", "Dinner", "Snacks")

INTEGRATION_PROVIDERS = {
    "google_fit": "Google Fit",
    "apple_health": "Apple Health",
}


# ---------------- REMINDER SETTINGS HELPERS ----------------
def get_or_create_reminder_settings(db: Session, user_id: int) -> ReminderSetting:
    setting = db.query(ReminderSetting).filter(ReminderSetting.user_id == user_id).first()
    if not setting:
        setting = ReminderSetting(user_id=user_id)
        db.add(setting)
        db.commit()
        db.refresh(setting)
    return setting


def update_reminder_settings(
    db: Session, user_id: int, settings_in: ReminderSettingUpdate
) -> ReminderSetting:
    setting = get_or_create_reminder_settings(db, user_id)
    update_data = settings_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(setting, field, value)
    db.commit()
    db.refresh(setting)
    return setting


def evaluate_reminders(db: Session, user_id: int) -> Dict[str, Any]:
    """Generate due in-app workout, meal, and water notifications without duplicating today's alerts."""
    setting = get_or_create_reminder_settings(db, user_id)
    today = date.today()
    today_start = datetime.combine(today, datetime.min.time())

    existing_titles = {
        row[0].lower()
        for row in db.query(Notification.title).filter(
            Notification.user_id == user_id,
            Notification.created_at >= today_start,
        ).all()
    }

    def has_alert(keyword: str) -> bool:
        return any(keyword in title for title in existing_titles)

    triggered_types: List[str] = []

    if setting.workout_reminder_enabled and not has_alert("workout reminder"):
        today_workouts = db.query(Workout).filter(
            Workout.user_id == user_id,
            Workout.workout_date == today,
        ).count()
        if today_workouts == 0:
            create_notification(
                db,
                user_id,
                title=f"Workout Reminder ({setting.workout_reminder_time})",
                message=setting.workout_reminder_note,
            )
            triggered_types.append("workout")

    if setting.meal_reminder_enabled and not has_alert("meal reminder"):
        today_meals = db.query(Meal).filter(
            Meal.user_id == user_id,
            Meal.meal_date == today,
        ).count()
        if today_meals < 2:
            create_notification(
                db,
                user_id,
                title="Meal Tracking Reminder",
                message=f"Remember to log your meals ({setting.meal_reminder_times}) to stay within your {setting.daily_calorie_goal} kcal goal.",
            )
            triggered_types.append("meal")

    if setting.water_reminder_enabled and not has_alert("hydration reminder"):
        water_total = db.query(func.coalesce(func.sum(WaterTracking.quantity), 0)).filter(
            WaterTracking.user_id == user_id,
            WaterTracking.date == today,
        ).scalar() or 0
        if water_total < setting.daily_water_goal_ml:
            remaining_ml = setting.daily_water_goal_ml - int(water_total)
            create_notification(
                db,
                user_id,
                title="Hydration Reminder",
                message=f"Drink a glass of water every {setting.water_reminder_interval_mins} mins — {remaining_ml} ml left to reach your {setting.daily_water_goal_ml / 1000:.1f} L goal.",
            )
            triggered_types.append("water")

    count = len(triggered_types)
    msg = (
        f"Created {count} reminder notification(s): {', '.join(triggered_types)}."
        if count > 0
        else "All enabled reminders for today are already delivered or completed."
    )
    return {
        "triggered_count": count,
        "triggered_types": triggered_types,
        "message": msg,
    }


# ---------------- MEALS & NUTRITION CRUD ----------------
def create_meal(db: Session, user_id: int, meal_in: MealCreate) -> Meal:
    meal = Meal(
        user_id=user_id,
        meal_type=meal_in.meal_type,
        food_name=meal_in.food_name.strip(),
        calories=float(meal_in.calories),
        protein=float(meal_in.protein),
        carbs=float(meal_in.carbs),
        fats=float(meal_in.fats),
        meal_date=meal_in.meal_date or date.today(),
    )
    db.add(meal)
    db.commit()
    db.refresh(meal)
    return meal


def get_meals(
    db: Session,
    user_id: int,
    target_date: Optional[date] = None,
    meal_type: Optional[str] = None,
) -> List[Meal]:
    query = db.query(Meal).filter(Meal.user_id == user_id)
    if target_date:
        query = query.filter(Meal.meal_date == target_date)
    if meal_type:
        query = query.filter(Meal.meal_type == meal_type)
    return query.order_by(desc(Meal.meal_date), desc(Meal.created_at)).all()


def get_meal_by_id(db: Session, meal_id: int, user_id: int) -> Optional[Meal]:
    return db.query(Meal).filter(Meal.id == meal_id, Meal.user_id == user_id).first()


def update_meal(db: Session, meal: Meal, meal_in: MealUpdate) -> Meal:
    update_data = meal_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field == "food_name" and isinstance(value, str):
            value = value.strip()
        setattr(meal, field, value)
    db.commit()
    db.refresh(meal)
    return meal


def delete_meal(db: Session, meal: Meal) -> bool:
    db.delete(meal)
    db.commit()
    return True


def get_nutrition_summary(
    db: Session, user_id: int, target_date: Optional[date] = None
) -> Dict[str, Any]:
    ref_date = target_date or date.today()
    settings = get_or_create_reminder_settings(db, user_id)
    meals = get_meals(db, user_id, target_date=ref_date)

    calories_burned = float(
        db.query(func.coalesce(func.sum(Workout.calories_burned), 0.0))
        .filter(Workout.user_id == user_id, Workout.workout_date == ref_date)
        .scalar()
        or 0.0
    )

    by_type = {
        mtype: {"calories": 0.0, "protein": 0.0, "carbs": 0.0, "fats": 0.0, "count": 0}
        for mtype in MEAL_TYPES
    }

    total_calories = 0.0
    total_protein = 0.0
    total_carbs = 0.0
    total_fats = 0.0

    for m in meals:
        total_calories += m.calories
        total_protein += m.protein
        total_carbs += m.carbs
        total_fats += m.fats
        bucket = by_type.setdefault(
            m.meal_type,
            {"calories": 0.0, "protein": 0.0, "carbs": 0.0, "fats": 0.0, "count": 0},
        )
        bucket["calories"] = round(bucket["calories"] + m.calories, 1)
        bucket["protein"] = round(bucket["protein"] + m.protein, 1)
        bucket["carbs"] = round(bucket["carbs"] + m.carbs, 1)
        bucket["fats"] = round(bucket["fats"] + m.fats, 1)
        bucket["count"] += 1

    start_date = ref_date - timedelta(days=6)
    meal_rows = dict(
        db.query(Meal.meal_date, func.coalesce(func.sum(Meal.calories), 0.0))
        .filter(
            Meal.user_id == user_id,
            Meal.meal_date >= start_date,
            Meal.meal_date <= ref_date,
        )
        .group_by(Meal.meal_date)
        .all()
    )
    burn_rows = dict(
        db.query(Workout.workout_date, func.coalesce(func.sum(Workout.calories_burned), 0.0))
        .filter(
            Workout.user_id == user_id,
            Workout.workout_date >= start_date,
            Workout.workout_date <= ref_date,
        )
        .group_by(Workout.workout_date)
        .all()
    )

    weekly_trend = []
    for offset in range(7):
        day = start_date + timedelta(days=offset)
        weekly_trend.append({
            "date": day.isoformat(),
            "label": day.strftime("%a"),
            "calories_in": round(float(meal_rows.get(day, 0.0)), 1),
            "calories_burned": round(float(burn_rows.get(day, 0.0)), 1),
        })

    return {
        "date": ref_date,
        "total_calories": round(total_calories, 1),
        "calorie_goal": settings.daily_calorie_goal,
        "calories_burned": round(calories_burned, 1),
        "net_calories": round(total_calories - calories_burned, 1),
        "total_protein": round(total_protein, 1),
        "total_carbs": round(total_carbs, 1),
        "total_fats": round(total_fats, 1),
        "meals_count": len(meals),
        "by_meal_type": by_type,
        "weekly_trend": weekly_trend,
    }


# ---------------- WATER TRACKING CRUD ----------------
def log_water(db: Session, user_id: int, water_in: WaterLogCreate) -> WaterTracking:
    entry = WaterTracking(
        user_id=user_id,
        quantity=int(water_in.quantity),
        date=water_in.date or date.today(),
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def delete_water_log(db: Session, entry_id: int, user_id: int) -> bool:
    entry = db.query(WaterTracking).filter(
        WaterTracking.id == entry_id,
        WaterTracking.user_id == user_id,
    ).first()
    if not entry:
        return False
    db.delete(entry)
    db.commit()
    return True


def update_water_goal(db: Session, user_id: int, goal_ml: int) -> ReminderSetting:
    setting = get_or_create_reminder_settings(db, user_id)
    setting.daily_water_goal_ml = int(goal_ml)
    db.commit()
    db.refresh(setting)
    return setting


def get_water_summary(
    db: Session, user_id: int, target_date: Optional[date] = None
) -> Dict[str, Any]:
    ref_date = target_date or date.today()
    setting = get_or_create_reminder_settings(db, user_id)
    logs = (
        db.query(WaterTracking)
        .filter(WaterTracking.user_id == user_id, WaterTracking.date == ref_date)
        .order_by(desc(WaterTracking.created_at))
        .all()
    )
    total_ml = sum(entry.quantity for entry in logs)
    goal_ml = setting.daily_water_goal_ml or 2500
    progress_pct = round(min(100.0, (total_ml / goal_ml) * 100.0), 1) if goal_ml > 0 else 0.0

    start_date = ref_date - timedelta(days=6)
    day_totals = dict(
        db.query(WaterTracking.date, func.coalesce(func.sum(WaterTracking.quantity), 0))
        .filter(
            WaterTracking.user_id == user_id,
            WaterTracking.date >= start_date,
            WaterTracking.date <= ref_date,
        )
        .group_by(WaterTracking.date)
        .all()
    )
    weekly_trend = []
    for offset in range(7):
        day = start_date + timedelta(days=offset)
        day_ml = int(day_totals.get(day, 0))
        weekly_trend.append({
            "date": day.isoformat(),
            "label": day.strftime("%a"),
            "total_ml": day_ml,
            "liters": round(day_ml / 1000.0, 2),
        })

    return {
        "date": ref_date,
        "total_ml": total_ml,
        "liters_consumed": round(total_ml / 1000.0, 2),
        "daily_goal_ml": goal_ml,
        "goal_liters": round(goal_ml / 1000.0, 2),
        "progress_percentage": progress_pct,
        "logs": logs,
        "weekly_trend": weekly_trend,
    }


# ---------------- WORKOUT SUGGESTIONS ----------------
def get_workout_suggestions(db: Session, user_id: int) -> Dict[str, Any]:
    today = date.today()
    window_start = today - timedelta(days=13)

    recent_workouts = (
        db.query(Workout)
        .filter(Workout.user_id == user_id, Workout.workout_date >= window_start)
        .order_by(desc(Workout.workout_date))
        .all()
    )
    active_goals = (
        db.query(Goal)
        .filter(Goal.user_id == user_id, Goal.is_completed == False)
        .all()
    )
    streak_info = get_streak_details(db, user_id)
    streak_status = streak_info["status"]
    current_streak = streak_info["current_streak"]

    cat_counts: Dict[str, int] = {}
    for w in recent_workouts:
        cat_counts[w.category] = cat_counts.get(w.category, 0) + 1

    last_category = recent_workouts[0].category if recent_workouts else None
    goal_text = " ".join(g.goal_type.lower() for g in active_goals)

    suggestions: List[Dict[str, Any]] = []

    def add_suggestion(item: Dict[str, Any]):
        if all(existing["title"] != item["title"] for existing in suggestions):
            suggestions.append(item)

    if streak_status == "at_risk":
        add_suggestion({
            "title": "Express Streak-Saver Flow",
            "category": "HIIT",
            "suggested_duration_mins": 20,
            "estimated_calories": 240.0,
            "intensity": "Moderate-High",
            "reason": f"Your {current_streak}-day streak is at risk today. A focused 20-minute session keeps your momentum intact.",
            "exercises": ["Jumping Jacks (3 min)", "Kettlebell or Bodyweight Squats (3x15)", "Mountain Climbers (3x30s)", "Forearm Plank (2x45s)"],
        })

    if "calorie" in goal_text or "weight" in goal_text or cat_counts.get("HIIT", 0) < 2:
        add_suggestion({
            "title": "Metabolic HIIT Circuit",
            "category": "HIIT",
            "suggested_duration_mins": 28,
            "estimated_calories": 350.0,
            "intensity": "High",
            "reason": (
                "Aligned with your active calorie-burn goal to maximize energy output in under 30 minutes."
                if "calorie" in goal_text
                else "You logged few high-intensity sessions in the last two weeks — HIIT boosts cardiovascular output."
            ),
            "exercises": ["Burpee Intervals (4x40s)", "Alternating Jump Lunges (4x16)", "High Knees Sprint (4x40s)", "Russian Twists (3x20)"],
        })

    if cat_counts.get("Strength", 0) <= cat_counts.get("Cardio", 0) or "strength" in goal_text or last_category == "Cardio":
        add_suggestion({
            "title": "Balanced Upper & Core Strength",
            "category": "Strength",
            "suggested_duration_mins": 40,
            "estimated_calories": 340.0,
            "intensity": "Moderate",
            "reason": (
                f"You completed Cardio most recently; pairing it with strength training balances muscular endurance."
                if last_category == "Cardio"
                else "Adding compound resistance work preserves lean muscle alongside endurance training."
            ),
            "exercises": ["Push-Ups or Dumbbell Press (4x12)", "Bent-Over Rows (4x12)", "Goblet Squats (3x12)", "Dead Bug Core Hold (3x12)"],
        })

    if cat_counts.get("Yoga", 0) == 0 or len(recent_workouts) >= 6:
        add_suggestion({
            "title": "Mobility & Active Recovery Flow",
            "category": "Yoga",
            "suggested_duration_mins": 25,
            "estimated_calories": 140.0,
            "intensity": "Low",
            "reason": (
                f"You logged {len(recent_workouts)} workouts over 14 days — mobility work improves joint recovery."
                if len(recent_workouts) >= 6
                else "No mobility or yoga sessions logged recently; stretching supports posture and soreness recovery."
            ),
            "exercises": ["Sun Salutation Flow (6 min)", "Hip Flexor Lunge Hold (4 min)", "Thoracic Spine Twist (5 min)", "Deep Breathing Cooldown (5 min)"],
        })

    if cat_counts.get("Cardio", 0) < 3 or last_category == "Strength":
        add_suggestion({
            "title": "Zone 2 Endurance Jog or Brisk Pace",
            "category": "Cardio",
            "suggested_duration_mins": 35,
            "estimated_calories": 385.0,
            "intensity": "Moderate",
            "reason": "Builds aerobic base capacity without excessive fatigue, ideal between heavier training days.",
            "exercises": ["5-Min Dynamic Warm-Up", "25-Min Steady Aerobic Pace", "5-Min Cool-Down Walk & Calf Stretch"],
        })

    # Always return top 4 curated options
    suggestions = suggestions[:4]

    if not recent_workouts:
        focus_summary = "Balanced starter plan combining aerobic base, bodyweight strength, and mobility."
    else:
        top_cat = max(cat_counts.items(), key=lambda kv: kv[1])[0]
        focus_summary = f"Based on {len(recent_workouts)} workouts in the past 14 days (mostly {top_cat}) and {len(active_goals)} active goal(s)."

    return {
        "focus_summary": focus_summary,
        "streak_status": streak_status,
        "suggestions": suggestions,
    }


# ---------------- THIRD-PARTY INTEGRATIONS ----------------
def _validate_provider(provider: str) -> str:
    clean = provider.lower().strip()
    if clean not in INTEGRATION_PROVIDERS:
        raise ValueError(f"Unsupported provider '{provider}'. Supported: {', '.join(INTEGRATION_PROVIDERS)}")
    return clean


def _get_or_create_integration(db: Session, user_id: int, provider: str) -> ExternalIntegration:
    clean = _validate_provider(provider)
    record = db.query(ExternalIntegration).filter(
        ExternalIntegration.user_id == user_id,
        ExternalIntegration.provider == clean,
    ).first()
    if not record:
        record = ExternalIntegration(user_id=user_id, provider=clean, is_connected=False)
        db.add(record)
        db.commit()
        db.refresh(record)
    return record


def _serialize_integration(record: ExternalIntegration) -> Dict[str, Any]:
    return {
        "provider": record.provider,
        "label": INTEGRATION_PROVIDERS.get(record.provider, record.provider),
        "is_connected": record.is_connected,
        "daily_steps": record.daily_steps,
        "synced_calories": record.synced_calories,
        "last_synced_at": record.last_synced_at,
    }


def get_integrations(db: Session, user_id: int) -> List[Dict[str, Any]]:
    return [
        _serialize_integration(_get_or_create_integration(db, user_id, provider))
        for provider in INTEGRATION_PROVIDERS
    ]


def connect_integration(db: Session, user_id: int, provider: str) -> Dict[str, Any]:
    record = _get_or_create_integration(db, user_id, provider)
    record.is_connected = True
    db.commit()
    db.refresh(record)
    create_notification(
        db,
        user_id,
        title=f"{INTEGRATION_PROVIDERS[record.provider]} Connected",
        message=f"Your {INTEGRATION_PROVIDERS[record.provider]} account is linked and ready to sync steps and workouts.",
    )
    return _serialize_integration(record)


def disconnect_integration(db: Session, user_id: int, provider: str) -> Dict[str, Any]:
    record = _get_or_create_integration(db, user_id, provider)
    record.is_connected = False
    db.commit()
    db.refresh(record)
    return _serialize_integration(record)


def sync_integration(
    db: Session,
    user_id: int,
    provider: str,
    sync_req: Optional[IntegrationSyncRequest] = None,
) -> Dict[str, Any]:
    record = _get_or_create_integration(db, user_id, provider)
    if not record.is_connected:
        raise PermissionError(f"{INTEGRATION_PROVIDERS[record.provider]} is not connected.")

    default_steps = 6850 if record.provider == "google_fit" else 7420
    steps = sync_req.steps if (sync_req and sync_req.steps is not None) else default_steps
    active_mins = (
        sync_req.active_minutes
        if (sync_req and sync_req.active_minutes is not None)
        else max(15, round(steps / 135))
    )
    calories = round(steps * 0.04, 1)

    record.daily_steps = steps
    record.synced_calories = calories
    record.last_synced_at = utc_now()
    db.commit()
    db.refresh(record)

    label = INTEGRATION_PROVIDERS[record.provider]
    category = "Cardio" if (steps >= 9000 and active_mins >= 45) else "Walking"
    workout_in = WorkoutCreate(
        workout_name=f"{label} Sync ({steps:,} steps)",
        category=category,
        duration=active_mins,
        calories_burned=calories,
        workout_date=date.today(),
    )
    create_workout(db, user_id, workout_in)

    # Update active step goals if any exist
    step_goals = db.query(Goal).filter(Goal.user_id == user_id, Goal.is_completed == False).all()
    for g in step_goals:
        if "step" in g.goal_type.lower():
            g.current_value += float(steps)
            if g.current_value >= g.target_value:
                g.is_completed = True
                create_notification(
                    db,
                    user_id,
                    title="Goal Completed!",
                    message=f"You hit your goal target: {g.goal_type} ({g.target_value})!",
                )
    db.commit()

    create_notification(
        db,
        user_id,
        title=f"{label} Sync Complete",
        message=f"Synced {steps:,} steps ({active_mins} min, {calories} kcal) into your workout log.",
    )

    return {
        "provider": record.provider,
        "steps_synced": steps,
        "active_minutes": active_mins,
        "calories_synced": calories,
        "workout_logged": True,
        "message": f"Synced {steps:,} steps and {calories} kcal from {label}.",
        "integration": _serialize_integration(record),
    }


# ---------------- ADVANCED ANALYTICS ----------------
def get_advanced_analytics(db: Session, user_id: int, period: str = "monthly") -> Dict[str, Any]:
    clean_period = "weekly" if period == "weekly" else "monthly"
    total_days = 7 if clean_period == "weekly" else 30
    today = date.today()
    start_date = today - timedelta(days=total_days - 1)

    workouts = (
        db.query(Workout)
        .filter(
            Workout.user_id == user_id,
            Workout.workout_date >= start_date,
            Workout.workout_date <= today,
        )
        .all()
    )
    meals = (
        db.query(Meal)
        .filter(
            Meal.user_id == user_id,
            Meal.meal_date >= start_date,
            Meal.meal_date <= today,
        )
        .all()
    )
    water_logs = (
        db.query(WaterTracking)
        .filter(
            WaterTracking.user_id == user_id,
            WaterTracking.date >= start_date,
            WaterTracking.date <= today,
        )
        .all()
    )
    all_goals = db.query(Goal).filter(Goal.user_id == user_id).all()

    burn_by_day: Dict[date, float] = {}
    mins_by_day: Dict[date, int] = {}
    active_dates = set()
    category_map: Dict[str, Dict[str, Any]] = {}

    weekday_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    weekday_stats = {
        idx: {"day": name, "workouts": 0, "calories": 0.0, "minutes": 0}
        for idx, name in enumerate(weekday_names)
    }

    for w in workouts:
        active_dates.add(w.workout_date)
        burn_by_day[w.workout_date] = burn_by_day.get(w.workout_date, 0.0) + w.calories_burned
        mins_by_day[w.workout_date] = mins_by_day.get(w.workout_date, 0) + w.duration

        cat = category_map.setdefault(
            w.category, {"category": w.category, "sessions": 0, "minutes": 0, "calories": 0.0}
        )
        cat["sessions"] += 1
        cat["minutes"] += w.duration
        cat["calories"] = round(cat["calories"] + w.calories_burned, 1)

        wd = weekday_stats[w.workout_date.weekday()]
        wd["workouts"] += 1
        wd["minutes"] += w.duration
        wd["calories"] = round(wd["calories"] + w.calories_burned, 1)

    intake_by_day: Dict[date, float] = {}
    for m in meals:
        intake_by_day[m.meal_date] = intake_by_day.get(m.meal_date, 0.0) + m.calories

    water_by_day: Dict[date, int] = {}
    for wl in water_logs:
        water_by_day[wl.date] = water_by_day.get(wl.date, 0) + wl.quantity

    daily_balance_series = []
    for offset in range(total_days):
        d = start_date + timedelta(days=offset)
        daily_balance_series.append({
            "date": d.isoformat(),
            "label": d.strftime("%a") if total_days <= 7 else d.strftime("%d %b"),
            "calories_burned": round(burn_by_day.get(d, 0.0), 1),
            "calories_consumed": round(intake_by_day.get(d, 0.0), 1),
            "duration_minutes": mins_by_day.get(d, 0),
            "water_ml": water_by_day.get(d, 0),
        })

    active_days = len(active_dates)
    consistency_score = round((active_days / total_days) * 100.0, 1)

    total_goals = len(all_goals)
    completed_goals = sum(1 for g in all_goals if g.is_completed)
    goal_completion_rate = round((completed_goals / total_goals) * 100.0, 1) if total_goals > 0 else 0.0

    avg_daily_burn = round(sum(burn_by_day.values()) / total_days, 1)
    meal_days = len(intake_by_day) or 1
    avg_daily_intake = round(sum(intake_by_day.values()) / meal_days, 1) if intake_by_day else 0.0
    water_days = len(water_by_day) or 1
    avg_daily_water_liters = round((sum(water_by_day.values()) / water_days) / 1000.0, 2) if water_by_day else 0.0

    weekday_breakdown = [weekday_stats[i] for i in range(7)]
    best_wd_entry = max(weekday_breakdown, key=lambda x: (x["workouts"], x["calories"]))
    best_weekday = best_wd_entry["day"] if best_wd_entry["workouts"] > 0 else None

    category_distribution = sorted(
        category_map.values(), key=lambda x: x["calories"], reverse=True
    )

    insights = []
    if active_days == 0:
        insights.append(f"No workouts logged in the past {total_days} days yet. Starting a single session builds baseline consistency.")
    else:
        insights.append(f"You trained on {active_days} of the last {total_days} days ({consistency_score}% workout consistency).")

    if best_weekday:
        insights.append(f"{best_weekday} is your strongest training day with {best_wd_entry['workouts']} session(s) and {int(best_wd_entry['calories'])} kcal burned.")

    if total_goals > 0:
        insights.append(f"Goal completion stands at {completed_goals}/{total_goals} ({goal_completion_rate}%).")

    if avg_daily_intake > 0:
        insights.append(f"Logged nutrition averages {int(avg_daily_intake)} kcal/day alongside {avg_daily_burn} kcal/day exercise burn.")

    return {
        "period": clean_period,
        "consistency_score": consistency_score,
        "active_days": active_days,
        "total_period_days": total_days,
        "goal_completion_rate": goal_completion_rate,
        "completed_goals": completed_goals,
        "total_goals": total_goals,
        "avg_daily_burn": avg_daily_burn,
        "avg_daily_intake": avg_daily_intake,
        "avg_daily_water_liters": avg_daily_water_liters,
        "best_weekday": best_weekday,
        "daily_balance_series": daily_balance_series,
        "weekday_breakdown": weekday_breakdown,
        "category_distribution": category_distribution,
        "insights": insights,
    }
