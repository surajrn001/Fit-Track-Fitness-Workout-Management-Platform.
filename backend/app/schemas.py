from datetime import datetime, date
from typing import Optional, List
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
