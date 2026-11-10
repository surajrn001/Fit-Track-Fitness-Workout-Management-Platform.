import os
import sys
from datetime import date, datetime, timezone, timedelta
import random

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.database import SessionLocal, Base, engine
from app.models import (
    User, Workout, Progress, Goal, Notification,
    WorkoutPlan, Exercise, Streak, Badge, UserBadge
)
from app.security import hash_password
from app.crud import sync_daily_progress, update_user_streak, check_and_award_badges

def seed_database():
    print("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Seed Predefined Exercises (Module 8)
        predefined_exercises = [
            ("Surya Namaskar Sprint (12 Cycles)", "Yoga", "Dynamic traditional sun salutation flow cultivating core stability, spinal mobility, and endurance.", 20, 180.0, "Beginner"),
            ("Marine Drive 5K Sunrise Jog", "Cardio", "Brisk seaside endurance running boosting aerobic capacity, heart rate, and metabolic rate.", 30, 320.0, "Intermediate"),
            ("Akhada Baithaks (Hindu Squats)", "Strength", "Deep ancient bodyweight and weight-loaded knee-over-toe squats forging indestructible quad and glute power.", 25, 240.0, "Intermediate"),
            ("Akhada Dands (Dive-Bomber Pushups)", "Strength", "Traditional akhada push-up sequence developing bulletproof chest, shoulders, triceps, and lower back strength.", 25, 260.0, "Advanced"),
            ("Shatapawali Post-Meal Brisk Walk", "Cardio", "1000-step ancient Ayurvedic digestive walk regulating blood glucose and burning passive calories.", 30, 140.0, "Beginner"),
            ("Gada & Mudgar 360 Revolutions", "Strength", "Heavy Indian club and mace swinging building grip, forearm tendon resilience, and rotational shoulder torque.", 30, 290.0, "Intermediate"),
            ("Pranayama & Kapalabhati Flow", "Yoga", "Breathwork series with Anulom-Vilom and Kapalabhati improving lung VO2 capacity and mental tranquility.", 25, 120.0, "Beginner"),
            ("Akhada Rassi Kood (Rope Skipping)", "Cardio", "High-cadence boxer rope skipping honing rapid calves, footwork agility, and anaerobic threshold.", 25, 280.0, "Intermediate"),
            ("Ashtanga Vinyasa & Sirsasana", "Yoga", "Rigorous eight-limb flow integrating inversion balance, hamstring flexibility, and posture correction.", 45, 230.0, "Advanced"),
            ("Barbell Deadlift & Power Cleans", "Strength", "Compound posterior chain lifting recruiting hamstrings, lats, and trapezius with progressive overload.", 45, 420.0, "Advanced"),
            ("Dumbbell Bench & Overhead Press", "Strength", "Bilateral upper body pushing targeting pectorals, anterior deltoids, and tricep extension.", 40, 350.0, "Intermediate"),
            ("CrossFit Tabata Burpee Burner", "Cardio", "20s on, 10s off explosive intervals shredding calories and challenging cardiovascular recovery.", 25, 310.0, "Advanced"),
            ("Chandra Namaskar (Moon Salutations)", "Yoga", "Gentle cooling evening sequence relaxing tight hip flexors and inducing deep restorative sleep.", 25, 130.0, "Beginner"),
            ("Khel Kabaddi Agility Footwork", "Cardio", "Fast lateral shuffles, reaction sprints, and quick direction shifts enhancing athleticism.", 35, 380.0, "Intermediate"),
        ]

        print("Seeding predefined Exercise Library...")
        for name, cat, descr, dur, cals, diff in predefined_exercises:
            existing_ex = db.query(Exercise).filter(Exercise.name == name).first()
            if not existing_ex:
                db.add(Exercise(
                    name=name,
                    category=cat,
                    description=descr,
                    duration=dur,
                    calories_est=cals,
                    difficulty=diff
                ))
        db.commit()

        # 2. Seed Predefined Badges (Module 11)
        predefined_badges = [
            ("Pehla Kadam (First Step)", "Completed your very first workout on FitTrack! The journey begins.", "footprints", "milestone", "workouts_count", 1),
            ("Warrior in the Making", "Logged 5 workout sessions with unwavering dedication.", "swords", "milestone", "workouts_count", 5),
            ("Akhada Champion", "Logged 20 intense workout sessions. Pure grit!", "trophy", "milestone", "workouts_count", 20),
            ("Centurion Athlete", "Conquered 50 workout sessions. True master of physical training.", "crown", "milestone", "workouts_count", 50),
            ("Agni Streak (3 Days)", "Maintained a 3-day consecutive daily workout streak. The fire is lit!", "flame", "streak", "streak_days", 3),
            ("Sadhana Streak (7 Days)", "7-day unbroken training streak! Discipline equals freedom.", "zap", "streak", "streak_days", 7),
            ("Tapasya Master (14 Days)", "14-day training streak. Iron determination and consistency.", "award", "streak", "streak_days", 14),
            ("Goal Getter", "Successfully completed and conquered your first fitness goal milestone!", "target", "goal", "goals_completed", 1),
            ("Fit India Icon", "Conquered 3 or more fitness goals on the platform.", "medal", "goal", "goals_completed", 3),
            ("10,000 Kcal Burner", "Burned over 10,000 total calories on FitTrack! Energy powerhouse.", "sparkles", "milestone", "calories_total", 10000.0),
        ]

        print("Seeding Achievement Badges...")
        for name, descr, icon, cat, c_type, c_val in predefined_badges:
            existing_badge = db.query(Badge).filter(Badge.name == name).first()
            if not existing_badge:
                db.add(Badge(
                    name=name,
                    description=descr,
                    icon=icon,
                    category=cat,
                    condition_type=c_type,
                    condition_value=c_val
                ))
            else:
                existing_badge.description = descr
                existing_badge.icon = icon
                existing_badge.category = cat
                existing_badge.condition_type = c_type
                existing_badge.condition_value = c_val
        db.commit()

        # 3. Users to Seed
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
            {
                "username": "alex_fitness",
                "email": "alex@fittrack.com",
                "password": "password123",
                "is_primary": False,
            }
        ]

        indian_workout_samples = [
            ("Morning Surya Namaskar (24 cycles) & Pranayama", "Yoga", 40, 220),
            ("Marine Drive Sunrise 5K Run", "Cardio", 28, 350),
            ("Desi Akhada Heavy Squats & Deadlifts", "Strength", 55, 480),
            ("Cubbon Park Weekend Cycling Loop", "Cardio", 45, 430),
            ("High-Intensity Badminton Match at Club", "Cardio", 50, 510),
            ("Post-Dinner Shatapawali Walk (1000 Steps)", "Cardio", 30, 150),
            ("Ashtanga Vinyasa Flow & Sirsasana", "Yoga", 45, 200),
            ("Box Cricket Power Batting & Running Drill", "Cardio", 60, 460),
            ("Upper Body Hypertrophy & Mudgar Swings", "Strength", 50, 420),
            ("Bandra Bandstand Evening Brisk Walk", "Cardio", 40, 210),
            ("CrossFit Tabata WOD: Burpees & Kettlebells", "Cardio", 25, 320),
            ("Khel Kabaddi Agility & Footwork Drill", "Cardio", 45, 470),
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
                db.query(WorkoutPlan).filter(WorkoutPlan.user_id == existing.id).delete()
                db.query(UserBadge).filter(UserBadge.user_id == existing.id).delete()
                db.query(Streak).filter(Streak.user_id == existing.id).delete()
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

            # Generate workouts history for primary user and demo
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

                # Notifications
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
                        message="Namaste Arjun! Don't let your active workout streak break. A quick 20-min session makes all the difference!",
                        is_read=False,
                        created_at=datetime.now(timezone.utc) - timedelta(hours=2)
                    ),
                ]
                db.add_all(notifications_data)

                # Seed Scheduled Workout Plans (Module 7)
                print(f"Creating scheduled workout plans for {user.username}...")
                plans_data = [
                    WorkoutPlan(
                        user_id=user.id,
                        title="Sunrise Surya Namaskar & Pranayama Focus",
                        description="24 rounds of Surya Namaskar followed by 15 mins of Kapalabhati and Anulom-Vilom.",
                        scheduled_date=today,
                        is_completed=False
                    ),
                    WorkoutPlan(
                        user_id=user.id,
                        title="Heavy Akhada Squats & Baithak Drill",
                        description="Targeting 5x5 squats, 100 Indian baithaks, and Romanian deadlifts.",
                        scheduled_date=today + timedelta(days=1),
                        is_completed=False
                    ),
                    WorkoutPlan(
                        user_id=user.id,
                        title="Cubbon Park 8K Endurance Pace Run",
                        description="Aerobic base building along green shaded paths with gradual negative splits.",
                        scheduled_date=today + timedelta(days=3),
                        is_completed=False
                    ),
                    WorkoutPlan(
                        user_id=user.id,
                        title="Upper Body Dands & Mudgar Rotations",
                        description="Pushups, Hindu dive-bombers, and 360-degree mace revolutions for shoulder health.",
                        scheduled_date=today + timedelta(days=5),
                        is_completed=False
                    ),
                    WorkoutPlan(
                        user_id=user.id,
                        title="Restorative Evening Chandra Namaskar",
                        description="Cool-down mobility, yin stretches, and guided Yoga Nidra for muscle repair.",
                        scheduled_date=today + timedelta(days=6),
                        is_completed=False
                    )
                ]
                db.add_all(plans_data)
                db.commit()

                # Calculate streak and award badges
                print(f"Calculating streak & badges for {user.username}...")
                update_user_streak(db, user.id)
                check_and_award_badges(db, user.id)

        print("\nFitTrack Phase 2 database seeded successfully!")
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
