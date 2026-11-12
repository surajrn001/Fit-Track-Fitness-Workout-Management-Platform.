from datetime import datetime, date
from typing import Optional, List, Literal
from pydantic import BaseModel, EmailStr, Field

# ----------------- User Schemas -----------------
class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# ----------------- Workout Schemas -----------------
class WorkoutBase(BaseModel):
    workout_name: str = Field(..., min_length=2, max_length=150)
    category: str = Field(..., description="Cardio, Strength, Yoga, HIIT, Pilates, etc.")
    duration: int = Field(..., gt=0, description="Duration in minutes")
    calories_burned: float = Field(..., ge=0, description="Estimated calories burned")
    workout_date: date = Field(default_factory=date.today)

class WorkoutCreate(WorkoutBase):
    pass

class WorkoutUpdate(BaseModel):
    workout_name: Optional[str] = Field(None, min_length=2, max_length=150)
    category: Optional[str] = None
    duration: Optional[int] = Field(None, gt=0)
    calories_burned: Optional[float] = Field(None, ge=0)
    workout_date: Optional[date] = None

class WorkoutResponse(WorkoutBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- Progress Schemas -----------------
class ProgressResponse(BaseModel):
    id: int
    user_id: int
    total_workouts: int
    total_calories: float
    date: date

    class Config:
        from_attributes = True

class DashboardSummaryResponse(BaseModel):
    today_workouts: int
    today_calories: float
    today_duration: int
    weekly_calories: float
    monthly_calories: float
    current_streak: int
    active_goals_count: int
    unread_notifications_count: int

# ----------------- Goal Schemas -----------------
class GoalBase(BaseModel):
    goal_type: str = Field(..., description="Weight Loss / Muscle Gain / Steps / Calories Burned / Workout Count")
    target_value: float = Field(..., gt=0)
    current_value: float = Field(default=0.0, ge=0)
    deadline: date

class GoalCreate(GoalBase):
    pass

class GoalUpdate(BaseModel):
    goal_type: Optional[str] = None
    target_value: Optional[float] = Field(None, gt=0)
    current_value: Optional[float] = Field(None, ge=0)
    deadline: Optional[date] = None
    is_completed: Optional[bool] = None

class GoalProgressUpdate(BaseModel):
    current_value: float = Field(..., ge=0)

class GoalResponse(GoalBase):
    id: int
    user_id: int
    is_completed: bool
    created_at: datetime
    progress_percentage: float = 0.0

    class Config:
        from_attributes = True

# ----------------- Notification Schemas -----------------
class NotificationCreate(BaseModel):
    title: str
    message: str

class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- Analytics Schemas -----------------
class CategoryStat(BaseModel):
    category: str
    count: int
    calories: float
    duration: int

class DailyTrend(BaseModel):
    date: str
    day_name: str
    calories: float
    duration: int
    count: int

class WeeklyAnalyticsResponse(BaseModel):
    days: List[DailyTrend]
    total_calories: float
    total_duration: int
    total_workouts: int
    categories: List[CategoryStat]

class MonthlyAnalyticsResponse(BaseModel):
    month_name: str
    total_calories: float
    total_duration: int
    total_workouts: int
    daily_data: List[DailyTrend]
    categories: List[CategoryStat]

# Plans & Scheduling
class WorkoutPlanBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=200)
    description: Optional[str] = None
    scheduled_date: date

class WorkoutPlanCreate(WorkoutPlanBase):
    pass

class WorkoutPlanUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=2, max_length=200)
    description: Optional[str] = None
    scheduled_date: Optional[date] = None
    is_completed: Optional[bool] = None

class WorkoutPlanResponse(WorkoutPlanBase):
    id: int
    user_id: int
    is_completed: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Exercise Library
class ExerciseBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    category: str = Field(..., description="Cardio / Strength / Yoga")
    description: Optional[str] = None
    duration: int = Field(..., gt=0, description="Duration in minutes")
    calories_est: float = Field(default=150.0, ge=0)
    difficulty: str = Field(default="Intermediate")

class ExerciseCreate(ExerciseBase):
    pass

class ExerciseResponse(ExerciseBase):
    id: int

    class Config:
        from_attributes = True

class ExerciseLogRequest(BaseModel):
    workout_date: Optional[date] = None
    duration: Optional[int] = Field(None, gt=0)
    calories_burned: Optional[float] = Field(None, ge=0)

# Progress Comparison
class MetricComparison(BaseModel):
    current: float
    previous: float
    change: float
    pct_change: float
    trend: str  # "up", "down", "same"

class WeeklyComparisonResponse(BaseModel):
    this_week: dict
    last_week: dict
    metrics: dict
    insights: List[str]

class MonthlyComparisonResponse(BaseModel):
    this_month: dict
    last_month: dict
    metrics: dict
    insights: List[str]

# Streak Tracking
class StreakResponse(BaseModel):
    user_id: int
    current_streak: int
    longest_streak: int
    last_workout_date: Optional[date]
    status: str            # "active", "at_risk", "resting"
    next_milestone: int
    days_to_milestone: int
    streak_message: str

    class Config:
        from_attributes = True

# Achievement Badges
class BadgeResponse(BaseModel):
    id: int
    name: str
    description: str
    icon: str
    category: str
    is_unlocked: bool = False
    earned_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class UserBadgeResponse(BaseModel):
    id: int
    user_id: int
    badge_id: int
    earned_at: datetime
    badge: BadgeResponse

    class Config:
        from_attributes = True

# Personalized Dashboard
class PersonalizedDashboardResponse(BaseModel):
    user: UserResponse
    greeting: str
    desi_shloka: dict
    today_workouts: int
    today_calories: float
    today_duration: int
    weekly_calories: float
    monthly_calories: float
    streak: StreakResponse
    active_goals: List[GoalResponse]
    upcoming_plans: List[WorkoutPlanResponse]
    recent_badges: List[BadgeResponse]
    total_badges_unlocked: int
    weekly_improvement: Optional[str] = None


# ----------------- Meals & Nutrition Schemas -----------------
MealTypeLiteral = Literal["Breakfast", "Lunch", "Dinner", "Snacks"]

class MealBase(BaseModel):
    meal_type: MealTypeLiteral
    food_name: str = Field(..., min_length=1, max_length=120)
    calories: float = Field(..., ge=0, le=10000)
    protein: float = Field(default=0.0, ge=0, le=1000)
    carbs: float = Field(default=0.0, ge=0, le=1000)
    fats: float = Field(default=0.0, ge=0, le=1000)
    meal_date: Optional[date] = None

class MealCreate(MealBase):
    pass

class MealUpdate(BaseModel):
    meal_type: Optional[MealTypeLiteral] = None
    food_name: Optional[str] = Field(default=None, min_length=1, max_length=120)
    calories: Optional[float] = Field(default=None, ge=0, le=10000)
    protein: Optional[float] = Field(default=None, ge=0, le=1000)
    carbs: Optional[float] = Field(default=None, ge=0, le=1000)
    fats: Optional[float] = Field(default=None, ge=0, le=1000)
    meal_date: Optional[date] = None

class MealResponse(BaseModel):
    id: int
    user_id: int
    meal_type: str
    food_name: str
    calories: float
    protein: float
    carbs: float
    fats: float
    meal_date: date
    created_at: datetime

    class Config:
        from_attributes = True

class NutritionSummaryResponse(BaseModel):
    date: date
    total_calories: float
    calorie_goal: int
    calories_burned: float
    net_calories: float
    total_protein: float
    total_carbs: float
    total_fats: float
    meals_count: int
    by_meal_type: dict
    weekly_trend: List[dict]


# ----------------- Water Intake Schemas -----------------
class WaterLogCreate(BaseModel):
    quantity: int = Field(..., gt=0, le=10000)
    date: Optional[date] = None

class WaterGoalUpdate(BaseModel):
    daily_water_goal_ml: int = Field(..., ge=500, le=10000)

class WaterLogResponse(BaseModel):
    id: int
    user_id: int
    quantity: int
    date: date
    created_at: datetime

    class Config:
        from_attributes = True

class WaterSummaryResponse(BaseModel):
    date: date
    total_ml: int
    liters_consumed: float
    daily_goal_ml: int
    goal_liters: float
    progress_percentage: float
    logs: List[WaterLogResponse]
    weekly_trend: List[dict]


# ----------------- Workout Suggestions Schemas -----------------
class WorkoutSuggestion(BaseModel):
    title: str
    category: str
    suggested_duration_mins: int
    estimated_calories: float
    intensity: str
    reason: str
    exercises: List[str]

class SuggestionsResponse(BaseModel):
    focus_summary: str
    streak_status: str
    suggestions: List[WorkoutSuggestion]


# ----------------- Third-Party Integration Schemas -----------------
class IntegrationStatusResponse(BaseModel):
    provider: str
    label: str
    is_connected: bool
    daily_steps: int
    synced_calories: float
    last_synced_at: Optional[datetime] = None

class IntegrationSyncRequest(BaseModel):
    steps: Optional[int] = Field(default=None, ge=100, le=100000)
    active_minutes: Optional[int] = Field(default=None, ge=5, le=600)

class IntegrationSyncResponse(BaseModel):
    provider: str
    steps_synced: int
    active_minutes: int
    calories_synced: float
    workout_logged: bool
    message: str
    integration: IntegrationStatusResponse


# ----------------- Reminder Settings Schemas -----------------
class ReminderSettingUpdate(BaseModel):
    workout_reminder_enabled: Optional[bool] = None
    workout_reminder_time: Optional[str] = Field(default=None, pattern=r"^([01]\d|2[0-3]):[0-5]\d$")
    workout_reminder_note: Optional[str] = Field(default=None, min_length=2, max_length=255)
    meal_reminder_enabled: Optional[bool] = None
    meal_reminder_times: Optional[str] = Field(default=None, min_length=3, max_length=100)
    water_reminder_enabled: Optional[bool] = None
    water_reminder_interval_mins: Optional[int] = Field(default=None, ge=15, le=480)
    daily_water_goal_ml: Optional[int] = Field(default=None, ge=500, le=10000)
    daily_calorie_goal: Optional[int] = Field(default=None, ge=800, le=8000)

class ReminderSettingResponse(BaseModel):
    id: int
    user_id: int
    workout_reminder_enabled: bool
    workout_reminder_time: str
    workout_reminder_note: str
    meal_reminder_enabled: bool
    meal_reminder_times: str
    water_reminder_enabled: bool
    water_reminder_interval_mins: int
    daily_water_goal_ml: int
    daily_calorie_goal: int
    updated_at: datetime

    class Config:
        from_attributes = True

class ReminderCheckResponse(BaseModel):
    triggered_count: int
    triggered_types: List[str]
    message: str


# ----------------- Advanced Analytics Schemas -----------------
class AdvancedAnalyticsResponse(BaseModel):
    period: str
    consistency_score: float
    active_days: int
    total_period_days: int
    goal_completion_rate: float
    completed_goals: int
    total_goals: int
    avg_daily_burn: float
    avg_daily_intake: float
    avg_daily_water_liters: float
    best_weekday: Optional[str] = None
    daily_balance_series: List[dict]
    weekday_breakdown: List[dict]
    category_distribution: List[dict]
    insights: List[str]


