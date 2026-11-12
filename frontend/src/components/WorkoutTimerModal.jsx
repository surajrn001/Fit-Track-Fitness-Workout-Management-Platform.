import React, { useState } from "react";
import { X, Play, Pause, Square, RotateCcw, Flame, Clock, CheckCircle2 } from "lucide-react";
import { CALORIE_RATES } from "./WorkoutModal";

const CATEGORIES = Object.keys(CALORIE_RATES);

export function formatElapsedClock(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export default function WorkoutTimerModal({
  isOpen,
  onClose,
  timerState,
  onStart,
  onPause,
  onReset,
  onUpdateMeta,
  onFinishAndSave,
}) {
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const { workoutName, category, elapsedSeconds, targetMinutes, isRunning } = timerState;
  const ratePerMin = CALORIE_RATES[category] || 8;
  const liveCalories = Math.max(0, Math.round((elapsedSeconds / 60) * ratePerMin * 10) / 10);
  const targetSecs = Math.max(60, (Number(targetMinutes) || 30) * 60);
  const progressPct = Math.min(100, Math.round((elapsedSeconds / targetSecs) * 100));

  const handleSaveSession = async () => {
    setSaving(true);
    try {
      const durationMins = Math.max(1, Math.round(elapsedSeconds / 60));
      const finalCalories = Math.max(Math.round(durationMins * ratePerMin), Math.round(liveCalories));
      await onFinishAndSave({
        workout_name: (workoutName || `${category} Timed Session`).trim(),
        category,
        duration: durationMins,
        calories_burned: finalCalories,
        workout_date: new Date().toISOString().split("T")[0],
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ padding: 26 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Clock size={20} color="#34d399" />
            <h2 style={{ fontSize: "1.25rem", margin: 0 }}>Live Workout Timer</h2>
          </div>
          <button type="button" onClick={onClose} className="btn btn-ghost btn-sm" title="Minimize timer">
            <X size={18} />
          </button>
        </div>

        {/* Clock Display */}
        <div
          style={{
            padding: "24px 20px",
            borderRadius: "var(--radius-md)",
            background: "rgba(16, 185, 129, 0.06)",
            border: "1px solid rgba(16, 185, 129, 0.25)",
            textAlign: "center",
            marginBottom: 18,
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "3.1rem",
              fontWeight: 800,
              letterSpacing: "0.04em",
              color: isRunning ? "#34d399" : "#fff",
              lineHeight: 1.1,
            }}
          >
            {formatElapsedClock(elapsedSeconds)}
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 12, fontSize: "0.88rem", color: "var(--text-muted)" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#fb923c", fontWeight: 700 }}>
              <Flame size={15} /> {liveCalories.toFixed(1)} kcal burned
            </span>
            <span>Rate: {ratePerMin} kcal/min</span>
          </div>

          <div style={{ marginTop: 14, height: 8, borderRadius: 99, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
            <div
              style={{
                width: `${progressPct}%`,
                height: "100%",
                background: "var(--grad-emerald)",
                transition: "width 0.4s ease",
              }}
            />
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginTop: 6 }}>
            {progressPct}% of {targetMinutes} min target
          </div>
        </div>

        {/* Session Setup */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Workout Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., Morning Interval Run"
              value={workoutName}
              onChange={(e) => onUpdateMeta({ workoutName: e.target.value })}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => onUpdateMeta({ category: e.target.value })}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Target (mins)</label>
              <input
                type="number"
                min="5"
                max="240"
                className="form-input"
                value={targetMinutes}
                onChange={(e) => onUpdateMeta({ targetMinutes: Number(e.target.value || 30) })}
              />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {!isRunning ? (
            <button type="button" onClick={onStart} className="btn btn-primary" style={{ flex: 1 }}>
              <Play size={16} /> {elapsedSeconds > 0 ? "Resume" : "Start Timer"}
            </button>
          ) : (
            <button type="button" onClick={onPause} className="btn btn-secondary" style={{ flex: 1, borderColor: "#f59e0b", color: "#fbbf24" }}>
              <Pause size={16} /> Pause
            </button>
          )}

          <button
            type="button"
            onClick={onReset}
            disabled={elapsedSeconds === 0 && !isRunning}
            className="btn btn-secondary"
            title="Reset clock"
          >
            <RotateCcw size={16} />
          </button>

          <button
            type="button"
            onClick={handleSaveSession}
            disabled={saving || elapsedSeconds < 10}
            className="btn btn-primary"
            style={{ width: "100%", marginTop: 4, background: elapsedSeconds < 10 ? "rgba(255,255,255,0.08)" : undefined, color: elapsedSeconds < 10 ? "var(--text-dim)" : undefined }}
          >
            {elapsedSeconds < 10 ? (
              <>
                <Square size={15} /> Run at least 10 seconds to save workout
              </>
            ) : (
              <>
                <CheckCircle2 size={16} /> {saving ? "Saving Workout..." : "Stop & Save Workout"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

