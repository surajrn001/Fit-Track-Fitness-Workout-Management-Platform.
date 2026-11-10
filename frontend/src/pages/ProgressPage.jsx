import React, { useState } from "react";
import { 
  Calendar, 
  Flame, 
  Dumbbell, 
  RotateCw, 
  CheckCircle
} from "lucide-react";

export default function ProgressPage({
  dailyRecords = [],
  summary = null,
  onResyncProgress,
  onOpenAddWorkout,
}) {
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");

  const handleSync = async () => {
    try {
      setSyncing(true);
      setSyncMessage("");
      const res = await onResyncProgress();
      setSyncMessage(res?.detail || "Daily progress synchronized from database!");
      setTimeout(() => setSyncMessage(""), 4000);
    } catch (err) {
      setSyncMessage("Failed to sync records.");
    } finally {
      setSyncing(false);
    }
  };

  const getIntensityBadge = (calories) => {
    if (calories >= 600) return { label: "High Intensity 🔥", bg: "rgba(239, 68, 68, 0.15)", color: "#f87171" };
    if (calories >= 350) return { label: "Moderate Session ⚡", bg: "rgba(249, 115, 22, 0.15)", color: "#fb923c" };
    if (calories > 0) return { label: "Active Recovery 🌱", bg: "rgba(16, 185, 129, 0.15)", color: "#34d399" };
    return { label: "Rest Day 🛌", bg: "rgba(148, 163, 184, 0.12)", color: "#94a3b8" };
  };

  // Calculate consistency rating based on non-zero days in past 30 days
  const activeDaysCount = dailyRecords.filter((r) => r.total_workouts > 0).length;
  const consistencyScore = Math.min(100, Math.round((activeDaysCount / Math.max(1, dailyRecords.length)) * 100));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: "2rem", margin: "0 0 4px 0" }}>Daily Progress & Discipline</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: 0 }}>
            Track daily workout volume, calorie burn consistency, and your unbroken training habit.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="btn btn-secondary"
            title="Recalculate and synchronize all daily records"
          >
            <RotateCw size={16} className={syncing ? "pulse-animation" : ""} />
            {syncing ? "Syncing..." : "Sync Records"}
          </button>
          <button onClick={onOpenAddWorkout} className="btn btn-primary">
            + Log Session
          </button>
        </div>
      </div>

      {syncMessage && (
        <div
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            background: "rgba(16, 185, 129, 0.15)",
            color: "var(--emerald-primary)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <CheckCircle size={16} /> {syncMessage}
        </div>
      )}

      {/* Progress Metric Highlights */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 18 }}>
        <div className="glass-card" style={{ padding: "20px 22px" }}>
          <div style={{ fontSize: "0.825rem", color: "var(--text-muted)", marginBottom: 8, fontWeight: 600 }}>
            Consistency Rating (30d)
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: "2.2rem", fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--emerald-primary)" }}>
              {consistencyScore}%
            </span>
          </div>
          <span style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>
            {activeDaysCount} of {dailyRecords.length} recorded days active
          </span>
        </div>

        <div className="glass-card" style={{ padding: "20px 22px" }}>
          <div style={{ fontSize: "0.825rem", color: "var(--text-muted)", marginBottom: 8, fontWeight: 600 }}>
            Today's Logged Calories
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: "2.2rem", fontWeight: 800, fontFamily: "var(--font-display)", color: "#fb923c" }}>
              {Math.round(summary?.today_calories || 0).toLocaleString()}
            </span>
            <span style={{ fontSize: "0.9rem", color: "var(--text-dim)" }}>kcal</span>
          </div>
          <span style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>
            {summary?.today_workouts || 0} workouts completed today
          </span>
        </div>

        <div className="glass-card" style={{ padding: "20px 22px" }}>
          <div style={{ fontSize: "0.825rem", color: "var(--text-muted)", marginBottom: 8, fontWeight: 600 }}>
            Active Workout Streak
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: "2.2rem", fontWeight: 800, fontFamily: "var(--font-display)", color: "#38bdf8" }}>
              {summary?.current_streak || 0}
            </span>
            <span style={{ fontSize: "0.9rem", color: "var(--text-dim)" }}>days</span>
          </div>
          <span style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>
            Current unbroken training habit
          </span>
        </div>

        <div className="glass-card" style={{ padding: "20px 22px" }}>
          <div style={{ fontSize: "0.825rem", color: "var(--text-muted)", marginBottom: 8, fontWeight: 600 }}>
            30-Day Cumulative Output
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: "2.2rem", fontWeight: 800, fontFamily: "var(--font-display)" }}>
              {Math.round(summary?.monthly_calories || 0).toLocaleString()}
            </span>
            <span style={{ fontSize: "0.9rem", color: "var(--text-dim)" }}>kcal</span>
          </div>
          <span style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>
            Total energy burned this month
          </span>
        </div>
      </div>

      {/* Daily Records Timeline / Table */}
      <div className="glass-card" style={{ padding: "26px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: "1.2rem", margin: 0 }}>Daily Activity Log</h3>
            <span style={{ fontSize: "0.825rem", color: "var(--text-dim)" }}>Synchronized automatically with your database records</span>
          </div>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Past {dailyRecords.length} Days</span>
        </div>

        {dailyRecords.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center" }}>
            <Calendar size={40} style={{ color: "var(--text-dim)", margin: "0 auto 12px auto", opacity: 0.4 }} />
            <p style={{ fontSize: "0.95rem", margin: 0 }}>No daily progress records recorded yet.</p>
            <p style={{ fontSize: "0.825rem", color: "var(--text-muted)", marginTop: 4 }}>Log your first workout to begin generating daily records!</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-subtle)", color: "var(--text-dim)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <th style={{ padding: "12px 16px" }}>Date</th>
                  <th style={{ padding: "12px 16px" }}>Workouts</th>
                  <th style={{ padding: "12px 16px" }}>Calories Burned</th>
                  <th style={{ padding: "12px 16px" }}>Session Intensity</th>
                  <th style={{ padding: "12px 16px", textAlign: "right" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {dailyRecords.map((rec) => {
                  const dObj = new Date(rec.date);
                  const isToday = rec.date === new Date().toISOString().split("T")[0];
                  const intensity = getIntensityBadge(rec.total_calories);

                  return (
                    <tr
                      key={rec.id}
                      style={{
                        borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
                        background: isToday ? "rgba(16, 185, 129, 0.04)" : "transparent",
                        transition: "background 150ms ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = isToday ? "rgba(16, 185, 129, 0.04)" : "transparent")}
                    >
                      <td style={{ padding: "14px 16px", fontWeight: isToday ? 700 : 500 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <Calendar size={14} color={isToday ? "var(--emerald-primary)" : "var(--text-dim)"} />
                          <span>
                            {dObj.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                          </span>
                          {isToday && (
                            <span style={{ fontSize: "0.65rem", padding: "1px 6px", borderRadius: 4, background: "var(--emerald-primary)", color: "#042f2e", fontWeight: 700 }}>
                              TODAY
                            </span>
                          )}
                        </div>
                      </td>

                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <Dumbbell size={14} color="var(--text-dim)" />
                          <span style={{ fontWeight: 600 }}>{rec.total_workouts}</span>
                          <span style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>
                            {rec.total_workouts === 1 ? "session" : "sessions"}
                          </span>
                        </div>
                      </td>

                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <Flame size={14} color="#f97316" />
                          <span style={{ fontWeight: 700, color: rec.total_calories > 0 ? "#fb923c" : "var(--text-dim)" }}>
                            {Math.round(rec.total_calories).toLocaleString()} kcal
                          </span>
                        </div>
                      </td>

                      <td style={{ padding: "14px 16px" }}>
                        <span
                          style={{
                            padding: "4px 10px",
                            borderRadius: "var(--radius-full)",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            background: intensity.bg,
                            color: intensity.color,
                          }}
                        >
                          {intensity.label}
                        </span>
                      </td>

                      <td style={{ padding: "14px 16px", textAlign: "right" }}>
                        {rec.total_workouts > 0 ? (
                          <span style={{ color: "var(--emerald-primary)", fontSize: "0.8rem", fontWeight: 600 }}>
                            ✓ Active
                          </span>
                        ) : (
                          <span style={{ color: "var(--text-dim)", fontSize: "0.8rem" }}>
                            — Rest
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
