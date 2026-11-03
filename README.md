# FitTrack – Fitness & Workout Management Platform

FitTrack is a full-stack fitness and workout tracking web platform designed to help users log workouts, monitor daily progress, set quantifiable fitness goals, and visualize analytics with dark-mode aesthetic styling.

---

## 🌟 Key Modules & Features

### 1. User Authentication (FastAPI + React)
- **FastAPI Backend**:
  - Secure registration & login endpoints (`/api/auth/register`, `/api/auth/login`)
  - Bcrypt password hashing
  - JWT Bearer Token authorization with protected routes
  - Profile retrieval (`/api/auth/me`)
- **React Frontend**:
  - Responsive Auth page with validation and toggle between Login and Register
  - **One-Click Demo Button**: Instantly log in as `alex@fittrack.com`
  - Token storage in `localStorage` with automatic session restoration and expiry handling

### 2. Workout Management System
- **Categories Supported**: Cardio, Strength, Yoga, HIIT, Pilates, Cycling, Walking
- **Features**:
  - Log workouts with Name, Category, Duration (minutes), Calories burned, and Date
  - **Auto-Calc Calorie Burn**: Estimates energy output based on workout category and intensity
  - Category filtering pills ("All", "Cardio", "Strength", "Yoga", "HIIT", etc.)
  - Search workouts by name and filter by date range
  - Sorting by Newest/Oldest, Highest Calories, and Longest Duration
  - Full Edit and Delete workflows with confirmation modals and strict user ownership checks

### 3. Daily Progress Tracking
- **Features**:
  - Automatic synchronization of daily aggregates in the dedicated `progress` table
  - Summary KPI cards: Today's Calories, Workouts Logged, Active Minutes, and Consecutive Day Streak
  - Consistency Index tracking active days over 30 days
  - Interactive Daily Activity History table with intensity badges (High Intensity, Moderate, Active Recovery, Rest Day)
  - One-click `Sync Records` trigger to recalculate historical statistics

### 4. Goal Setting System
- **Categories**: Weight Loss (kg), Muscle Gain (kg), Calories Burned (kcal), Steps (steps), Monthly Workouts (sessions)
- **Features**:
  - Visual progress bar with dynamic completion percentage
  - Deadline countdown and status indicators (On Track, Overdue, Achieved)
  - Quick "+ Update Value" modal for logging new metrics
  - Celebration confetti animation triggered when reaching 100% of a milestone
  - Active and Completed Goals tab views

### 5. Reports & Analytics
- **Features**:
  - **Weekly 7-Day Overview**: Daily calorie burn bar graph, total active minutes, and weekly total burn
  - **Monthly 30-Day Trend**: Visualizes training consistency and high-burn spikes
  - **Category Distribution**: Breakdown of calories and workout volume per discipline
  - Coaching insights and printable report action

### 6. Notifications & Alerts System
- **Triggers**:
  - Daily workout reminders encouraging streak preservation
  - 80% milestone achievement alerts
  - Goal completion and conquest celebrations
- **Navbar Integration**:
  - Notification bell with unread badge counter
  - Interactive dropdown drawer to review notifications, mark individual or all as read, and delete alerts

---

## 🏗️ Architecture & Database Schema

### Database Tables (SQLite + SQLAlchemy ORM)
- **`users`**: `id`, `username`, `email`, `hashed_password`, `created_at`
- **`workouts`**: `id`, `user_id` (FK), `workout_name`, `category`, `duration`, `calories_burned`, `workout_date`, `created_at`
- **`progress`**: `id`, `user_id` (FK), `total_workouts`, `total_calories`, `date`
- **`goals`**: `id`, `user_id` (FK), `goal_type`, `target_value`, `current_value`, `deadline`, `is_completed`, `created_at`
- **`notifications`**: `id`, `user_id` (FK), `title`, `message`, `is_read`, `created_at`

---

## 🚀 Running the Project Locally

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Backend Setup (FastAPI)
```bash
cd backend
# Create virtual environment (if not already created)
python -m venv venv

# Activate virtual environment:
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Windows (Command Prompt):
.\venv\Scripts\activate.bat
# macOS / Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Seed sample demo data (30 days of workouts, goals, and notifications)
python seed.py

# Run FastAPI server
uvicorn app.main:app --host 127.0.0.1 --port 8010 --reload
```
API Docs available at: [http://localhost:8010/docs](http://localhost:8010/docs)

### 2. Frontend Setup (React + Vite)
```bash
cd frontend
npm install
npm run dev -- --port 5180
```
Open in browser: [http://localhost:5180/](http://localhost:5180/)

---

## 🔑 Demo Account Credentials
- **Primary Indian Demo Account**:
  - **Name**: Arjun Sharma (Fitness Athlete)
  - **Email**: `arjun.sharma@fittrack.in`
  - **Password**: `password123`
  - **Username**: `arjun_fitness`
- **Secondary Demo Account**:
  - **Name**: Priya Patel
  - **Email**: `priya.patel@fittrack.in`
  - **Password**: `password123`
- **Legacy Demo Account**:
  - **Email**: `alex@fittrack.com`
  - **Password**: `password123`

*(You can also simply click the **"Login as Arjun Sharma (Athlete)"** or **"Login as Priya Patel"** buttons directly on the login screen for 1-click access!)*
