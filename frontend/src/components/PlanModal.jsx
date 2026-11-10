import React, { useState, useEffect } from "react";
import { X, Calendar, Clock, FileText, CheckCircle2 } from "lucide-react";

export default function PlanModal({ isOpen, onClose, onSave, initialData = null }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setScheduledDate(initialData.scheduled_date || new Date().toISOString().split("T")[0]);
      setIsCompleted(initialData.is_completed || false);
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setTitle("");
      setDescription("");
      setScheduledDate(tomorrow.toISOString().split("T")[0]);
      setIsCompleted(false);
    }
    setError("");
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please provide a plan title.");
      return;
    }
    if (!scheduledDate) {
      setError("Please choose a scheduled date.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      await onSave({
        title: title.trim(),
        description: description.trim() || null,
        scheduled_date: scheduledDate,
        ...(initialData ? { is_completed: isCompleted } : {})
      });
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save workout plan.");
    } finally {
      setSaving(false);
    }
  };

  const quickPresets = [
    { title: "Surya Namaskar 24 Cycles & Pranayama", desc: "Morning mobility, core activation, and breathwork." },
    { title: "Akhada Baithaks & Dand Power Session", desc: "100 Hindu squats, dive-bomber pushups, and core hold." },
    { title: "Marine Drive 5K Sunrise Jog", desc: "Aerobic endurance run with steady negative splits." },
    { title: "Heavy Compound Strength & Deadlifts", desc: "Barbell deadlifts, overhead presses, and weighted pullups." },
    { title: "Evening Restorative Yoga & Shatapawali", desc: "Cooling stretches, hip openers, and 1000-step walk." }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid var(--border-subtle)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(16, 185, 129, 0.15)", color: "var(--emerald-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Calendar size={20} />
            </div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>
              {initialData ? "Edit Scheduled Workout" : "Schedule Future Workout"}
            </h2>
          </div>
          <button onClick={onClose} className="btn-secondary" style={{ padding: 6, borderRadius: 8, display: "flex" }}>
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 18 }}>
          {error && (
            <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#fca5a5", fontSize: "0.85rem" }}>
              {error}
            </div>
          )}

          {/* Quick Presets (New only) */}
          {!initialData && (
            <div>
              <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", fontWeight: 700, display: "block", marginBottom: 8 }}>
                Suggested Indian Workouts:
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {quickPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setTitle(preset.title);
                      setDescription(preset.desc);
                    }}
                    style={{
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: 8,
                      padding: "4px 10px",
                      fontSize: "0.75rem",
                      color: "var(--text-main)",
                      cursor: "pointer",
                      transition: "all var(--transition-fast)",
                    }}
                    onMouseEnter={(e) => (e.target.style.borderColor = "var(--emerald-primary)")}
                    onMouseLeave={(e) => (e.target.style.borderColor = "var(--border-subtle)")}
                  >
                    + {preset.title.split("&")[0].trim()}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>
              Workout Title *
            </label>
            <input
              type="text"
              className="input-field"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Akhada Squats & Surya Namaskar"
              required
            />
          </div>

          {/* Scheduled Date */}
          <div>
            <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>
              Scheduled Date *
            </label>
            <input
              type="date"
              className="input-field"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>
              Description & Target Exercises (Optional)
            </label>
            <textarea
              className="input-field"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Details about sets, reps, targeted muscles, or duration..."
              style={{ resize: "vertical" }}
            />
          </div>

          {/* Completed checkbox if editing */}
          {initialData && (
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "10px 14px", borderRadius: 8, background: "rgba(255, 255, 255, 0.03)", border: "1px solid var(--border-subtle)" }}>
              <input
                type="checkbox"
                checked={isCompleted}
                onChange={(e) => setIsCompleted(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: "var(--emerald-primary)" }}
              />
              <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>Mark as completed</span>
            </label>
          )}

          {/* Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 10 }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {saving ? "Saving..." : initialData ? "Save Changes" : "Schedule Workout"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
