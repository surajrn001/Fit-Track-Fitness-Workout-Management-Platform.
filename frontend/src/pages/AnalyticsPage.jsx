import React, { useState } from "react";
import { Award, PieChart, Printer } from "lucide-react";

export default function AnalyticsPage({
  weeklyData = null,
  monthlyData = null,
  advancedWeekly = null,
  advancedMonthly = null,
}) {
  const [viewMode, setViewMode] = useState("weekly"); // 'weekly' or 'monthly'

  const activeData = viewMode === "weekly" ? weeklyData : monthlyData;
  const adv = viewMode === "weekly" ? advancedWeekly : advancedMonthly;
  const daysList = viewMode === "weekly" ? (weeklyData?.days || []) : (monthlyData?.daily_data || []);
  const categories = activeData?.categories || [];

  const maxCalorie = Math.max(1, ...daysList.map((d) => d.calories || 0));
  const avgCaloriesPerWorkout = activeData?.total_workouts > 0 
    ? Math.round(activeData.total_calories / activeData.total_workouts) 
    : 0;

  // Find top day
  const bestDay = daysList.reduce((max, d) => (d.calories > (max?.calories || 0) ? d : max), null);

  const categoryColors = {
    Yoga: "#10b981",
    Strength: "#3b82f6",
    Cardio: "#f97316",
    HIIT: "#ef4444",
    Walking: "#84cc16",
    Cycling: "#06b6d4",
    Pilates: "#a855f7",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: "2rem", margin: "0 0 4px 0" }}>Fitness Analytics & Insights</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: 0 }}>
            Visual breakdown of weekly calorie output, category distributions, and training consistency.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {/* Timeframe Switcher */}
          <div
            style={{
              display: "flex",
              background: "rgba(255, 255, 255, 0.04)",
              borderRadius: "var(--radius-full)",
              padding: 4,
              border: "1px solid var(--border-subtle)",
            }}
          >
            <button
              onClick={() => setViewMode("weekly")}
              style={{
                padding: "6px 16px",
                borderRadius: "var(--radius-full)",
                fontSize: "0.825rem",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                background: viewMode === "weekly" ? "var(--grad-emerald)" : "transparent",
                color: viewMode === "weekly" ? "#042f2e" : "var(--text-muted)",
              }}
            >
              Weekly (7 Days)
            </button>
            <button
              onClick={() => setViewMode("monthly")}
              style={{
                padding: "6px 16px",
                borderRadius: "var(--radius-full)",
                fontSize: "0.825rem",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                background: viewMode === "monthly" ? "var(--grad-emerald)" : "transparent",
                color: viewMode === "monthly" ? "#042f2e" : "var(--text-muted)",
              }}
            >
              Monthly (30 Days)
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="btn btn-secondary btn-sm"
            title="Print or export analytics report"
          >
            <Printer size={15} /> Print Report
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 18 }}>
        <div className="glass-card" style={{ padding: "20px 22px" }}>
          <div style={{ fontSize: "0.825rem", color: "var(--text-muted)", marginBottom: 8, fontWeight: 600 }}>
            Total Calories Burned
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 6 }}>
            <span style={{ fontSize: "2.2rem", fontWeight: 800, fontFamily: "var(--font-display)", color: "#fb923c" }}>
              {Math.round(activeData?.total_calories || 0).toLocaleString()}
            </span>
            <span style={{ fontSize: "0.9rem", color: "var(--text-dim)" }}>kcal</span>
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>
            Avg {avgCaloriesPerWorkout} kcal per workout
          </div>
        </div>

        <div className="glass-card" style={{ padding: "20px 22px" }}>
          <div style={{ fontSize: "0.825rem", color: "var(--text-muted)", marginBottom: 8, fontWeight: 600 }}>
            Training Sessions
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 6 }}>
            <span style={{ fontSize: "2.2rem", fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--emerald-primary)" }}>
              {activeData?.total_workouts || 0}
            </span>
            <span style={{ fontSize: "0.9rem", color: "var(--text-dim)" }}>sessions</span>
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>
            Completed across {viewMode === "weekly" ? "7 days" : "30 days"}
          </div>
        </div>

        <div className="glass-card" style={{ padding: "20px 22px" }}>
          <div style={{ fontSize: "0.825rem", color: "var(--text-muted)", marginBottom: 8, fontWeight: 600 }}>
            Active Training Hours
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 6 }}>
            <span style={{ fontSize: "2.2rem", fontWeight: 800, fontFamily: "var(--font-display)", color: "#38bdf8" }}>
              {((activeData?.total_duration || 0) / 60).toFixed(1)}
            </span>
            <span style={{ fontSize: "0.9rem", color: "var(--text-dim)" }}>hours ({activeData?.total_duration || 0}m)</span>
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>
            High-quality active movement
          </div>
        </div>

        <div className="glass-card" style={{ padding: "20px 22px" }}>
          <div style={{ fontSize: "0.825rem", color: "var(--text-muted)", marginBottom: 8, fontWeight: 600 }}>
            Peak Calorie Burn
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 6 }}>
            <span style={{ fontSize: "2.2rem", fontWeight: 800, fontFamily: "var(--font-display)", color: "#c084fc" }}>
              {Math.round(bestDay?.calories || 0)}
            </span>
            <span style={{ fontSize: "0.9rem", color: "var(--text-dim)" }}>kcal</span>
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>
            Logged on {bestDay?.date ? new Date(bestDay.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "N/A"}
          </div>
        </div>
      </div>

      {/* Main Chart: Calorie Burn Timeline */}
      <div className="glass-card" style={{ padding: "28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h3 style={{ fontSize: "1.25rem", margin: 0 }}>
              {viewMode === "weekly" ? "Weekly Calorie Tracking (7-Day Overview)" : "Monthly Calorie Trend (30-Day Overview)"}
            </h3>
            <span style={{ fontSize: "0.825rem", color: "var(--text-dim)" }}>
              Daily energy expenditure and workout intensity spikes
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: "0.8rem", color: "var(--text-muted)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: "var(--emerald-primary)" }} />
              <span>Calories (kcal)</span>
            </div>
          </div>
        </div>

        {/* Bar Graph Canvas / SVG Container */}
        <div
          style={{
            height: 240,
            display: "flex",
            alignItems: "flex-end",
            gap: viewMode === "weekly" ? 18 : 6,
            padding: "10px 4px 0 4px",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          {daysList.map((d, idx) => {
            const heightPct = Math.max(4, Math.round((d.calories / maxCalorie) * 100));

            return (
              <div
                key={idx}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  height: "100%",
                  justifyContent: "flex-end",
                  gap: 6,
                  position: "relative",
                }}
                title={`${d.date} (${d.day_name}): ${Math.round(d.calories)} kcal | ${d.duration} mins`}
              >
                {viewMode === "weekly" && (
                  <span style={{ fontSize: "0.75rem", color: "var(--text-dim)", fontWeight: 600 }}>
                    {Math.round(d.calories)}
                  </span>
                )}
                <div
                  style={{
                    width: "100%",
                    height: `${heightPct}%`,
                    borderRadius: "4px 4px 1px 1px",
                    background: d.calories > 0
                      ? "linear-gradient(180deg, #f97316 0%, #10b981 100%)"
                      : "rgba(255, 255, 255, 0.05)",
                    transition: "height 300ms ease, background 200ms ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "linear-gradient(180deg, #34d399 0%, #06b6d4 100%)")}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background =
                      d.calories > 0
                        ? "linear-gradient(180deg, #f97316 0%, #10b981 100%)"
                        : "rgba(255, 255, 255, 0.05)")
                  }
                />
                <span
                  style={{
                    fontSize: viewMode === "weekly" ? "0.8rem" : "0.65rem",
                    color: "var(--text-muted)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {viewMode === "weekly" ? d.day_name : (idx % 5 === 0 ? d.date.slice(5) : "")}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Distribution Breakdown & Coaching Insights */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 24 }}>
        {/* Category Breakdown Card */}
        <div className="glass-card" style={{ padding: "26px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: "1.2rem", margin: 0 }}>Workout Discipline Split</h3>
              <span style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>Calorie burn share by activity</span>
            </div>
            <PieChart size={18} color="var(--cyan-accent)" />
          </div>

          {categories.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-dim)" }}>
              No category data recorded for this timeframe.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {categories.map((cat, idx) => {
                const totalCals = activeData?.total_calories || 1;
                const pct = Math.round((cat.calories / totalCals) * 100);
                const color = categoryColors[cat.category] || "#10b981";

                return (
                  <div key={idx} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", fontWeight: 600 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: color }} />
                        <span>{cat.category}</span>
                        <span style={{ fontSize: "0.775rem", color: "var(--text-dim)", fontWeight: 400 }}>
                          ({cat.count} {cat.count === 1 ? "session" : "sessions"})
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: 10 }}>
                        <span style={{ color: "#fb923c" }}>{Math.round(cat.calories)} kcal</span>
                        <span style={{ color: "var(--text-dim)" }}>{pct}%</span>
                      </div>
                    </div>

                    <div style={{ width: "100%", height: 7, background: "rgba(255, 255, 255, 0.08)", borderRadius: 4, overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${pct}%`,
                          height: "100%",
                          background: color,
                          borderRadius: 4,
                          transition: "width 400ms ease",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Training Insights & Performance Summary */}
        <div className="glass-card" style={{ padding: "26px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: "1.2rem", margin: 0 }}>Training & Coaching Insights</h3>
              <span style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>Performance observations</span>
            </div>
            <Award size={18} color="var(--emerald-primary)" />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {adv?.insights?.length > 0 ? (
              adv.insights.map((text, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: "12px 16px",
                    borderRadius: 12,
                    background: "rgba(16, 185, 129, 0.08)",
                    border: "1px solid rgba(16, 185, 129, 0.2)",
                  }}
                >
                  <p style={{ fontSize: "0.86rem", color: "var(--text-main)", margin: 0, lineHeight: 1.5 }}>{text}</p>
                </div>
              ))
            ) : (
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>
                Log workouts, meals, and goals to unlock training insights for this period.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Consistency, Goal Completion & Weekday Activity */}
      {adv && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
          <div className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: "1.1rem", margin: "0 0 16px 0" }}>Consistency & Goal Performance</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div style={{ padding: 14, borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Workout Consistency</div>
                <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#34d399", marginTop: 4 }}>{adv.consistency_score}%</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
                  {adv.active_days} / {adv.total_period_days} active days
                </div>
              </div>
              <div style={{ padding: 14, borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Goal Completion Rate</div>
                <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#fbbf24", marginTop: 4 }}>{adv.goal_completion_rate}%</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
                  {adv.completed_goals} / {adv.total_goals} completed
                </div>
              </div>
              <div style={{ padding: 14, borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Avg Intake vs Burn</div>
                <div style={{ fontSize: "1.15rem", fontWeight: 700, marginTop: 4 }}>
                  {Math.round(adv.avg_daily_intake)} / {Math.round(adv.avg_daily_burn)}
                </div>
                <div style={{ fontSize: "0.74rem", color: "var(--text-dim)" }}>kcal eaten / burned daily</div>
              </div>
              <div style={{ padding: 14, borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Avg Daily Hydration</div>
                <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "#22d3ee", marginTop: 4 }}>{adv.avg_daily_water_liters} L</div>
                <div style={{ fontSize: "0.74rem", color: "var(--text-dim)" }}>
                  Top day: {adv.best_weekday || "—"}
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: "1.1rem", margin: "0 0 16px 0" }}>Weekday Training Pattern</h3>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 170, paddingTop: 10 }}>
              {(() => {
                const maxWdCals = Math.max(100, ...(adv.weekday_breakdown || []).map((w) => w.calories));
                return (adv.weekday_breakdown || []).map((wd) => {
                  const barH = Math.max(6, Math.round((wd.calories / maxWdCals) * 120));
                  const isBest = wd.day === adv.best_weekday;
                  return (
                    <div key={wd.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}>{wd.workouts}x</span>
                      <div
                        title={`${wd.day}: ${wd.workouts} session(s), ${Math.round(wd.calories)} kcal`}
                        style={{
                          width: "100%",
                          maxWidth: 28,
                          height: barH,
                          borderRadius: "6px 6px 2px 2px",
                          background: isBest ? "var(--grad-emerald)" : "rgba(99, 102, 241, 0.55)",
                        }}
                      />
                      <span style={{ fontSize: "0.76rem", fontWeight: isBest ? 700 : 500, color: isBest ? "#34d399" : "var(--text-muted)" }}>
                        {wd.day}
                      </span>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
