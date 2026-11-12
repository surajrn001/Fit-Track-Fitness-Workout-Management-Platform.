import React, { useState } from "react";
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
  Zap,
  RotateCw,
  Droplets,
  Utensils,
  Play
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const MOTIVATIONAL_SHLOKAS = [
  {
    sanskrit: "शरीरमाद्यं खलु धर्मसाधनम्",
    english: "The physical body is the foremost instrument for fulfilling every purpose in life.",
    author: "Kalidasa (Kumarasambhava)"
  },
  {
    sanskrit: "योगः कर्मसु कौशलम्",
    english: "Yoga is supreme skill, focus, and excellence in all action.",
    author: "Bhagavad Gita 2.50"
  },
  {
    sanskrit: "उद्यमेन हि सिध्यन्ति कार्याणि न मनोरथैः",
    english: "True accomplishments are achieved through rigorous effort, not mere daydreams.",
    author: "Hitopadesha"
  },
  {
    sanskrit: "बलवान् अपि नित्यं हि व्यायामी जयते परान्",
    english: "One who exercises daily overcomes all weaknesses and attains enduring strength.",
    author: "Charaka Samhita"
  },
  {
    sanskrit: "मन एव मनुष्याणां कारणं बन्धमोक्षयोः",
    english: "The disciplined mind alone is the master of resilience and transformation.",
    author: "Amritabindu Upanishad"
  }
];

export default function DashboardPage({
  summary,
  streak,
  todayWorkouts = [],
  activeGoals = [],
  upcomingPlans = [],
  recentBadges = [],
  weeklyAnalytics = null,
  personalizedData = null,
  suggestionsData = null,
  nutritionSummary = null,
  waterSummary = null,
  onOpenAddWorkout,
  onStartTimer,
  onQuickLogSuggestion,
  onOpenAddPlan,
  onNavigateTab,
  onDeleteWorkout,
  onEditWorkout,
  onCompletePlan,
  onOpenBadgePopup,
  onUpdateGoalProgress,
}) {
  const { user } = useAuth();
  const [quoteIndex, setQuoteIndex] = useState(0);

  const todayDateStr = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const dailyCalorieTarget = 500;
  const todayCalories = summary?.today_calories || 0;
  const todayPercent = Math.min(100, Math.round((todayCalories / dailyCalorieTarget) * 100));

  // Friendly human name formatting
  const displayName = user?.username
    ? user.username.split("_")[0].charAt(0).toUpperCase() + user.username.split("_")[0].slice(1)
    : "Athlete";

  // Use personalized greeting from backend or fallback
  const greeting = personalizedData?.greeting || `Namaste, ${displayName}! 🙏`;
  const currentShloka = MOTIVATIONAL_SHLOKAS[quoteIndex % MOTIVATIONAL_SHLOKAS.length];

  const handleNextQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_SHLOKAS.length);
  };

  const streakStats = streak || personalizedData?.streak || {
    current_streak: summary?.current_streak || 0,
    longest_streak: summary?.current_streak || 0,
    status: (summary?.current_streak || 0) > 0 ? "active" : "resting",
    streak_message: "Maintain consistency to build an unbroken training habit!",
    next_milestone: 7,
    days_to_milestone: Math.max(0, 7 - (summary?.current_streak || 0)),
  };

  // Generate last 7 days visual habit tracker
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayName = d.toLocaleDateString("en-US", { weekday: "narrow" });
    const isToday = i === 6;
    const hasWorkout = isToday 
      ? todayWorkouts.length > 0
      : (6 - i) < (streakStats.current_streak || 0);

    return {
      dayName,
      hasWorkout,
      isToday,
      dateNum: d.getDate(),
    };
  });

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

  // Category counts for today's workout activities
  const categoryCounts = todayWorkouts.reduce((acc, w) => {
    const cat = w.category || "General";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

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
        <div style={{ flex: "1 1 500px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#fb923c", fontSize: "0.825rem", fontWeight: 700, marginBottom: 4 }}>
            <Calendar size={14} /> {todayDateStr} • <span style={{ color: "var(--emerald-primary)" }}>Daily Fitness Tracker</span>
          </div>
          <h1 style={{ fontSize: "2.1rem", margin: "4px 0 6px 0", fontFamily: "var(--font-display)" }}>
            {greeting}
          </h1>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginTop: 8 }}>
            <p style={{ color: "var(--text-muted)", fontSize: "0.925rem", margin: 0, lineHeight: 1.6 }}>
              <strong style={{ color: "#fbbf24", fontStyle: "italic" }}>"{currentShloka.sanskrit}"</strong> — {currentShloka.english}
              <span style={{ display: "block", fontSize: "0.75rem", color: "var(--text-dim)", marginTop: 2 }}>
                — {currentShloka.author}
              </span>
            </p>
            <button
              onClick={handleNextQuote}
              title="Next motivational wisdom"
              className="btn-secondary"
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                fontSize: "0.75rem",
                display: "flex",
                alignItems: "center",
                gap: 4,
                cursor: "pointer",
                whiteSpace: "nowrap",
                marginTop: 2,
              }}
            >
              <RotateCw size={12} /> Next Quote
            </button>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <button onClick={onOpenAddWorkout} className="btn-primary" style={{ padding: "12px 20px", display: "flex", alignItems: "center", gap: 8 }}>
            <Plus size={18} strokeWidth={2.5} /> Log Workout
          </button>
          {onStartTimer && (
            <button onClick={() => onStartTimer()} className="btn-secondary" style={{ padding: "12px 18px", display: "flex", alignItems: "center", gap: 8 }}>
              <Clock size={18} color="#34d399" /> Live Timer
            </button>
          )}
          <button onClick={onOpenAddPlan} className="btn-secondary" style={{ padding: "12px 18px", display: "flex", alignItems: "center", gap: 8 }}>
            <CalendarDays size={18} /> Schedule Next
          </button>
        </div>
      </div>

      {/* Streak Tracking Banner */}
      <div
        className="glass-card"
        style={{
          padding: "22px 26px",
          background: "linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%)",
          border: "1px solid rgba(249, 115, 22, 0.35)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "rgba(249, 115, 22, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Flame size={34} className={streakStats.current_streak > 0 ? "flame-active" : ""} />
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

        {/* 7-Day Mini Habit Track Strip */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", gap: 6, background: "rgba(0, 0, 0, 0.25)", padding: "8px 12px", borderRadius: 12, border: "1px solid var(--border-subtle)" }}>
            {last7Days.map((d, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 3,
                  minWidth: 26,
                }}
                title={`${d.dayName} (${d.dateNum}): ${d.hasWorkout ? "Completed Workout" : "No Workout"}`}
              >
                <span style={{ fontSize: "0.65rem", fontWeight: 700, color: d.isToday ? "var(--emerald-primary)" : "var(--text-dim)" }}>
                  {d.dayName}
                </span>
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 6,
                    background: d.hasWorkout 
                      ? "linear-gradient(135deg, #f97316 0%, #ef4444 100%)" 
                      : "rgba(255, 255, 255, 0.05)",
                    border: d.isToday 
                      ? "1px solid var(--emerald-primary)" 
                      : "1px solid transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.7rem",
                    color: "#fff",
                    boxShadow: d.hasWorkout ? "0 0 8px rgba(249, 115, 22, 0.4)" : "none",
                  }}
                >
                  {d.hasWorkout ? "✓" : "·"}
                </div>
              </div>
            ))}
          </div>

          {streakStats.days_to_milestone > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255, 255, 255, 0.05)", padding: "8px 14px", borderRadius: 10 }}>
              <Award size={18} color="#fbbf24" />
              <span style={{ fontSize: "0.825rem", color: "var(--text-main)" }}>
                <strong>{streakStats.days_to_milestone} days</strong> to {streakStats.next_milestone}-Day Badge!
              </span>
            </div>
          )}
        </div>
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
            <span>{todayCalories >= dailyCalorieTarget ? "Target Hit! 🔥" : `${dailyCalorieTarget - Math.round(todayCalories)} kcal to go`}</span>
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

        {/* Discipline & Badges */}
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

        {/* Weekly Output */}
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

      {/* Upcoming Scheduled Workouts Widget */}
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
                    transition: "all var(--transition-fast)",
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
                      padding: "8px 12px",
                      fontSize: "0.8rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      cursor: "pointer",
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div>
              <h3 style={{ fontSize: "1.2rem", margin: 0 }}>Today's Activities</h3>
              <span style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>Your logged exercises for today</span>
            </div>
            <button onClick={() => onNavigateTab("workouts")} className="btn-ghost" style={{ cursor: "pointer", border: "none" }}>
              View All <ChevronRight size={14} />
            </button>
          </div>

          {/* Category breakdown pills if workouts exist */}
          {Object.keys(categoryCounts).length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
              {Object.entries(categoryCounts).map(([cat, count]) => (
                <span
                  key={cat}
                  className={`badge badge-${cat.toLowerCase()}`}
                  style={{ fontSize: "0.725rem", padding: "3px 8px" }}
                >
                  {cat}: {count}
                </span>
              ))}
            </div>
          )}

          {todayWorkouts.length === 0 ? (
            <div style={{ padding: "32px 20px", textAlign: "center", border: "1px dashed var(--border-subtle)", borderRadius: 12 }}>
              <Dumbbell size={36} style={{ color: "var(--text-dim)", margin: "0 auto 10px auto", opacity: 0.5 }} />
              <p style={{ fontSize: "0.95rem", fontWeight: 600, margin: "0 0 6px 0" }}>No workouts logged today yet</p>
              <p style={{ fontSize: "0.825rem", color: "var(--text-muted)", margin: "0 0 16px 0" }}>
                Log your morning session, gym workout, or evening walk to keep your streak ablaze!
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
                    transition: "all var(--transition-fast)",
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

        {/* Active Fitness Goals Snapshot with Instant Boosters */}
        <div className="glass-card" style={{ padding: "26px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: "1.2rem", margin: 0 }}>Active Fitness Goals</h3>
              <span style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>Track progress and boost milestones</span>
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
                Set a target to keep yourself motivated and accountable!
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

                    <div style={{ width: "100%", height: 6, background: "rgba(255, 255, 255, 0.08)", borderRadius: 3, overflow: "hidden", marginBottom: 8 }}>
                      <div
                        style={{
                          width: `${pct}%`,
                          height: "100%",
                          background: pct >= 100 ? "#10b981" : "linear-gradient(90deg, #10b981, #06b6d4)",
                          borderRadius: 3,
                          transition: "width 400ms ease",
                        }}
                      />
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", color: "var(--text-dim)" }}>
                      <span>{pct}% Completed</span>

                      {/* Interactive Quick Add Buttons */}
                      {onUpdateGoalProgress && (
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          <span style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}>Quick add:</span>
                          <button
                            onClick={() => onUpdateGoalProgress(g.id, g.current_value + 1)}
                            className="btn-secondary"
                            style={{ padding: "2px 6px", fontSize: "0.7rem", borderRadius: 4 }}
                            title="Add 1 unit to progress"
                          >
                            +1
                          </button>
                          <button
                            onClick={() => onUpdateGoalProgress(g.id, g.current_value + 5)}
                            className="btn-secondary"
                            style={{ padding: "2px 6px", fontSize: "0.7rem", borderRadius: 4 }}
                            title="Add 5 units to progress"
                          >
                            +5
                          </button>
                          <button
                            onClick={() => onUpdateGoalProgress(g.id, g.current_value + 10)}
                            className="btn-secondary"
                            style={{ padding: "2px 6px", fontSize: "0.7rem", borderRadius: 4 }}
                            title="Add 10 units to progress"
                          >
                            +10
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Badges Showcase Banner */}
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

      {/* Daily Fuel & Hydration Snapshot */}
      {(nutritionSummary || waterSummary) && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 }}>
          <div className="glass-card" style={{ padding: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Utensils size={18} color="#fbbf24" />
                <h3 style={{ fontSize: "1.05rem", margin: 0 }}>Today&apos;s Nutrition</h3>
              </div>
              <button onClick={() => onNavigateTab("nutrition")} className="btn-ghost" style={{ fontSize: "0.82rem", cursor: "pointer", border: "none" }}>
                Open Tracker <ChevronRight size={14} />
              </button>
            </div>
            <div style={{ fontSize: "1.55rem", fontWeight: 800, marginBottom: 4 }}>
              {Math.round(nutritionSummary?.total_calories || 0)}{" "}
              <span style={{ fontSize: "0.85rem", color: "var(--text-dim)", fontWeight: 500 }}>
                / {nutritionSummary?.calorie_goal || 2200} kcal
              </span>
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              Protein {Math.round(nutritionSummary?.total_protein || 0)}g · Carbs {Math.round(nutritionSummary?.total_carbs || 0)}g · Fats {Math.round(nutritionSummary?.total_fats || 0)}g
            </div>
          </div>

          <div className="glass-card" style={{ padding: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Droplets size={18} color="#22d3ee" />
                <h3 style={{ fontSize: "1.05rem", margin: 0 }}>Today&apos;s Hydration</h3>
              </div>
              <button onClick={() => onNavigateTab("nutrition")} className="btn-ghost" style={{ fontSize: "0.82rem", cursor: "pointer", border: "none" }}>
                Add Water <ChevronRight size={14} />
              </button>
            </div>
            <div style={{ fontSize: "1.55rem", fontWeight: 800, color: "#22d3ee", marginBottom: 8 }}>
              {(waterSummary?.liters_consumed ?? 0).toFixed(2)} L{" "}
              <span style={{ fontSize: "0.85rem", color: "var(--text-dim)", fontWeight: 500 }}>
                / {(waterSummary?.goal_liters ?? 2.5).toFixed(1)} L ({waterSummary?.progress_percentage ?? 0}%)
              </span>
            </div>
            <div style={{ height: 7, borderRadius: 99, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
              <div
                style={{
                  width: `${waterSummary?.progress_percentage ?? 0}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, #06b6d4, #3b82f6)",
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Recommended Workouts Section */}
      {suggestionsData?.suggestions?.length > 0 && (
        <div className="glass-card" style={{ padding: "24px 28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10, marginBottom: 18 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <Sparkles size={18} color="#34d399" />
                <h3 style={{ fontSize: "1.15rem", fontWeight: 700, margin: 0 }}>Recommended Workouts</h3>
              </div>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: 0 }}>
                {suggestionsData.focus_summary}
              </p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
            {suggestionsData.suggestions.map((rec, idx) => (
              <div
                key={idx}
                style={{
                  padding: 18,
                  borderRadius: "var(--radius-md)",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span className={`badge badge-${rec.category.toLowerCase()}`}>{rec.category}</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      {rec.suggested_duration_mins}m · ~{Math.round(rec.estimated_calories)} kcal
                    </span>
                  </div>
                  <h4 style={{ fontSize: "0.98rem", margin: "0 0 6px 0", color: "#fff" }}>{rec.title}</h4>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "0 0 10px 0", lineHeight: 1.45 }}>
                    {rec.reason}
                  </p>
                  <ul style={{ margin: 0, paddingLeft: 16, fontSize: "0.76rem", color: "var(--text-dim)", lineHeight: 1.5 }}>
                    {rec.exercises.map((ex, i) => (
                      <li key={i}>{ex}</li>
                    ))}
                  </ul>
                </div>

                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  {onStartTimer && (
                    <button
                      type="button"
                      onClick={() => onStartTimer(rec)}
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1 }}
                    >
                      <Play size={13} /> Start Timer
                    </button>
                  )}
                  {onQuickLogSuggestion && (
                    <button
                      type="button"
                      onClick={() => onQuickLogSuggestion(rec)}
                      className="btn btn-secondary btn-sm"
                    >
                      Quick Log
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
