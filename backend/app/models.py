from datetime import datetime, timezone, date
from sqlalchemy import Column, Integer, String, Float, Boolean, Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from .database import Base

def utc_now():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    workouts = relationship("Workout", back_populates="user", cascade="all, delete-orphan")
    progress_records = relationship("Progress", back_populates="user", cascade="all, delete-orphan")
    goals = relationship("Goal", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    workout_plans = relationship("WorkoutPlan", back_populates="user", cascade="all, delete-orphan")
    streak = relationship("Streak", back_populates="user", uselist=False, cascade="all, delete-orphan")
    badges = relationship("UserBadge", back_populates="user", cascade="all, delete-orphan")
    meals = relationship("Meal", back_populates="user", cascade="all, delete-orphan")
    water_logs = relationship("WaterTracking", back_populates="user", cascade="all, delete-orphan")
    integrations = relationship("ExternalIntegration", back_populates="user", cascade="all, delete-orphan")
    reminder_setting = relationship("ReminderSetting", back_populates="user", uselist=False, cascade="all, delete-orphan")

class Workout(Base):
    __tablename__ = "workouts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    workout_name = Column(String(150), nullable=False)
    category = Column(String(50), nullable=False)  # Cardio / Strength / Yoga / etc.
    duration = Column(Integer, nullable=False)      # Duration in minutes
    calories_burned = Column(Float, nullable=False)
    workout_date = Column(Date, default=date.today, nullable=False, index=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    user = relationship("User", back_populates="workouts")

class Progress(Base):
    __tablename__ = "progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    total_workouts = Column(Integer, default=0, nullable=False)
    total_calories = Column(Float, default=0.0, nullable=False)
    date = Column(Date, default=date.today, nullable=False, index=True)

    user = relationship("User", back_populates="progress_records")

class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    goal_type = Column(String(100), nullable=False)  # Weight Loss / Muscle Gain / Steps / Calories Burned / Workout Count
    target_value = Column(Float, nullable=False)
    current_value = Column(Float, default=0.0, nullable=False)
    deadline = Column(Date, nullable=False)
    is_completed = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    user = relationship("User", back_populates="goals")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    user = relationship("User", back_populates="notifications")

class WorkoutPlan(Base):
    __tablename__ = "workout_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    scheduled_date = Column(Date, nullable=False, index=True)
    is_completed = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    user = relationship("User", back_populates="workout_plans")

class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False, index=True)
    category = Column(String(50), nullable=False)
    description = Column(Text, nullable=True)
    duration = Column(Integer, nullable=False)
    calories_est = Column(Float, default=150.0, nullable=False)
    difficulty = Column(String(50), default="Intermediate", nullable=False)

class Streak(Base):
    __tablename__ = "streak"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    current_streak = Column(Integer, default=0, nullable=False)
    longest_streak = Column(Integer, default=0, nullable=False)
    last_workout_date = Column(Date, nullable=True)

    user = relationship("User", back_populates="streak")

class Badge(Base):
    __tablename__ = "badges"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), unique=True, nullable=False)
    description = Column(Text, nullable=False)
    icon = Column(String(100), nullable=False)
    category = Column(String(50), default="General", nullable=False)
    condition_type = Column(String(50), nullable=True)
    condition_value = Column(Float, default=0.0, nullable=False)

    user_badges = relationship("UserBadge", back_populates="badge", cascade="all, delete-orphan")

class UserBadge(Base):
    __tablename__ = "user_badges"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    badge_id = Column(Integer, ForeignKey("badges.id", ondelete="CASCADE"), nullable=False, index=True)
    earned_at = Column(DateTime, default=utc_now, nullable=False)

    user = relationship("User", back_populates="badges")
    badge = relationship("Badge", back_populates="user_badges")


class Meal(Base):
    __tablename__ = "meals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    meal_type = Column(String(30), nullable=False)  # Breakfast, Lunch, Dinner, Snacks
    food_name = Column(String(120), nullable=False)
    calories = Column(Float, nullable=False)
    protein = Column(Float, default=0.0, nullable=False)
    carbs = Column(Float, default=0.0, nullable=False)
    fats = Column(Float, default=0.0, nullable=False)
    meal_date = Column(Date, default=lambda: date.today(), nullable=False, index=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    user = relationship("User", back_populates="meals")


class WaterTracking(Base):
    __tablename__ = "water_tracking"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    quantity = Column(Integer, nullable=False)  # in ml
    date = Column(Date, default=lambda: date.today(), nullable=False, index=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    user = relationship("User", back_populates="water_logs")


class ExternalIntegration(Base):
    __tablename__ = "external_integrations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    provider = Column(String(40), nullable=False, index=True)  # google_fit, apple_health
    is_connected = Column(Boolean, default=False, nullable=False)
    daily_steps = Column(Integer, default=0, nullable=False)
    synced_calories = Column(Float, default=0.0, nullable=False)
    last_synced_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="integrations")


class ReminderSetting(Base):
    __tablename__ = "reminder_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    workout_reminder_enabled = Column(Boolean, default=True, nullable=False)
    workout_reminder_time = Column(String(10), default="07:00", nullable=False)
    workout_reminder_note = Column(String(255), default="Time for today's workout session", nullable=False)
    meal_reminder_enabled = Column(Boolean, default=True, nullable=False)
    meal_reminder_times = Column(String(100), default="08:30, 13:00, 20:00", nullable=False)
    water_reminder_enabled = Column(Boolean, default=True, nullable=False)
    water_reminder_interval_mins = Column(Integer, default=90, nullable=False)
    daily_water_goal_ml = Column(Integer, default=2500, nullable=False)
    daily_calorie_goal = Column(Integer, default=2200, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    user = relationship("User", back_populates="reminder_setting")


