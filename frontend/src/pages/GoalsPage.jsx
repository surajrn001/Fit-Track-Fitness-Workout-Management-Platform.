import React, { useState } from "react";
import { 
  Target, 
  Plus, 
  Trophy, 
  TrendingUp, 
  Trash2, 
  Edit3, 
  Flame,
  Scale,
  Footprints,
  Dumbbell
} from "lucide-react";
import confetti from "canvas-confetti";

export default function GoalsPage({
  goals = [],
  onOpenAddGoal,
  onEditGoal,
  onDeleteGoal,
  onUpdateGoalProgress,
}) {
  const [activeTab, setActiveTab] = useState("active");
  const [logProgressGoal, setLogProgressGoal] = useState(null);
  const [newProgressValue, setNewProgressValue] = useState("");
  const [submittingProgress, setSubmittingProgress] = useState(false);

  const activeGoals = goals.filter((g) => !g.is_completed);
  const completedGoals = goals.filter((g) => g.is_completed);
  const displayedGoals = activeTab === "active" ? activeGoals : completedGoals;

  const getGoalIcon = (type) => {
    const t = type.toLowerCase();
    if (t.includes("weight")) return <Scale size={20} color="#38bdf8" />;
    if (t.includes("muscle") || t.includes("akhada")) return <Dumbbell size={20} color="#a855f7" />;
    if (t.includes("step")) return <Footprints size={20} color="#34d399" />;
    if (t.includes("calorie")) return <Flame size={20} color="#fb923c" />;
    return <Target size={20} color="var(--emerald-primary)" />;
  };

  const getUnit = (type) => {
    const t = type.toLowerCase();
    if (t.includes("weight") || t.includes("muscle")) return "kg";
    if (t.includes("calorie")) return "kcal";
    if (t.includes("step")) return "steps";
    if (t.includes("namaskar") || t.includes("cycle")) return "cycles";
    if (t.includes("workout") || t.includes("session")) return "sessions";
    return "units";
  };

  const handleOpenProgressModal = (goal) => {
    setLogProgressGoal(goal);
    setNewProgressValue(goal.current_value);
  };

  const handleSaveProgress = async (e) => {
    e.preventDefault();
    if (!logProgressGoal) return;
    try {
      setSubmittingProgress(true);
      const val = parseFloat(newProgressValue);
      await onUpdateGoalProgress(logProgressGoal.id, val);

      // Trigger celebration confetti if goal reached 100%!
      if (val >= logProgressGoal.target_value) {
        confetti({
          particleCount: 140,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#f97316", "#10b981", "#3b82f6", "#eab308"],
        });
      }

      setLogProgressGoal(null);
    } catch (err) {
      alert("Failed to update progress: " + err.message);
    } finally {
      setSubmittingProgress(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: "2rem", margin: "0 0 4px 0" }}>Fitness Goals & Sankalp</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: 0 }}>
            Establish quantifiable milestones, update your logs regularly, and celebrate every victory.
          </p>
        </div>

        <button onClick={onOpenAddGoal} className="btn btn-primary" style={{ padding: "12px 22px" }}>
          <Plus size={18} strokeWidth={2.5} /> + Set New Goal
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, borderBottom: "1px solid var(--border-subtle)", paddingBottom: 12 }}>
        <button
          onClick={() => setActiveTab("active")}
          style={{
            padding: "8px 18px",
            borderRadius: "var(--radius-full)",
            fontSize: "0.875rem",
            fontWeight: 600,
            border: activeTab === "active" ? "1px solid var(--emerald-primary)" : "1px solid transparent",
            background: activeTab === "active" ? "rgba(16, 185, 129, 0.15)" : "transparent",
            color: activeTab === "active" ? "var(--emerald-primary)" : "var(--text-muted)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Target size={16} /> Active Targets ({activeGoals.length})
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          style={{
            padding: "8px 18px",
            borderRadius: "var(--radius-full)",
            fontSize: "0.875rem",
            fontWeight: 600,
            border: activeTab === "completed" ? "1px solid #eab308" : "1px solid transparent",
            background: activeTab === "completed" ? "rgba(234, 179, 8, 0.15)" : "transparent",
            color: activeTab === "completed" ? "#facc15" : "var(--text-muted)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Trophy size={16} /> Completed Milestones ({completedGoals.length})
        </button>
      </div>

      {/* Goals Grid */}
      {displayedGoals.length === 0 ? (
        <div className="glass-card" style={{ padding: "60px 20px", textAlign: "center" }}>
          <Target size={48} style={{ color: "var(--text-dim)", margin: "0 auto 16px auto", opacity: 0.4 }} />
          <h3 style={{ fontSize: "1.2rem", marginBottom: 8 }}>
            {activeTab === "active" ? "No active goals right now" : "No completed milestones yet"}
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", maxWidth: 420, margin: "0 auto 20px auto" }}>
            {activeTab === "active"
              ? "Set a wedding season goal, 15,000 calorie burn, or 10,000 steps target to keep motivated!"
              : "Update your current values as you work out — achieving 100% moves them here with confetti!"}
          </p>
          {activeTab === "active" && (
            <button onClick={onOpenAddGoal} className="btn btn-primary">
              <Plus size={16} /> Set a Target Now
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
          {displayedGoals.map((g) => {
            const unit = getUnit(g.goal_type);
            const pct = g.progress_percentage || Math.min(100, Math.round((g.current_value / g.target_value) * 100));
            const isFinished = g.is_completed || pct >= 100;
            const deadlineDate = new Date(g.deadline);
            const today = new Date();
            const daysLeft = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));

            return (
              <div
                key={g.id}
                className="glass-card"
                style={{
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 18,
                  borderColor: isFinished ? "rgba(16, 185, 129, 0.45)" : "var(--border-subtle)",
                }}
              >
                <div>
                  {/* Top Bar: Icon + Deadline */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 10,
                          background: "rgba(255, 255, 255, 0.05)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {getGoalIcon(g.goal_type)}
                      </div>
                      <div>
                        <h3 style={{ fontSize: "1.05rem", margin: 0 }}>{g.goal_type}</h3>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
                          Started {new Date(g.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                    </div>

                    {isFinished ? (
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: "var(--radius-full)",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          background: "rgba(16, 185, 129, 0.15)",
                          color: "var(--emerald-primary)",
                          border: "1px solid rgba(16, 185, 129, 0.3)",
                        }}
                      >
                        🏆 Shabaash! Achieved
                      </span>
                    ) : daysLeft < 0 ? (
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: "var(--radius-full)",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          background: "rgba(239, 68, 68, 0.15)",
                          color: "#f87171",
                          border: "1px solid rgba(239, 68, 68, 0.3)",
                        }}
                      >
                        Overdue ({Math.abs(daysLeft)}d)
                      </span>
                    ) : (
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: "var(--radius-full)",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          background: "rgba(255, 255, 255, 0.05)",
                          color: "var(--text-muted)",
                        }}
                      >
                        {daysLeft} days remaining
                      </span>
                    )}
                  </div>

                  {/* Numbers */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", margin: "14px 0 6px 0" }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                      <span style={{ fontSize: "1.75rem", fontWeight: 800, fontFamily: "var(--font-display)" }}>
                        {g.current_value}
                      </span>
                      <span style={{ fontSize: "0.9rem", color: "var(--text-dim)" }}>
                        / {g.target_value} {unit}
                      </span>
                    </div>
                    <span style={{ fontSize: "1.1rem", fontWeight: 800, color: isFinished ? "var(--emerald-primary)" : "#38bdf8" }}>
                      {pct}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div style={{ width: "100%", height: 8, background: "rgba(255, 255, 255, 0.08)", borderRadius: 4, overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${Math.min(100, pct)}%`,
                        height: "100%",
                        background: isFinished
                          ? "linear-gradient(90deg, #10b981, #06b6d4)"
                          : "linear-gradient(90deg, #f97316, #10b981)",
                        borderRadius: 4,
                        transition: "width 500ms ease",
                      }}
                    />
                  </div>
                </div>

                {/* Footer Controls */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-subtle)", paddingTop: 14 }}>
                  <button
                    onClick={() => handleOpenProgressModal(g)}
                    className="btn btn-primary btn-sm"
                    style={{ fontSize: "0.8rem", padding: "6px 14px" }}
                  >
                    <TrendingUp size={14} /> Update Value
                  </button>

                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => onEditGoal(g)} className="btn btn-secondary btn-sm" title="Edit goal parameters">
                      <Edit3 size={14} />
                    </button>
                    <button onClick={() => onDeleteGoal(g.id)} className="btn btn-danger btn-sm" title="Delete goal">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Progress Update Modal */}
      {logProgressGoal && (
        <div className="modal-overlay" onClick={() => setLogProgressGoal(null)}>
          <div className="modal-box" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-subtle)" }}>
              <h3 style={{ fontSize: "1.2rem", margin: 0 }}>Update Progress: {logProgressGoal.goal_type}</h3>
              <p style={{ fontSize: "0.825rem", color: "var(--text-dim)", margin: "4px 0 0 0" }}>
                Target: {logProgressGoal.target_value} {getUnit(logProgressGoal.goal_type)}
              </p>
            </div>

            <form onSubmit={handleSaveProgress} style={{ padding: "20px 24px" }}>
              <div className="form-group">
                <label className="form-label">New Current Value ({getUnit(logProgressGoal.goal_type)})</label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  className="form-input"
                  value={newProgressValue}
                  onChange={(e) => setNewProgressValue(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
                <button type="button" onClick={() => setLogProgressGoal(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submittingProgress} className="btn btn-primary">
                  {submittingProgress ? "Saving..." : "Save Progress"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
