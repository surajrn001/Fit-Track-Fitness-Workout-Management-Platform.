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
  Sparkles
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function DashboardPage({
  summary,
  todayWorkouts = [],
  activeGoals = [],
  weeklyAnalytics = null,
  onOpenAddWorkout,
  onNavigateTab,
  onDeleteWorkout,
  onEditWorkout,
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
  const displayName = user?.username ? user.username.split("_")[0].charAt(0).toUpperCase() + user.username.split("_")[0].slice(1) : "Athlete";

  // Authentic rotating Indian wellness tips
  const desiTips = [
    { title: "Desi Post-Workout Nutrition", text: "Fuel muscle synthesis with a glass of sattu cooler, roasted chana, or fresh paneer. Natural, nutrient-dense & clean protein!" },
    { title: "Shatapawali Routine", text: "Taking 1,000 gentle steps after dinner aids digestion, lowers glucose spikes, and sets up a restful night's sleep." },
    { title: "Natural Rehydration", text: "Recharge electrolytes after heavy akhada lifting or a 5K run with tender coconut water (Nariyal Pani) and pinch of sendha namak." },
  ];
  const tip = desiTips[new Date().getDate() % desiTips.length];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Welcome Banner */}
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
          <h1 style={{ fontSize: "2.1rem", margin: "4px 0 6px 0" }}>
            Namaste, <span className="text-gradient">{displayName}</span>! 🙏
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.925rem", margin: 0, maxWidth: 680, lineHeight: 1.5 }}>
            <em>"Shariram Madhyam Khalu Dharma Sadhanam"</em> — The body is the foremost instrument for all life's pursuits.
            {summary?.current_streak > 0
              ? ` You are on an impressive ${summary.current_streak}-day workout streak! Keep the flame burning.`
              : " Energize your day! Log your session now to start a winning streak."}
          </p>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onOpenAddWorkout} className="btn btn-primary" style={{ padding: "12px 22px" }}>
            <Plus size={18} strokeWidth={2.5} /> + Log Today's Workout
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 20,
        }}
      >
        {/* Today's Calories */}
        <div className="glass-card" style={{ padding: "22px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)" }}>Today's Energy Output</span>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: "rgba(249, 115, 22, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#f97316",
              }}
            >
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
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: "rgba(16, 185, 129, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--emerald-primary)",
              }}
            >
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

        {/* Workout Streak */}
        <div className="glass-card" style={{ padding: "22px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)" }}>Unbroken Streak</span>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: "rgba(239, 68, 68, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ef4444",
              }}
            >
              <Award size={20} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 10 }}>
            <span style={{ fontSize: "2rem", fontWeight: 800, fontFamily: "var(--font-display)", color: "#fb923c" }}>
              {summary?.current_streak || 0}
            </span>
            <span style={{ fontSize: "0.9rem", color: "var(--text-dim)" }}>days active</span>
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>
            {summary?.current_streak > 3 ? "🔥 Zabardast consistency! Keep it going." : "Work out daily to build your active habit."}
          </div>
        </div>

        {/* Weekly Calories */}
        <div className="glass-card" style={{ padding: "22px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)" }}>7-Day Total Burn</span>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: "rgba(99, 102, 241, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--indigo-accent)",
              }}
            >
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
            Monthly burn: {Math.round(summary?.monthly_calories || 0).toLocaleString()} kcal
          </div>
        </div>
      </div>

      {/* Desi Nutrition & Health Tip Callout */}
      <div
        style={{
          padding: "16px 20px",
          borderRadius: 14,
          background: "rgba(16, 185, 129, 0.08)",
          border: "1px solid rgba(16, 185, 129, 0.25)",
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(16, 185, 129, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--emerald-primary)", flexShrink: 0 }}>
          <Sparkles size={20} />
        </div>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--emerald-primary)", display: "block" }}>
            💡 {tip.title}
          </span>
          <span style={{ fontSize: "0.825rem", color: "var(--text-main)" }}>
            {tip.text}
          </span>
        </div>
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
            <button onClick={() => onNavigateTab("workouts")} className="btn-ghost btn-sm" style={{ cursor: "pointer", border: "none" }}>
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
              <button onClick={onOpenAddWorkout} className="btn btn-primary btn-sm">
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
                    <button onClick={() => onEditWorkout(w)} className="btn-secondary btn-sm">Edit</button>
                    <button onClick={() => onDeleteWorkout(w.id)} className="btn-danger btn-sm">Delete</button>
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
            <button onClick={() => onNavigateTab("goals")} className="btn-ghost btn-sm" style={{ cursor: "pointer", border: "none" }}>
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
              <button onClick={() => onNavigateTab("goals")} className="btn btn-primary btn-sm">
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

      {/* Weekly Calorie Burn Preview Bar Graph */}
      {weeklyAnalytics && weeklyAnalytics.days && (
        <div className="glass-card" style={{ padding: "26px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: "1.2rem", margin: 0 }}>Weekly Calorie Burn Distribution</h3>
              <span style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>Energy expenditure over the past 7 days</span>
            </div>
            <button onClick={() => onNavigateTab("analytics")} className="btn-ghost btn-sm" style={{ cursor: "pointer", border: "none" }}>
              Full Analytics <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", height: 160, gap: 12, padding: "10px 10px 0 10px" }}>
            {weeklyAnalytics.days.map((d, idx) => {
              const maxCal = Math.max(1, ...weeklyAnalytics.days.map((item) => item.calories));
              const heightPercent = Math.max(8, Math.round((d.calories / maxCal) * 100));
              const isToday = idx === weeklyAnalytics.days.length - 1;

              return (
                <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end", gap: 8 }}>
                  <span style={{ fontSize: "0.75rem", color: isToday ? "#fb923c" : "var(--text-dim)", fontWeight: 600 }}>
                    {Math.round(d.calories)}
                  </span>
                  <div
                    style={{
                      width: "100%",
                      maxWidth: 42,
                      height: `${heightPercent}%`,
                      borderRadius: "6px 6px 2px 2px",
                      background: isToday
                        ? "linear-gradient(180deg, #f97316 0%, #10b981 100%)"
                        : "linear-gradient(180deg, rgba(99, 102, 241, 0.7) 0%, rgba(99, 102, 241, 0.2) 100%)",
                      boxShadow: isToday ? "0 0 15px rgba(249, 115, 22, 0.4)" : "none",
                      transition: "height 300ms ease",
                    }}
                    title={`${d.day_name}: ${d.calories} kcal (${d.duration} mins)`}
                  />
                  <span style={{ fontSize: "0.8rem", fontWeight: isToday ? 700 : 500, color: isToday ? "#fff" : "var(--text-muted)" }}>
                    {d.day_name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
