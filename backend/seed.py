import os
import sys
from datetime import date, datetime, timezone, timedelta
import random

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.database import SessionLocal, Base, engine
from app.models import User, Workout, Progress, Goal, Notification
from app.security import hash_password
from app.crud import sync_daily_progress

def seed_database():
    print("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        users_to_seed = [
            {
                "username": "arjun_fitness",
                "email": "arjun.sharma@fittrack.in",
                "password": "password123",
                "is_primary": True,
            },
            {
                "username": "priya_fit",
                "email": "priya.patel@fittrack.in",
                "password": "password123",
                "is_primary": False,
            },
            # Compatibility with previous demo account
            {
                "username": "alex_fitness",
                "email": "alex@fittrack.com",
                "password": "password123",
                "is_primary": False,
            }
        ]

        # Indian fitness workout samples
        indian_workout_samples = [
            ("Morning Surya Namaskar (24 cycles) & Pranayama", "Yoga", 40, 220),
            ("Marine Drive Sunrise 5K Run", "Cardio", 28, 350),
            ("Desi Akhada Heavy Squats & Deadlifts", "Strength", 55, 480),
            ("Cubbon Park Weekend Cycling Loop", "Cycling", 45, 430),
            ("High-Intensity Badminton Match at Club", "HIIT", 50, 510),
            ("Post-Dinner Shatapawali Walk (1000 Steps)", "Walking", 30, 150),
            ("Ashtanga Vinyasa Flow & Sirsasana", "Yoga", 45, 200),
            ("Box Cricket Power Batting & Running Drill", "Cardio", 60, 460),
            ("Upper Body Hypertrophy & Mudgar Swings", "Strength", 50, 420),
            ("Bandra Bandstand Evening Brisk Walk", "Walking", 40, 210),
            ("CrossFit Tabata WOD: Burpees & Kettlebells", "HIIT", 25, 320),
            ("Khel Kabaddi Agility & Footwork Drill", "HIIT", 45, 470),
            ("Evening Yoga Nidra & Deep Stretch", "Yoga", 35, 140),
            ("Lodhi Garden Morning Tempo Jog", "Cardio", 35, 390),
            ("Dand-Baithak & Desi Core Blast", "Strength", 40, 360),
        ]

        today = date.today()

        for u_data in users_to_seed:
            existing = db.query(User).filter(User.email == u_data["email"]).first()
            if existing:
                print(f"Cleaning previous data for {u_data['email']}...")
                db.query(Workout).filter(Workout.user_id == existing.id).delete()
                db.query(Progress).filter(Progress.user_id == existing.id).delete()
                db.query(Goal).filter(Goal.user_id == existing.id).delete()
                db.query(Notification).filter(Notification.user_id == existing.id).delete()
                db.delete(existing)
                db.commit()

            print(f"Creating user: {u_data['username']} ({u_data['email']})...")
            user = User(
                username=u_data["username"],
                email=u_data["email"],
                hashed_password=hash_password(u_data["password"]),
                created_at=datetime.now(timezone.utc) - timedelta(days=35)
            )
            db.add(user)
            db.commit()
            db.refresh(user)

            # Generate 30 days of workouts for primary user and demo
            if u_data["is_primary"] or u_data["email"] == "alex@fittrack.com":
                print(f"Generating 30 days of workout history for {user.username}...")
                for day_offset in range(29, -1, -1):
                    w_date = today - timedelta(days=day_offset)

                    # Realistically skip rest days
                    if day_offset in [26, 19, 12, 5]:
                        continue

                    # 1 or 2 workouts on active days
                    num_workouts = 2 if day_offset in [16, 9, 2, 0] else 1
                    for _ in range(num_workouts):
                        name, cat, base_dur, base_cal = random.choice(indian_workout_samples)
                        dur = base_dur + random.randint(-5, 10)
                        cal = base_cal + random.randint(-30, 50)

                        w_time = datetime.combine(w_date, datetime.min.time()) + timedelta(hours=random.randint(6, 20))
                        workout = Workout(
                            user_id=user.id,
                            workout_name=name,
                            category=cat,
                            duration=max(15, dur),
                            calories_burned=float(max(100, cal)),
                            workout_date=w_date,
                            created_at=w_time
                        )
                        db.add(workout)

                db.commit()

                # Sync daily progress table
                print(f"Syncing progress records for {user.username}...")
                workout_dates = db.query(Workout.workout_date).filter(
                    Workout.user_id == user.id
                ).distinct().all()

                for (d_val,) in workout_dates:
                    sync_daily_progress(db, user.id, d_val)

                # Goals with Indian context
                print(f"Creating goals for {user.username}...")
                goals_data = [
                    Goal(
                        user_id=user.id,
                        goal_type="Weight Loss: Wedding Season Ready",
                        target_value=5.0,
                        current_value=3.6,
                        deadline=today + timedelta(days=21),
                        is_completed=False,
                        created_at=datetime.now(timezone.utc) - timedelta(days=20)
                    ),
                    Goal(
                        user_id=user.id,
                        goal_type="Fit India 15,000 Calorie Burn",
                        target_value=15000.0,
                        current_value=12850.0,
                        deadline=today + timedelta(days=12),
                        is_completed=False,
                        created_at=datetime.now(timezone.utc) - timedelta(days=18)
                    ),
                    Goal(
                        user_id=user.id,
                        goal_type="10,000 Daily Steps - Fit India Movement",
                        target_value=100000.0,
                        current_value=84200.0,
                        deadline=today + timedelta(days=6),
                        is_completed=False,
                        created_at=datetime.now(timezone.utc) - timedelta(days=10)
                    ),
                    Goal(
                        user_id=user.id,
                        goal_type="Desi Akhada Strength: Muscle Gain",
                        target_value=2.5,
                        current_value=2.5,
                        deadline=today - timedelta(days=2),
                        is_completed=True,
                        created_at=datetime.now(timezone.utc) - timedelta(days=40)
                    )
                ]
                db.add_all(goals_data)

                # Notifications with warm Indian touches
                print(f"Creating notifications for {user.username}...")
                notifications_data = [
                    Notification(
                        user_id=user.id,
                        title="🏆 Badhai Ho! Goal Conquered!",
                        message="Congratulations Arjun! You completed your 'Desi Akhada Strength (2.5 kg muscle gain)' milestone ahead of schedule!",
                        is_read=True,
                        created_at=datetime.now(timezone.utc) - timedelta(days=2, hours=3)
                    ),
                    Notification(
                        user_id=user.id,
                        title="🔥 Shabaash! 85% Milestone Reached!",
                        message="Zabardast energy! You're at 85% of your 'Fit India 15,000 Calorie Burn' target. Bas thoda aur!",
                        is_read=False,
                        created_at=datetime.now(timezone.utc) - timedelta(hours=14)
                    ),
                    Notification(
                        user_id=user.id,
                        title="⏰ Fit India Daily Reminder",
                        message="Namaste Arjun! Don't let your 5-day active workout streak break. A quick 20-min session makes all the difference!",
                        is_read=False,
                        created_at=datetime.now(timezone.utc) - timedelta(hours=2)
                    ),
                ]
                db.add_all(notifications_data)
                db.commit()

        print("FitTrack India database seeded successfully!")
        print("Primary Indian Demo Account:")
        print("   Email: arjun.sharma@fittrack.in")
        print("   Password: password123")
        print("   Username: arjun_fitness")
        print("Secondary Demo Account:")
        print("   Email: priya.patel@fittrack.in")
        print("   Password: password123")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
