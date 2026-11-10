11import os
import sys

# Ensure backend directory is in path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def run_tests():
    print("Testing FitTrack Modules...")

    # 1. Auth (Module 1)
    login_res = client.post("/api/auth/login", json={
        "email": "arjun.sharma@fittrack.in",
        "password": "password123"
    })
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    me_res = client.get("/api/auth/me", headers=headers)
    assert me_res.status_code == 200, f"Me profile failed: {me_res.text}"
    print("✓ Module 1 (Auth) passed.")

    # 2. Workouts (Module 2)
    categories_res = client.get("/api/workouts/categories")
    assert categories_res.status_code == 200 and len(categories_res.json()) > 0

    workouts_res = client.get("/api/workouts/", headers=headers)
    assert workouts_res.status_code == 200

    new_workout = client.post("/api/workouts/", headers=headers, json={
        "workout_name": "Test Pushups Session",
        "category": "Strength",
        "duration": 25,
        "calories_burned": 180.0,
        "workout_date": "2026-11-10"
    })
    assert new_workout.status_code == 201
    workout_id = new_workout.json()["id"]

    update_workout_res = client.put(f"/api/workouts/{workout_id}", headers=headers, json={
        "duration": 30,
        "calories_burned": 210.0
    })
    assert update_workout_res.status_code == 200
    print("✓ Module 2 (Workouts) passed.")

    # 3. Progress (Module 3)
    prog_res = client.get("/api/progress/daily?days=30", headers=headers)
    assert prog_res.status_code == 200

    summary_res = client.get("/api/progress/summary", headers=headers)
    assert summary_res.status_code == 200

    today_res = client.get("/api/progress/today", headers=headers)
    assert today_res.status_code == 200

    sync_res = client.post("/api/progress/sync-all", headers=headers)
    assert sync_res.status_code == 200
    print("✓ Module 3 (Progress) passed.")

    # 4. Goals (Module 4)
    goals_res = client.get("/api/goals/", headers=headers)
    assert goals_res.status_code == 200

    new_goal = client.post("/api/goals/", headers=headers, json={
        "goal_type": "Weekly Calorie Burn",
        "target_value": 3000.0,
        "current_value": 500.0,
        "deadline": "2026-12-01"
    })
    assert new_goal.status_code == 201
    goal_id = new_goal.json()["id"]

    patch_goal = client.patch(f"/api/goals/{goal_id}/progress", headers=headers, json={
        "current_value": 1500.0
    })
    assert patch_goal.status_code == 200 and patch_goal.json()["current_value"] == 1500.0

    client.delete(f"/api/goals/{goal_id}", headers=headers)
    print("✓ Module 4 (Goals) passed.")

    # 5. Analytics (Module 5)
    weekly_res = client.get("/api/analytics/weekly", headers=headers)
    assert weekly_res.status_code == 200

    monthly_res = client.get("/api/analytics/monthly", headers=headers)
    assert monthly_res.status_code == 200
    print("✓ Module 5 (Analytics) passed.")

    # 6. Notifications (Module 6)
    notif_res = client.get("/api/notifications/", headers=headers)
    assert notif_res.status_code == 200
    notifs = notif_res.json()
    if notifs:
        n_id = notifs[0]["id"]
        client.patch(f"/api/notifications/{n_id}/read", headers=headers)

    read_all = client.post("/api/notifications/read-all", headers=headers)
    assert read_all.status_code == 200
    print("✓ Module 6 (Notifications) passed.")

    # 7. Plans & Scheduling (Module 7)
    plans_res = client.get("/api/plans/", headers=headers)
    assert plans_res.status_code == 200

    new_plan = client.post("/api/plans/", headers=headers, json={
        "title": "Evening Mobility and Stretch",
        "description": "Joint mobility and restorative stretching",
        "scheduled_date": "2026-11-12"
    })
    assert new_plan.status_code == 201
    plan_id = new_plan.json()["id"]

    comp_plan = client.post(f"/api/plans/{plan_id}/complete", headers=headers)
    assert comp_plan.status_code == 200

    # Clean up converted workout
    comp_w_id = comp_plan.json()["id"]
    client.delete(f"/api/workouts/{comp_w_id}", headers=headers)
    client.delete(f"/api/plans/{plan_id}", headers=headers)
    print("✓ Module 7 (Workout Plans & Scheduling) passed.")

    # 8. Exercise Library (Module 8)
    exercises_res = client.get("/api/exercises/", headers=headers)
    assert exercises_res.status_code == 200
    exercises = exercises_res.json()
    assert len(exercises) >= 5, "Predefined exercises should be seeded"

    ex_id = exercises[0]["id"]
    log_ex_res = client.post(f"/api/exercises/{ex_id}/log", headers=headers, json={
        "duration": 20,
        "calories_burned": 150.0
    })
    assert log_ex_res.status_code == 201
    ex_w_id = log_ex_res.json()["id"]
    client.delete(f"/api/workouts/{ex_w_id}", headers=headers)

    sched_ex_res = client.post(f"/api/exercises/{ex_id}/schedule", headers=headers, json={
        "title": f"Scheduled {exercises[0]['name']}",
        "scheduled_date": "2026-11-15"
    })
    assert sched_ex_res.status_code == 201
    sched_plan_id = sched_ex_res.json()["id"]
    client.delete(f"/api/plans/{sched_plan_id}", headers=headers)
    print("✓ Module 8 (Exercise Library) passed.")

    # 9. Progress Comparison (Module 9)
    comp_weekly = client.get("/api/progress/comparison/weekly", headers=headers)
    assert comp_weekly.status_code == 200 and "metrics" in comp_weekly.json()

    comp_monthly = client.get("/api/progress/comparison/monthly", headers=headers)
    assert comp_monthly.status_code == 200 and "metrics" in comp_monthly.json()
    print("✓ Module 9 (Progress Comparison) passed.")

    # 10. Streak System (Module 10)
    streak_res = client.get("/api/streak/", headers=headers)
    assert streak_res.status_code == 200 and "current_streak" in streak_res.json()
    print("✓ Module 10 (Streak Tracking) passed.")

    # 11. Badges (Module 11)
    badges_res = client.get("/api/badges/", headers=headers)
    assert badges_res.status_code == 200 and len(badges_res.json()) > 0

    check_badges = client.post("/api/badges/check", headers=headers)
    assert check_badges.status_code == 200
    print("✓ Module 11 (Achievement Badges) passed.")

    # 12. Personalized Dashboard (Module 12)
    dash_res = client.get("/api/progress/personalized", headers=headers)
    assert dash_res.status_code == 200
    dash_data = dash_res.json()
    assert "greeting" in dash_data and "streak" in dash_data
    print("✓ Module 12 (Personalized Dashboard) passed.")

    # Clean up test workout
    client.delete(f"/api/workouts/{workout_id}", headers=headers)
    print("\nAll 12 modules tested and verified successfully!")

if __name__ == "__main__":
    run_tests()
