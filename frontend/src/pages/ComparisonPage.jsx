import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Calendar, 
  Flame, 
  Dumbbell, 
  Clock, 
  Award, 
  Sparkles,
  BarChart3,
  CheckCircle2,
  RefreshCw
} from "lucide-react";
import { api } from "../services/api";

export default function ComparisonPage({ initialWeeklyData = null, initialMonthlyData = null }) {
  const [viewMode, setViewMode] = useState("weekly"); // "weekly" or "monthly"
  const [weeklyComp, setWeeklyComp] = useState(initialWeeklyData);
  const [monthlyComp, setMonthlyComp] = useState(initialMonthlyData);
  const [loading, setLoading] = useState(false);

  const fetchComparisonData = async () => {
    try {
      setLoading(true);
      const [w, m] = await Promise.all([
        api.getWeeklyComparison(),
        api.getMonthlyComparison(),
      ]);
      setWeeklyComp(w);
      setMonthlyComp(m);
    } catch (err) {
      console.error("Failed to fetch progress comparison:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!weeklyComp || !monthlyComp) {
      fetchComparisonData();
    }
  }, []);

  const currentData = viewMode === "weekly" ? weeklyComp : monthlyComp;

  const renderTrendPill = (metric) => {
    if (!metric) return null;
    const isUp = metric.trend === "up";
    const isDown = metric.trend === "down";

    return (
      <span className={`trend-pill ${isUp ? "trend-up" : isDown ? "trend-down" : "trend-same"}`}>
        {isUp && <TrendingUp size={14} />}
        {isDown && <TrendingDown size={14} />}
        {!isUp && !isDown && <Minus size={14} />}
        {metric.pct_change > 0 ? `+${metric.pct_change}%` : `${metric.pct_change}%`}
      </span>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Header */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--emerald-primary)", fontWeight: 700 }}>
              Module 9 • Progress & Performance Comparison
            </span>
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, margin: 0, fontFamily: "var(--font-display)" }}>
            Progress <span className="text-gradient">Comparison</span>
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginTop: 4 }}>
            Benchmark current performance against previous cycles, analyze improvement velocity, and elevate training consistency.
          </p>
        </div>

        {/* View Toggle (Weekly vs Monthly) */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", background: "rgba(15, 23, 42, 0.6)", padding: 4, borderRadius: 10, border: "1px solid var(--border-subtle)" }}>
            <button
              onClick={() => setViewMode("weekly")}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "none",
                background: viewMode === "weekly" ? "var(--emerald-primary)" : "transparent",
                color: viewMode === "weekly" ? "#042f2e" : "var(--text-muted)",
                fontWeight: 700,
                fontSize: "0.85rem",
                cursor: "pointer",
                transition: "all var(--transition-fast)",
              }}
            >
              Weekly (7-Day vs 7-Day)
            </button>
            <button
              onClick={() => setViewMode("monthly")}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "none",
                background: viewMode === "monthly" ? "var(--emerald-primary)" : "transparent",
                color: viewMode === "monthly" ? "#042f2e" : "var(--text-muted)",
                fontWeight: 700,
                fontSize: "0.85rem",
                cursor: "pointer",
                transition: "all var(--transition-fast)",
              }}
            >
              Monthly (30-Day vs 30-Day)
            </button>
          </div>

          <button onClick={fetchComparisonData} className="btn-secondary" style={{ padding: 10, borderRadius: 10 }} title="Refresh Comparison">
            <RefreshCw size={16} className={loading ? "pulse-animation" : ""} />
          </button>
        </div>
      </div>

      {!currentData ? (
        <div className="glass-card" style={{ padding: "48px 24px", textAlign: "center" }}>
          <span style={{ color: "var(--text-muted)" }}>Loading performance comparison data...</span>
        </div>
      ) : (
        <>
          {/* Key Metric Comparison Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 18 }}>
            {/* Calories Comparison */}
            <div className="glass-card" style={{ padding: "22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(249, 115, 22, 0.15)", color: "#f97316", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Flame size={20} />
                  </div>
                  <div>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Calories Burned</span>
                    <h3 style={{ fontSize: "1.45rem", fontWeight: 800, margin: 0 }}>
                      {Math.round(currentData.metrics.calories.current)} <span style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--text-muted)" }}>kcal</span>
                    </h3>
                  </div>
                </div>
                {renderTrendPill(currentData.metrics.calories)}
              </div>

              <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: 10, display: "flex", justifyContent: "space-between", fontSize: "0.825rem", color: "var(--text-dim)" }}>
                <span>Previous: {Math.round(currentData.metrics.calories.previous)} kcal</span>
                <span>Change: {currentData.metrics.calories.change > 0 ? `+${Math.round(currentData.metrics.calories.change)}` : Math.round(currentData.metrics.calories.change)} kcal</span>
              </div>
            </div>

            {/* Workouts Logged */}
            <div className="glass-card" style={{ padding: "22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(16, 185, 129, 0.15)", color: "var(--emerald-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Dumbbell size={20} />
                  </div>
                  <div>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Workouts Logged</span>
                    <h3 style={{ fontSize: "1.45rem", fontWeight: 800, margin: 0 }}>
                      {currentData.metrics.workouts.current} <span style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--text-muted)" }}>sessions</span>
                    </h3>
                  </div>
                </div>
                {renderTrendPill(currentData.metrics.workouts)}
              </div>

              <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: 10, display: "flex", justifyContent: "space-between", fontSize: "0.825rem", color: "var(--text-dim)" }}>
                <span>Previous: {currentData.metrics.workouts.previous} sessions</span>
                <span>Difference: {currentData.metrics.workouts.change > 0 ? `+${currentData.metrics.workouts.change}` : currentData.metrics.workouts.change}</span>
              </div>
            </div>

            {/* Active Training Duration */}
            <div className="glass-card" style={{ padding: "22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(59, 130, 246, 0.15)", color: "#60a5fa", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Clock size={20} />
                  </div>
                  <div>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Active Minutes</span>
                    <h3 style={{ fontSize: "1.45rem", fontWeight: 800, margin: 0 }}>
                      {Math.round(currentData.metrics.duration.current)} <span style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--text-muted)" }}>mins</span>
                    </h3>
                  </div>
                </div>
                {renderTrendPill(currentData.metrics.duration)}
              </div>

              <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: 10, display: "flex", justifyContent: "space-between", fontSize: "0.825rem", color: "var(--text-dim)" }}>
                <span>Previous: {Math.round(currentData.metrics.duration.previous)} mins</span>
                <span>Change: {currentData.metrics.duration.change > 0 ? `+${Math.round(currentData.metrics.duration.change)}` : Math.round(currentData.metrics.duration.change)} mins</span>
              </div>
            </div>

            {/* Active Days / Consistency */}
            <div className="glass-card" style={{ padding: "22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(168, 85, 247, 0.15)", color: "#c084fc", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Calendar size={20} />
                  </div>
                  <div>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Active Days</span>
                    <h3 style={{ fontSize: "1.45rem", fontWeight: 800, margin: 0 }}>
                      {currentData.metrics.active_days.current} <span style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--text-muted)" }}>days</span>
                    </h3>
                  </div>
                </div>
                {renderTrendPill(currentData.metrics.active_days)}
              </div>

              <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: 10, display: "flex", justifyContent: "space-between", fontSize: "0.825rem", color: "var(--text-dim)" }}>
                <span>Previous: {currentData.metrics.active_days.previous} days</span>
                <span>Consistency: {Math.round((currentData.metrics.active_days.current / (viewMode === "weekly" ? 7 : 30)) * 100)}%</span>
              </div>
            </div>
          </div>

          {/* Visual Benchmark Comparison Table / Side-by-Side Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {/* Current Period Card */}
            <div className="glass-card" style={{ padding: "24px", border: "1px solid rgba(16, 185, 129, 0.4)", position: "relative" }}>
              <div style={{ position: "absolute", top: 16, right: 16, padding: "3px 10px", borderRadius: 9999, background: "rgba(16, 185, 129, 0.15)", color: "var(--emerald-primary)", fontSize: "0.75rem", fontWeight: 700 }}>
                CURRENT PERIOD
              </div>

              <h3 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: 4 }}>
                {viewMode === "weekly" ? "This Week" : "Last 30 Days"}
              </h3>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: 20 }}>
                {viewMode === "weekly" ? currentData.this_week.period : currentData.this_month.period}
              </span>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: 4 }}>
                    <span style={{ color: "var(--text-muted)" }}>Total Calories Burned</span>
                    <strong>{Math.round(viewMode === "weekly" ? currentData.this_week.calories : currentData.this_month.calories)} kcal</strong>
                  </div>
                  <div style={{ height: 8, background: "rgba(255, 255, 255, 0.05)", borderRadius: 9999, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: "100%", background: "var(--grad-fire)", borderRadius: 9999 }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: 4 }}>
                    <span style={{ color: "var(--text-muted)" }}>Workouts Completed</span>
                    <strong>{viewMode === "weekly" ? currentData.this_week.workouts : currentData.this_month.workouts} sessions</strong>
                  </div>
                  <div style={{ height: 8, background: "rgba(255, 255, 255, 0.05)", borderRadius: 9999, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: "100%", background: "var(--grad-emerald)", borderRadius: 9999 }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: 4 }}>
                    <span style={{ color: "var(--text-muted)" }}>Active Duration</span>
                    <strong>{Math.round(viewMode === "weekly" ? currentData.this_week.duration : currentData.this_month.duration)} mins</strong>
                  </div>
                  <div style={{ height: 8, background: "rgba(255, 255, 255, 0.05)", borderRadius: 9999, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: "100%", background: "linear-gradient(90deg, #3b82f6, #06b6d4)", borderRadius: 9999 }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Prior Period Card */}
            <div className="glass-card" style={{ padding: "24px", border: "1px solid var(--border-subtle)", opacity: 0.85, position: "relative" }}>
              <div style={{ position: "absolute", top: 16, right: 16, padding: "3px 10px", borderRadius: 9999, background: "rgba(255, 255, 255, 0.06)", color: "var(--text-dim)", fontSize: "0.75rem", fontWeight: 700 }}>
                BENCHMARK
              </div>

              <h3 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: 4 }}>
                {viewMode === "weekly" ? "Last Week" : "Prior 30 Days"}
              </h3>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: 20 }}>
                {viewMode === "weekly" ? currentData.last_week.period : currentData.last_month.period}
              </span>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: 4 }}>
                    <span style={{ color: "var(--text-muted)" }}>Total Calories Burned</span>
                    <strong>{Math.round(viewMode === "weekly" ? currentData.last_week.calories : currentData.last_month.calories)} kcal</strong>
                  </div>
                  <div style={{ height: 8, background: "rgba(255, 255, 255, 0.05)", borderRadius: 9999, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: "100%", background: "#475569", borderRadius: 9999 }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: 4 }}>
                    <span style={{ color: "var(--text-muted)" }}>Workouts Completed</span>
                    <strong>{viewMode === "weekly" ? currentData.last_week.workouts : currentData.last_month.workouts} sessions</strong>
                  </div>
                  <div style={{ height: 8, background: "rgba(255, 255, 255, 0.05)", borderRadius: 9999, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: "100%", background: "#475569", borderRadius: 9999 }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: 4 }}>
                    <span style={{ color: "var(--text-muted)" }}>Active Duration</span>
                    <strong>{Math.round(viewMode === "weekly" ? currentData.last_week.duration : currentData.last_month.duration)} mins</strong>
                  </div>
                  <div style={{ height: 8, background: "rgba(255, 255, 255, 0.05)", borderRadius: 9999, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: "100%", background: "#475569", borderRadius: 9999 }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Coaching Insights & Actionable Feedback */}
          <div className="glass-card" style={{ padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(245, 158, 11, 0.15)", color: "#fbbf24", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Sparkles size={20} />
              </div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0 }}>
                FitTrack Coach Performance Insights
              </h3>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {currentData.insights.map((insight, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    padding: "12px 16px",
                    borderRadius: 10,
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid var(--border-subtle)",
                    fontSize: "0.9rem",
                    lineHeight: 1.5,
                  }}
                >
                  <CheckCircle2 size={18} color="var(--emerald-primary)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
