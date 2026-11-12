import os
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

    # Secondary user token for ownership verification
    priya_login = client.post("/api/auth/login", json={
        "email": "priya.patel@fittrack.in",
        "password": "password123"
    })
    assert priya_login.status_code == 200
    priya_headers = {"Authorization": f"Bearer {priya_login.json()['access_token']}"}

    # Unauthenticated check across Phase 3 routes
    for protected_url in [
        "/api/meals/",
        "/api/water/",
        "/api/workouts/suggestions",
        "/api/integrations/",
        "/api/analytics/advanced",
        "/api/reminders/settings",
    ]:
        unauth = client.get(protected_url)
        assert unauth.status_code in (401, 403), f"Expected auth block for {protected_url}, got {unauth.status_code}"

    # 13. Nutrition & Meal Tracking (Module 13)
    bad_meal = client.post("/api/meals/", headers=headers, json={
        "meal_type": "MidnightFeast",
        "food_name": "Invalid",
        "calories": 300
    })
    assert bad_meal.status_code == 422

    meal_res = client.post("/api/meals/", headers=headers, json={
        "meal_type": "Dinner",
        "food_name": "Test Tandoori Paneer",
        "calories": 480.0,
        "protein": 34.0,
        "carbs": 22.0,
        "fats": 18.0
    })
    assert meal_res.status_code == 201, meal_res.text
    meal_id = meal_res.json()["id"]

    meals_list = client.get("/api/meals/", headers=headers)
    assert meals_list.status_code == 200 and any(m["id"] == meal_id for m in meals_list.json())

    meal_edit = client.put(f"/api/meals/{meal_id}", headers=headers, json={"calories": 510.0})
    assert meal_edit.status_code == 200 and meal_edit.json()["calories"] == 510.0

    # Cross-user ownership check
    forbidden_meal = client.delete(f"/api/meals/{meal_id}", headers=priya_headers)
    assert forbidden_meal.status_code == 404

    nut_summary = client.get("/api/meals/summary", headers=headers)
    assert nut_summary.status_code == 200
    ns = nut_summary.json()
    assert "total_calories" in ns and "net_calories" in ns and "by_meal_type" in ns

    del_meal = client.delete(f"/api/meals/{meal_id}", headers=headers)
    assert del_meal.status_code == 200
    print("✓ Module 13 (Nutrition & Meal Tracking) passed.")

    # 14. Water Intake Tracker (Module 14)
    bad_water = client.post("/api/water/", headers=headers, json={"quantity": -100})
    assert bad_water.status_code == 422

    water_res = client.post("/api/water/", headers=headers, json={"quantity": 350})
    assert water_res.status_code == 201, water_res.text
    water_id = water_res.json()["id"]

    water_sum = client.get("/api/water/", headers=headers)
    assert water_sum.status_code == 200
    ws = water_sum.json()
    assert ws["total_ml"] >= 350 and "liters_consumed" in ws and "progress_percentage" in ws

    water_goal = client.put("/api/water/goal", headers=headers, json={"daily_water_goal_ml": 2800})
    assert water_goal.status_code == 200 and water_goal.json()["daily_water_goal_ml"] == 2800
    client.put("/api/water/goal", headers=headers, json={"daily_water_goal_ml": 2500})

    forbidden_water = client.delete(f"/api/water/{water_id}", headers=priya_headers)
    assert forbidden_water.status_code == 404

    del_water = client.delete(f"/api/water/{water_id}", headers=headers)
    assert del_water.status_code == 200
    print("✓ Module 14 (Water Intake Tracker) passed.")

    # 15. AI Workout Suggestions (Module 15)
    sug_res = client.get("/api/workouts/suggestions", headers=headers)
    assert sug_res.status_code == 200, sug_res.text
    sug_data = sug_res.json()
    assert "focus_summary" in sug_data and len(sug_data["suggestions"]) >= 1
    first_rec = sug_data["suggestions"][0]
    assert all(k in first_rec for k in ("title", "category", "suggested_duration_mins", "estimated_calories", "reason", "exercises"))
    print("✓ Module 15 (Workout Suggestions) passed.")

    # 16. Workout Timer Backend Flow (Module 16)
    timed_w = client.post("/api/workouts/", headers=headers, json={
        "workout_name": "Timed Cardio Interval",
        "category": "Cardio",
        "duration": 18,
        "calories_burned": 198.0
    })
    assert timed_w.status_code == 201
    client.delete(f"/api/workouts/{timed_w.json()['id']}", headers=headers)
    print("✓ Module 16 (Workout Timer Save Flow) passed.")

    # 17. Third-Party Integrations (Module 17)
    int_list = client.get("/api/integrations/", headers=headers)
    assert int_list.status_code == 200 and len(int_list.json()) >= 2

    conn_res = client.post("/api/integrations/apple_health/connect", headers=headers)
    assert conn_res.status_code == 200 and conn_res.json()["is_connected"] is True

    sync_int = client.post("/api/integrations/apple_health/sync", headers=headers, json={"steps": 6200})
    assert sync_int.status_code == 200 and sync_int.json()["steps_synced"] == 6200

    # Clean up the auto-created Apple Health workout
    latest_workouts = client.get("/api/workouts/", headers=headers).json()
    for w in latest_workouts:
        if "Apple Health Sync" in w["workout_name"]:
            client.delete(f"/api/workouts/{w['id']}", headers=headers)

    disc_res = client.post("/api/integrations/apple_health/disconnect", headers=headers)
    assert disc_res.status_code == 200 and disc_res.json()["is_connected"] is False

    blocked_sync = client.post("/api/integrations/apple_health/sync", headers=headers, json={"steps": 4000})
    assert blocked_sync.status_code == 400
    print("✓ Module 17 (Third-Party Integrations) passed.")

    # 18. Advanced Analytics (Module 18)
    adv_w = client.get("/api/analytics/advanced?period=weekly", headers=headers)
    adv_m = client.get("/api/analytics/advanced?period=monthly", headers=headers)
    assert adv_w.status_code == 200 and adv_m.status_code == 200
    for payload in (adv_w.json(), adv_m.json()):
        assert "consistency_score" in payload and "goal_completion_rate" in payload
        assert len(payload["weekday_breakdown"]) == 7 and len(payload["insights"]) >= 1
    print("✓ Module 18 (Advanced Analytics) passed.")

    # 19. In-App Reminders & Alerts (Module 19)
    rem_get = client.get("/api/reminders/settings", headers=headers)
    assert rem_get.status_code == 200

    bad_time = client.put("/api/reminders/settings", headers=headers, json={"workout_reminder_time": "99:99"})
    assert bad_time.status_code == 422

    rem_save = client.put("/api/reminders/settings", headers=headers, json={
        "water_reminder_enabled": True,
        "water_reminder_interval_mins": 60,
        "meal_reminder_enabled": True
    })
    assert rem_save.status_code == 200 and rem_save.json()["water_reminder_interval_mins"] == 60

    rem_check = client.post("/api/reminders/check", headers=headers)
    assert rem_check.status_code == 200 and "triggered_count" in rem_check.json()
    print("✓ Module 19 (In-App Reminders & Alerts) passed.")

    # Clean up test workout
    client.delete(f"/api/workouts/{workout_id}", headers=headers)
    print("\nAll 19 modules tested and verified successfully!")

if __name__ == "__main__":
    run_tests()
