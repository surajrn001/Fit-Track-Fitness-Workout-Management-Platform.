import React, { useState, useEffect } from "react";
import { X, Target, Calendar, Award } from "lucide-react";

const GOAL_TYPES = [
  { id: "Weight Loss: Wedding Season Ready", label: "Wedding Season Weight Loss (kg)", unit: "kg", defaultTarget: 5, defaultCurrent: 0 },
  { id: "Fit India 15,000 Calorie Burn", label: "Fit India Calorie Burn (kcal)", unit: "kcal", defaultTarget: 15000, defaultCurrent: 0 },
  { id: "10,000 Daily Steps - Fit India Movement", label: "10k Daily Steps Target", unit: "steps", defaultTarget: 100000, defaultCurrent: 0 },
  { id: "Desi Akhada Strength: Muscle Gain", label: "Akhada Strength: Muscle Gain (kg)", unit: "kg", defaultTarget: 3, defaultCurrent: 0 },
  { id: "Surya Namaskar 108 Challenge", label: "Surya Namaskar 108 Challenge", unit: "cycles", defaultTarget: 108, defaultCurrent: 0 },
  { id: "Monthly Workout Consistency", label: "Monthly Sessions Target", unit: "sessions", defaultTarget: 22, defaultCurrent: 0 },
];

export default function GoalModal({ isOpen, onClose, onSave, initialData = null }) {
  const [goalType, setGoalType] = useState(GOAL_TYPES[0].id);
  const [targetValue, setTargetValue] = useState(5);
  const [currentValue, setCurrentValue] = useState(0);
  const [deadline, setDeadline] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setGoalType(initialData.goal_type || GOAL_TYPES[0].id);
      setTargetValue(initialData.target_value || 5);
      setCurrentValue(initialData.current_value || 0);
      setDeadline(initialData.deadline || new Date().toISOString().split("T")[0]);
    } else {
      setGoalType(GOAL_TYPES[0].id);
      setTargetValue(5);
      setCurrentValue(0);
      const d = new Date();
      d.setDate(d.getDate() + 30);
      setDeadline(d.toISOString().split("T")[0]);
    }
    setError("");
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const currentTypeMeta = GOAL_TYPES.find((g) => g.id === goalType) || GOAL_TYPES[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (targetValue <= 0) {
      setError("Target value must be greater than 0.");
      return;
    }
    if (currentValue < 0) {
      setError("Current progress cannot be negative.");
      return;
    }
    if (!deadline) {
      setError("Please select a target deadline.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      await onSave({
        goal_type: goalType,
        target_value: parseFloat(targetValue),
        current_value: parseFloat(currentValue),
        deadline,
      });
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save goal");
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
              <Target size={20} />
            </div>
            <h3 style={{ fontSize: "1.25rem", margin: 0 }}>{initialData ? "Edit Fitness Milestone" : "Set New Fitness Target"}</h3>
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
            <label className="form-label">Goal Category / Program</label>
            <select
              className="form-select"
              value={goalType}
              onChange={(e) => {
                const selected = e.target.value;
                setGoalType(selected);
                const meta = GOAL_TYPES.find((g) => g.id === selected);
                if (meta && !initialData) {
                  setTargetValue(meta.defaultTarget);
                }
              }}
            >
              {GOAL_TYPES.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Target ({currentTypeMeta.unit})</label>
              <input
                type="number"
                step="any"
                min="0.1"
                className="form-input"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Current Progress ({currentTypeMeta.unit})</label>
              <input
                type="number"
                step="any"
                min="0"
                className="form-input"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Target Completion Deadline</label>
            <div style={{ position: "relative" }}>
              <input
                type="date"
                className="form-input"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
              />
              <Calendar size={16} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-dim)", pointerEvents: "none" }} />
            </div>
          </div>

          {/* Quick presets */}
          <div style={{ marginTop: 6, marginBottom: 16 }}>
            <span style={{ fontSize: "0.775rem", color: "var(--text-dim)", display: "block", marginBottom: 6 }}>Suggested Milestones:</span>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {[
                { type: "Weight Loss: Wedding Season Ready", target: 5, label: "Lose 5kg for Wedding" },
                { type: "Fit India 15,000 Calorie Burn", target: 15000, label: "Burn 15,000 kcal" },
                { type: "10,000 Daily Steps - Fit India Movement", target: 100000, label: "100k Steps Challenge" },
                { type: "Surya Namaskar 108 Challenge", target: 108, label: "108 Surya Namaskars" },
              ].map((m, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setGoalType(m.type);
                    setTargetValue(m.target);
                    setCurrentValue(0);
                  }}
                  className="btn-secondary btn-sm"
                  style={{ fontSize: "0.75rem", padding: "4px 8px" }}
                >
                  {m.label}
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
              {submitting ? "Saving..." : initialData ? "Save Changes" : "Set Fitness Goal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
