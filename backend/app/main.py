from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import (
    auth, workouts, progress, goals, analytics, notifications,
    plans, exercises, streaks, badges, meals, water, integrations, reminders
)

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FitTrack API",
    description="Fitness & Workout Tracking API",
    version="2.0.0"
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth.router)
app.include_router(workouts.router)
app.include_router(progress.router)
app.include_router(goals.router)
app.include_router(analytics.router)
app.include_router(notifications.router)
app.include_router(plans.router)
app.include_router(exercises.router)
app.include_router(streaks.router)
app.include_router(badges.router)
app.include_router(meals.router)
app.include_router(water.router)
app.include_router(integrations.router)
app.include_router(reminders.router)


@app.get("/")
def root():
    return {
        "app": "FitTrack API",
        "status": "online",
        "documentation": "/docs",
        "version": "2.0.0"
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}
