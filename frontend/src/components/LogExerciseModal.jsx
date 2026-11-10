import React, { useState, useEffect } from "react";
import { X, Flame, Clock, Calendar, Dumbbell } from "lucide-react";

export default function LogExerciseModal({ isOpen, onClose, exercise, onLog, onSchedule }) {
  const [mode, setMode] = useState("log"); // "log" or "schedule"
  const [duration, setDuration] = useState(30);
  const [calories, setCalories] = useState(200);
  const [workoutDate, setWorkoutDate] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (exercise) {
      setDuration(exercise.duration || 30);
      setCalories(exercise.calories_est || 180);
      setWorkoutDate(new Date().toISOString().split("T")[0]);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setScheduledDate(tomorrow.toISOString().split("T")[0]);
      setMode("log");
      setError("");
    }
  }, [exercise, isOpen]);

  if (!isOpen || !exercise) return null;

  const handleDurationChange = (val) => {
    const d = parseInt(val) || 0;
    setDuration(d);
    // Recalculate estimated calories proportionately
    if (exercise.duration > 0) {
      const ratio = d / exercise.duration;
      setCalories(Math.round(exercise.calories_est * ratio));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      if (mode === "log") {
        await onLog(exercise.id, {
          duration: Number(duration),
          calories_burned: Number(calories),
          workout_date: workoutDate,
        });
      } else {
        await onSchedule(exercise.id, {
          title: exercise.name,
          description: `${exercise.description || ""} (${duration} mins, ~${calories} kcal).`,
          scheduled_date: scheduledDate,
        });
      }
      onClose();
    } catch (err) {
      setError(err.message || "Failed to process exercise.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid var(--border-subtle)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(16, 185, 129, 0.15)", color: "var(--emerald-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Dumbbell size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0 }}>{exercise.name}</h2>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>{exercise.category} • {exercise.difficulty}</span>
            </div>
          </div>
          <button onClick={onClose} className="btn-secondary" style={{ padding: 6, borderRadius: 8, display: "flex" }}>
            <X size={18} />
          </button>
        </div>

        {/* Tab Toggle: Log Now vs Schedule for Future */}
        <div style={{ display: "flex", background: "rgba(15, 23, 42, 0.6)", padding: 4, margin: "16px 24px 0", borderRadius: 10, border: "1px solid var(--border-subtle)" }}>
          <button
            type="button"
            onClick={() => setMode("log")}
            style={{
              flex: 1,
              padding: "8px 12px",
              borderRadius: 8,
              border: "none",
              background: mode === "log" ? "var(--emerald-primary)" : "transparent",
              color: mode === "log" ? "#042f2e" : "var(--text-muted)",
              fontWeight: 700,
              fontSize: "0.85rem",
              cursor: "pointer",
              transition: "all var(--transition-fast)",
            }}
          >
            ⚡ Log as Completed Today
          </button>
          <button
            type="button"
            onClick={() => setMode("schedule")}
            style={{
              flex: 1,
              padding: "8px 12px",
              borderRadius: 8,
              border: "none",
              background: mode === "schedule" ? "var(--emerald-primary)" : "transparent",
              color: mode === "schedule" ? "#042f2e" : "var(--text-muted)",
              fontWeight: 700,
              fontSize: "0.85rem",
              cursor: "pointer",
              transition: "all var(--transition-fast)",
            }}
          >
            📅 Schedule in Calendar
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "20px 24px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          {error && (
            <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#fca5a5", fontSize: "0.85rem" }}>
              {error}
            </div>
          )}

          <div style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(255, 255, 255, 0.03)", border: "1px solid var(--border-subtle)", fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
            {exercise.description}
          </div>

          {/* Duration & Estimated Calories */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>
                Duration (minutes)
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="number"
                  className="input-field"
                  value={duration}
                  onChange={(e) => handleDurationChange(e.target.value)}
                  min={1}
                  required
                />
                <Clock size={16} style={{ position: "absolute", right: 12, top: 12, color: "var(--text-dim)" }} />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>
                Energy Burn (kcal)
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="number"
                  className="input-field"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  min={0}
                  required
                />
                <Flame size={16} style={{ position: "absolute", right: 12, top: 12, color: "#f97316" }} />
              </div>
            </div>
          </div>

          {/* Date Picker depending on Mode */}
          {mode === "log" ? (
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>
                Workout Date
              </label>
              <input
                type="date"
                className="input-field"
                value={workoutDate}
                onChange={(e) => setWorkoutDate(e.target.value)}
                required
              />
            </div>
          ) : (
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>
                Scheduled Future Date
              </label>
              <input
                type="date"
                className="input-field"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                required
              />
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 8 }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {loading ? "Saving..." : mode === "log" ? "Log Workout Now" : "Schedule to Calendar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
