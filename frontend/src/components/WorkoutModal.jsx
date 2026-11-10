import React, { useState, useEffect } from "react";
import { X, Flame, Clock, Calendar, Dumbbell, Sparkles } from "lucide-react";

// Calorie burn rate estimates per minute by category
const CALORIE_RATES = {
  Cardio: 11,
  HIIT: 12.5,
  Strength: 8.5,
  Cycling: 10,
  Walking: 5,
  Pilates: 6,
  Yoga: 5.5,
};

export default function WorkoutModal({ isOpen, onClose, onSave, initialData = null }) {
  const [workoutName, setWorkoutName] = useState("");
  const [category, setCategory] = useState("Yoga");
  const [duration, setDuration] = useState(35);
  const [caloriesBurned, setCaloriesBurned] = useState(190);
  const [workoutDate, setWorkoutDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setWorkoutName(initialData.workout_name || "");
      setCategory(initialData.category || "Yoga");
      setDuration(initialData.duration || 35);
      setCaloriesBurned(initialData.calories_burned || 190);
      setWorkoutDate(initialData.workout_date || new Date().toISOString().split("T")[0]);
    } else {
      setWorkoutName("");
      setCategory("Yoga");
      setDuration(35);
      setCaloriesBurned(190);
      setWorkoutDate(new Date().toISOString().split("T")[0]);
    }
    setError("");
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleEstimateCalories = () => {
    const rate = CALORIE_RATES[category] || 8;
    const est = Math.round(Number(duration) * rate);
    setCaloriesBurned(est);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!workoutName.trim()) {
      setError("Please enter a workout name.");
      return;
    }
    if (duration <= 0) {
      setError("Duration must be greater than 0 minutes.");
      return;
    }
    if (caloriesBurned < 0) {
      setError("Calories cannot be negative.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      await onSave({
        workout_name: workoutName.trim(),
        category,
        duration: parseInt(duration),
        calories_burned: parseFloat(caloriesBurned),
        workout_date: workoutDate,
      });
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save workout");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid var(--border-subtle)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(249, 115, 22, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fb923c" }}>
              <Dumbbell size={20} />
            </div>
            <h3 style={{ fontSize: "1.25rem", margin: 0 }}>{initialData ? "Edit Workout Session" : "Log New Workout"}</h3>
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ padding: 6, borderRadius: 8, cursor: "pointer", border: "none" }}>
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: "20px 24px" }}>
          {error && (
            <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(239, 68, 68, 0.15)", color: "#f87171", fontSize: "0.85rem", marginBottom: 16, border: "1px solid rgba(239, 68, 68, 0.3)" }}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Workout / Activity Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Surya Namaskar (24 cycles), Marine Drive 5K, Akhada Squats..."
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  const rate = CALORIE_RATES[e.target.value] || 8;
                  setCaloriesBurned(Math.round(duration * rate));
                }}
              >
                <option value="Yoga">🧘 Yoga & Pranayama</option>
                <option value="Cardio">🏃 Cardio / Running</option>
                <option value="Strength">🏋️ Strength / Akhada</option>
                <option value="HIIT">⚡ HIIT / Sports (Badminton/Cricket)</option>
                <option value="Cycling">🚴 Cycling</option>
                <option value="Walking">🚶 Walking / Shatapawali</option>
                <option value="Pilates">🩰 Pilates & Core</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-input"
                value={workoutDate}
                onChange={(e) => setWorkoutDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Duration (Minutes)</label>
              <div style={{ position: "relative" }}>
                <input
                  type="number"
                  min="1"
                  max="720"
                  className="form-input"
                  value={duration}
                  onChange={(e) => {
                    const d = Math.max(1, parseInt(e.target.value) || 1);
                    setDuration(d);
                    const rate = CALORIE_RATES[category] || 8;
                    setCaloriesBurned(Math.round(d * rate));
                  }}
                  required
                />
                <Clock size={16} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-dim)" }} />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label className="form-label">Calories Burned (kcal)</label>
                <button
                  type="button"
                  onClick={handleEstimateCalories}
                  style={{ background: "none", border: "none", color: "var(--emerald-primary)", fontSize: "0.75rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, padding: 0 }}
                  title="Auto estimate based on category and duration"
                >
                  <Sparkles size={12} /> Auto-Estimate
                </button>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type="number"
                  min="0"
                  max="10000"
                  className="form-input"
                  value={caloriesBurned}
                  onChange={(e) => setCaloriesBurned(parseFloat(e.target.value) || 0)}
                  required
                />
                <Flame size={16} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "#f97316" }} />
              </div>
            </div>
          </div>

          {/* Quick presets */}
          <div style={{ marginTop: 6, marginBottom: 18 }}>
            <span style={{ fontSize: "0.775rem", color: "var(--text-dim)", display: "block", marginBottom: 6 }}>Quick Workout Presets:</span>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {[
                { name: "Surya Namaskar & Pranayama", cat: "Yoga", dur: 35, cal: 190 },
                { name: "Marine Drive 5K Morning Run", cat: "Cardio", dur: 30, cal: 350 },
                { name: "Desi Akhada Heavy Squats", cat: "Strength", dur: 45, cal: 410 },
                { name: "Club Badminton Match (3 Sets)", cat: "HIIT", dur: 45, cal: 480 },
                { name: "Post-Dinner Shatapawali Walk", cat: "Walking", dur: 30, cal: 140 },
              ].map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setWorkoutName(preset.name);
                    setCategory(preset.cat);
                    setDuration(preset.dur);
                    setCaloriesBurned(preset.cal);
                  }}
                  className="btn-secondary btn-sm"
                  style={{ fontSize: "0.75rem", padding: "4px 8px" }}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24, paddingTop: 16, borderTop: "1px solid var(--border-subtle)" }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? "Saving..." : initialData ? "Update Workout" : "+ Add Workout"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
