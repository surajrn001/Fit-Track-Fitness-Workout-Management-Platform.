import React from "react";
import { 
  Flame, 
  Dumbbell, 
  Clock, 
  Target, 
  Plus, 
  TrendingUp, 
  Calendar, 
  ChevronRight, 
  Award,
  Sparkles,
  CheckCircle2,
  CalendarDays,
  Zap
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function DashboardPage({
  summary,
  streak,
  todayWorkouts = [],
  activeGoals = [],
  upcomingPlans = [],
  recentBadges = [],
  weeklyAnalytics = null,
  personalizedData = null,
  onOpenAddWorkout,
  onOpenAddPlan,
  onNavigateTab,
  onDeleteWorkout,
  onEditWorkout,
  onCompletePlan,
  onOpenBadgePopup,
}) {
  const { user } = useAuth();
  const todayDateStr = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const dailyCalorieTarget = 500;
  const todayCalories = summary?.today_calories || 0;
  const todayPercent = Math.min(100, Math.round((todayCalories / dailyCalorieTarget) * 100));

  // Friendly human Indian name formatting
  const displayName = user?.username
    ? user.username.split("_")[0].charAt(0).toUpperCase() + user.username.split("_")[0].slice(1)
    : "Athlete";

  // Use personalized greeting from backend or fallback
  const greeting = personalizedData?.greeting || `Namaste, ${displayName}! 🙏`;
  const shloka = personalizedData?.desi_shloka || {
    sanskrit: "शरीरमाद्यं खलु धर्मसाधनम्",
    english: "The physical body is the foremost instrument for fulfilling every purpose in life."
  };

  const streakStats = streak || personalizedData?.streak || {
    current_streak: summary?.current_streak || 0,
    longest_streak: summary?.current_streak || 0,
    status: summary?.current_streak > 0 ? "active" : "resting",
    streak_message: "Maintain consistency to build an unbroken training habit!",
    next_milestone: 7,
    days_to_milestone: Math.max(0, 7 - (summary?.current_streak || 0)),
  };

  const getBadgeIcon = (iconName) => {
    switch (iconName) {
      case "footprints": return "👣";
      case "swords": return "⚔️";
      case "trophy": return "🏆";
      case "crown": return "👑";
      case "flame": return "🔥";
      case "zap": return "⚡";
      case "award": return "🎖️";
      case "target": return "🎯";
      case "medal": return "🥇";
      case "sparkles": return "✨";
      default: return "🌟";
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Module 12: Personalized Welcome Banner */}
      <div
        className="glass-card"
        style={{
          padding: "28px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 20,
          background: "linear-gradient(135deg, rgba(249, 115, 22, 0.12) 0%, rgba(16, 185, 129, 0.12) 50%, rgba(15, 23, 42, 0.95) 100%)",
          border: "1px solid rgba(249, 115, 22, 0.25)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#fb923c", fontSize: "0.825rem", fontWeight: 700, marginBottom: 4 }}>
            <Calendar size={14} /> {todayDateStr} • <span style={{ color: "var(--emerald-primary)" }}>Fit India Movement 🇮🇳</span>
          </div>
          <h1 style={{ fontSize: "2.1rem", margin: "4px 0 6px 0", fontFamily: "var(--font-display)" }}>
            {greeting}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.925rem", margin: 0, maxWidth: 720, lineHeight: 1.6 }}>
            <strong style={{ color: "#fbbf24", fontStyle: "italic" }}>"{shloka.sanskrit}"</strong> — {shloka.english}
          </p>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <button onClick={onOpenAddWorkout} className="btn-primary" style={{ padding: "12px 20px", display: "flex", alignItems: "center", gap: 8 }}>
            <Plus size={18} strokeWidth={2.5} /> Log Workout
          </button>
          <button onClick={onOpenAddPlan} className="btn-secondary" style={{ padding: "12px 18px", display: "flex", alignItems: "center", gap: 8 }}>
            <CalendarDays size={18} /> Schedule Next
          </button>
        </div>
      </div>

      {/* Module 10: Streak Tracking Banner */}
      <div
        className="glass-card"
        style={{
          padding: "20px 26px",
          background: "linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%)",
          border: "1px solid rgba(249, 115, 22, 0.35)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: 16,
              background: "rgba(249, 115, 22, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Flame size={32} className={streakStats.current_streak > 0 ? "flame-active" : ""} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: "1.35rem", fontWeight: 800 }}>
                {streakStats.current_streak} Day Active Streak 🔥
              </span>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: 6,
                  background: streakStats.status === "active" ? "rgba(16, 185, 129, 0.2)" : "rgba(245, 158, 11, 0.2)",
                  color: streakStats.status === "active" ? "#34d399" : "#fbbf24",
                }}
              >
                {streakStats.status === "active" ? "Ablaze Today" : "Pending Workout Today"}
              </span>
            </div>
            <p style={{ margin: "2px 0 0", fontSize: "0.85rem", color: "var(--text-muted)" }}>
              {streakStats.streak_message} • Longest Streak: <strong>{streakStats.longest_streak} days</strong>
            </p>
          </div>
        </div>

        {streakStats.days_to_milestone > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255, 255, 255, 0.05)", padding: "8px 14px", borderRadius: 10 }}>
            <Award size={18} color="#fbbf24" />
            <span style={{ fontSize: "0.825rem", color: "var(--text-main)" }}>
              <strong>{streakStats.days_to_milestone} days</strong> to {streakStats.next_milestone}-Day Milestone Badge!
            </span>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
        {/* Today's Calories */}
        <div className="glass-card" style={{ padding: "22px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)" }}>Today's Energy Output</span>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(249, 115, 22, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#f97316" }}>
              <Flame size={20} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 10 }}>
            <span style={{ fontSize: "2rem", fontWeight: 800, fontFamily: "var(--font-display)" }}>
              {Math.round(todayCalories).toLocaleString()}
            </span>
            <span style={{ fontSize: "0.9rem", color: "var(--text-dim)" }}>/ {dailyCalorieTarget} kcal</span>
          </div>
          <div style={{ width: "100%", height: 8, background: "rgba(255, 255, 255, 0.08)", borderRadius: 4, overflow: "hidden" }}>
            <div
              style={{
                width: `${todayPercent}%`,
                height: "100%",
                background: "linear-gradient(90deg, #f97316, #ef4444)",
                borderRadius: 4,
                transition: "width 500ms ease",
              }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: "0.75rem", color: "var(--text-dim)" }}>
            <span>{todayPercent}% Daily Target</span>
            <span>{todayCalories >= dailyCalorieTarget ? "Target Hit! Shabaash! 🔥" : `${dailyCalorieTarget - Math.round(todayCalories)} kcal to go`}</span>
          </div>
        </div>

        {/* Today's Workouts */}
        <div className="glass-card" style={{ padding: "22px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)" }}>Today's Sessions</span>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(16, 185, 129, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--emerald-primary)" }}>
              <Dumbbell size={20} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 10 }}>
            <span style={{ fontSize: "2rem", fontWeight: 800, fontFamily: "var(--font-display)" }}>
              {summary?.today_workouts || 0}
            </span>
            <span style={{ fontSize: "0.9rem", color: "var(--text-dim)" }}>
              {summary?.today_workouts === 1 ? "workout" : "workouts"}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8rem", color: "var(--emerald-primary)" }}>
            <Clock size={14} />
            <span>{summary?.today_duration || 0} active minutes logged</span>
          </div>
        </div>

        {/* Longest & Habit Index */}
        <div className="glass-card" style={{ padding: "22px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)" }}>Discipline & Badges</span>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(245, 158, 11, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fbbf24" }}>
              <Award size={20} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 10 }}>
            <span style={{ fontSize: "2rem", fontWeight: 800, fontFamily: "var(--font-display)", color: "#fbbf24" }}>
              {personalizedData?.total_badges_unlocked || recentBadges.length}
            </span>
            <span style={{ fontSize: "0.9rem", color: "var(--text-dim)" }}>honors unlocked</span>
          </div>
          <button onClick={() => onNavigateTab("badges")} className="btn-ghost" style={{ padding: 0, fontSize: "0.8rem", color: "#fbbf24", cursor: "pointer", border: "none" }}>
            View Badge Collection →
          </button>
        </div>

        {/* Weekly Calories Burn with Trend */}
        <div className="glass-card" style={{ padding: "22px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)" }}>Weekly Output</span>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(99, 102, 241, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--indigo-accent)" }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 10 }}>
            <span style={{ fontSize: "2rem", fontWeight: 800, fontFamily: "var(--font-display)" }}>
              {Math.round(summary?.weekly_calories || 0).toLocaleString()}
            </span>
            <span style={{ fontSize: "0.9rem", color: "var(--text-dim)" }}>kcal</span>
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--cyan-accent)" }}>
            {personalizedData?.weekly_improvement || "Active momentum building up!"}
          </div>
        </div>
      </div>

      {/* Module 7: Upcoming Scheduled Workouts Widget */}
      <div className="glass-card" style={{ padding: "26px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(59, 130, 246, 0.15)", color: "#60a5fa", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CalendarDays size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0 }}>Upcoming Scheduled Workouts</h3>
              <span style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>Next 7 days from your training calendar</span>
            </div>
          </div>
          <button onClick={() => onNavigateTab("schedule")} className="btn-ghost" style={{ fontSize: "0.85rem", cursor: "pointer", border: "none" }}>
            Open Calendar <ChevronRight size={14} />
          </button>
        </div>

        {upcomingPlans.length === 0 ? (
          <div style={{ padding: "24px", textAlign: "center", border: "1px dashed var(--border-subtle)", borderRadius: 12 }}>
            <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", margin: "0 0 12px 0" }}>
              No workouts scheduled for the upcoming week. Plan ahead for disciplined execution!
            </p>
            <button onClick={onOpenAddPlan} className="btn-primary" style={{ padding: "8px 16px", fontSize: "0.85rem" }}>
              + Schedule Future Workout
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
            {upcomingPlans.slice(0, 3).map((plan) => {
              const formattedDate = new Date(plan.scheduled_date).toLocaleDateString("en-IN", {
                weekday: "short",
                day: "numeric",
                month: "short"
              });
              return (
                <div
                  key={plan.id}
                  style={{
                    padding: "16px",
                    borderRadius: 12,
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--emerald-primary)", textTransform: "uppercase" }}>
                        {formattedDate}
                      </span>
                    </div>
                    <h4 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 4px 0", color: "var(--text-main)" }}>
                      {plan.title}
                    </h4>
                    {plan.description && (
                      <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.4 }}>
                        {plan.description}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => onCompletePlan(plan.id)}
                    className="btn-secondary"
                    style={{
                      width: "100%",
                      padding: "6px 12px",
                      fontSize: "0.8rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    <CheckCircle2 size={14} color="var(--emerald-primary)" />
                    Complete & Log Now
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Grid: Today's Workouts + Goals Snapshot */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 24 }}>
        {/* Today's Workout Activities */}
        <div className="glass-card" style={{ padding: "26px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: "1.2rem", margin: 0 }}>Today's Activities</h3>
              <span style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>Your logged exercises for today</span>
            </div>
            <button onClick={() => onNavigateTab("workouts")} className="btn-ghost" style={{ cursor: "pointer", border: "none" }}>
              View All <ChevronRight size={14} />
            </button>
          </div>

          {todayWorkouts.length === 0 ? (
            <div style={{ padding: "32px 20px", textAlign: "center", border: "1px dashed var(--border-subtle)", borderRadius: 12 }}>
              <Dumbbell size={36} style={{ color: "var(--text-dim)", margin: "0 auto 10px auto", opacity: 0.5 }} />
              <p style={{ fontSize: "0.95rem", fontWeight: 600, margin: "0 0 6px 0" }}>No workouts logged today yet</p>
              <p style={{ fontSize: "0.825rem", color: "var(--text-muted)", margin: "0 0 16px 0" }}>
                Add your morning Surya Namaskar, Akhada lift, or evening walk to boost today's stats!
              </p>
              <button onClick={onOpenAddWorkout} className="btn-primary" style={{ padding: "8px 16px" }}>
                <Plus size={14} /> Log Workout Now
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {todayWorkouts.map((w) => (
                <div
                  key={w.id}
                  style={{
                    padding: "14px 16px",
                    borderRadius: 12,
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div className={`badge badge-${w.category.toLowerCase()}`} style={{ padding: "6px 10px" }}>
                      {w.category}
                    </div>
                    <div>
                      <h4 style={{ fontSize: "0.95rem", margin: 0 }}>{w.workout_name}</h4>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: "0.775rem", color: "var(--text-dim)", marginTop: 2 }}>
                        <span><Clock size={12} style={{ verticalAlign: "middle" }} /> {w.duration} mins</span>
                        <span><Flame size={12} style={{ verticalAlign: "middle", color: "#f97316" }} /> {w.calories_burned} kcal</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => onEditWorkout(w)} className="btn-secondary" style={{ padding: "4px 8px", fontSize: "0.75rem" }}>Edit</button>
                    <button onClick={() => onDeleteWorkout(w.id)} className="btn-secondary" style={{ padding: "4px 8px", fontSize: "0.75rem", color: "#fca5a5" }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Fitness Goals Snapshot */}
        <div className="glass-card" style={{ padding: "26px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: "1.2rem", margin: 0 }}>Active Fitness Goals</h3>
              <span style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>Your current targets</span>
            </div>
            <button onClick={() => onNavigateTab("goals")} className="btn-ghost" style={{ cursor: "pointer", border: "none" }}>
              Manage Goals <ChevronRight size={14} />
            </button>
          </div>

          {activeGoals.length === 0 ? (
            <div style={{ padding: "32px 20px", textAlign: "center", border: "1px dashed var(--border-subtle)", borderRadius: 12 }}>
              <Target size={36} style={{ color: "var(--text-dim)", margin: "0 auto 10px auto", opacity: 0.5 }} />
              <p style={{ fontSize: "0.95rem", fontWeight: 600, margin: "0 0 6px 0" }}>No active goals right now</p>
              <p style={{ fontSize: "0.825rem", color: "var(--text-muted)", margin: "0 0 16px 0" }}>
                Set a wedding season goal, calorie burn milestone, or 10k daily steps!
              </p>
              <button onClick={() => onNavigateTab("goals")} className="btn-primary" style={{ padding: "8px 16px" }}>
                Set a Goal
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {activeGoals.slice(0, 3).map((g) => {
                const pct = g.progress_percentage || Math.min(100, Math.round((g.current_value / g.target_value) * 100));
                return (
                  <div
                    key={g.id}
                    style={{
                      padding: "14px 16px",
                      borderRadius: 12,
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                      <span style={{ fontSize: "0.9rem", fontWeight: 700 }}>{g.goal_type}</span>
                      <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--emerald-primary)" }}>
                        {g.current_value} / {g.target_value}
                      </span>
                    </div>

                    <div style={{ width: "100%", height: 6, background: "rgba(255, 255, 255, 0.08)", borderRadius: 3, overflow: "hidden", marginBottom: 6 }}>
                      <div
                        style={{
                          width: `${pct}%`,
                          height: "100%",
                          background: pct >= 100 ? "#10b981" : "linear-gradient(90deg, #10b981, #06b6d4)",
                          borderRadius: 3,
                        }}
                      />
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-dim)" }}>
                      <span>{pct}% Completed</span>
                      <span>Target: {new Date(g.deadline).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Module 11: Recent Badges Showcase Banner */}
      {recentBadges.length > 0 && (
        <div className="glass-card" style={{ padding: "24px 28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Award size={20} color="#fbbf24" />
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700, margin: 0 }}>Recent Honors & Badges Unlocked</h3>
            </div>
            <button onClick={() => onNavigateTab("badges")} className="btn-ghost" style={{ fontSize: "0.85rem", cursor: "pointer", border: "none" }}>
              View All ({personalizedData?.total_badges_unlocked || recentBadges.length}) <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
            {recentBadges.map((b) => (
              <div
                key={b.id}
                onClick={() => onOpenBadgePopup && onOpenBadgePopup(b)}
                style={{
                  padding: "14px 16px",
                  borderRadius: 12,
                  background: "linear-gradient(180deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)",
                  border: "1px solid rgba(245, 158, 11, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  cursor: "pointer",
                  transition: "all var(--transition-fast)",
                }}
              >
                <div style={{ fontSize: "1.8rem" }}>{getBadgeIcon(b.icon)}</div>
                <div>
                  <h4 style={{ fontSize: "0.9rem", fontWeight: 700, margin: 0, color: "var(--text-main)" }}>{b.name}</h4>
                  <span style={{ fontSize: "0.75rem", color: "#fbbf24" }}>Unlocked 🏆</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
