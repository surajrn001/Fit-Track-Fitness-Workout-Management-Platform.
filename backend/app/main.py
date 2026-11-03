from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import auth, workouts, progress, goals, analytics, notifications

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FitTrack API – Fitness & Workout Management Platform",
    description="Full-stack Fitness Tracking Platform API supporting authentication, workouts, daily progress, goals, analytics, and notification alerts.",
    version="1.0.0"
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

@app.get("/")
def root():
    return {
        "app": "FitTrack API",
        "status": "online",
        "documentation": "/docs",
        "version": "1.0.0"
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}
