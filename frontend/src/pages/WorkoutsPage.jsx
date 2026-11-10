import React, { useState, useMemo } from "react";
import { 
  Dumbbell, 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  Flame, 
  Edit3, 
  Trash2,
  X
} from "lucide-react";

const CATEGORIES = ["All", "Yoga", "Strength", "Cardio", "HIIT", "Walking", "Cycling", "Pilates"];

const CATEGORY_LABELS = {
  All: "All",
  Yoga: "🧘 Yoga",
  Strength: "🏋️ Strength",
  Cardio: "🏃 Cardio",
  HIIT: "⚡ HIIT",
  Walking: "🚶 Walking",
  Cycling: "🚴 Cycling",
  Pilates: "🩰 Pilates",
};

export default function WorkoutsPage({
  workouts = [],
  loading = false,
  onOpenAddWorkout,
  onEditWorkout,
  onDeleteWorkout,
}) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date_desc");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts = { All: workouts.length };
    workouts.forEach((w) => {
      const cat = w.category || "General";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [workouts]);

  // Filter & sort logic
  const filteredWorkouts = useMemo(() => {
    return workouts
      .filter((w) => {
        // Category filter
        if (selectedCategory !== "All" && w.category.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }
        // Search filter
        if (searchQuery.trim() && !w.workout_name.toLowerCase().includes(searchQuery.toLowerCase().trim())) {
          return false;
        }
        // Date range filter
        if (startDate && w.workout_date < startDate) return false;
        if (endDate && w.workout_date > endDate) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "date_desc") return new Date(b.workout_date) - new Date(a.workout_date);
        if (sortBy === "date_asc") return new Date(a.workout_date) - new Date(b.workout_date);
        if (sortBy === "calories_desc") return b.calories_burned - a.calories_burned;
        if (sortBy === "duration_desc") return b.duration - a.duration;
        return 0;
      });
  }, [workouts, selectedCategory, searchQuery, sortBy, startDate, endDate]);

  const totalCaloriesFiltered = filteredWorkouts.reduce((acc, w) => acc + (w.calories_burned || 0), 0);
  const totalDurationFiltered = filteredWorkouts.reduce((acc, w) => acc + (w.duration || 0), 0);

  const handleDeleteConfirm = async (id) => {
    await onDeleteWorkout(id);
    setDeleteTargetId(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: "2rem", margin: "0 0 4px 0" }}>Workout Log & History</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: 0 }}>
            Log, categorize, filter, and track all your workouts, gym training, and cardio sessions.
          </p>
        </div>

        <button onClick={onOpenAddWorkout} className="btn btn-primary" style={{ padding: "12px 22px" }}>
          <Plus size={18} strokeWidth={2.5} /> + Log New Workout
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="glass-card"
        style={{
          padding: "20px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {/* Search, Sort, and Dates */}
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
          {/* Search */}
          <div style={{ position: "relative", flex: "1 1 240px" }}>
            <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-dim)" }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: 40, paddingRight: searchQuery ? 36 : 14 }}
              placeholder="Search by activity name (e.g. Surya Namaskar, Running, Weight Training)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  color: "var(--text-dim)",
                  cursor: "pointer",
                }}
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Sort By */}
          <div style={{ minWidth: 170 }}>
            <select
              className="form-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date_desc">Newest Session First</option>
              <option value="date_asc">Oldest Session First</option>
              <option value="calories_desc">Highest Calories Burned</option>
              <option value="duration_desc">Longest Duration</option>
            </select>
          </div>

          {/* Date range pickers */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <input
              type="date"
              className="form-input"
              style={{ padding: "10px 12px", fontSize: "0.85rem", width: 140 }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              title="Filter from date"
            />
            <span style={{ color: "var(--text-dim)", fontSize: "0.85rem" }}>to</span>
            <input
              type="date"
              className="form-input"
              style={{ padding: "10px 12px", fontSize: "0.85rem", width: 140 }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              title="Filter to date"
            />
            {(startDate || endDate || searchQuery || selectedCategory !== "All") && (
              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
                className="btn-ghost btn-sm"
                style={{ fontSize: "0.775rem" }}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Category Pills with Dynamic Counts */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", borderTop: "1px solid var(--border-subtle)", paddingTop: 14 }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-dim)", fontWeight: 600, marginRight: 6 }}>Category:</span>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            const count = categoryCounts[cat] || 0;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.825rem",
                  fontWeight: 600,
                  border: isSelected ? "1px solid var(--emerald-primary)" : "1px solid var(--border-subtle)",
                  background: isSelected ? "rgba(16, 185, 129, 0.15)" : "rgba(255, 255, 255, 0.03)",
                  color: isSelected ? "var(--emerald-primary)" : "var(--text-muted)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "all var(--transition-fast)",
                }}
              >
                <span>{CATEGORY_LABELS[cat] || cat}</span>
                <span
                  style={{
                    fontSize: "0.7rem",
                    padding: "0 5px",
                    borderRadius: 4,
                    background: isSelected ? "rgba(16, 185, 129, 0.3)" : "rgba(255, 255, 255, 0.08)",
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filtered stats summary pill bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem", color: "var(--text-muted)", padding: "0 4px", flexWrap: "wrap", gap: 8 }}>
        <span>Showing <strong>{filteredWorkouts.length}</strong> {filteredWorkouts.length === 1 ? "session" : "sessions"}</span>
        <div style={{ display: "flex", gap: 16 }}>
          <span>Total Energy: <strong style={{ color: "#fb923c" }}>{Math.round(totalCaloriesFiltered).toLocaleString()} kcal</strong></span>
          <span>Total Active Time: <strong style={{ color: "var(--emerald-primary)" }}>{totalDurationFiltered} mins</strong></span>
        </div>
      </div>

      {/* Workouts Grid */}
      {filteredWorkouts.length === 0 ? (
        <div className="glass-card" style={{ padding: "60px 20px", textAlign: "center" }}>
          <Dumbbell size={48} style={{ color: "var(--text-dim)", margin: "0 auto 16px auto", opacity: 0.4 }} />
          <h3 style={{ fontSize: "1.2rem", marginBottom: 8 }}>No workouts match your criteria</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", maxWidth: 400, margin: "0 auto 20px auto" }}>
            Try clearing your search or discipline filters, or log a brand new workout to expand your record!
          </p>
          <button onClick={onOpenAddWorkout} className="btn btn-primary">
            + Log Session Now
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 18 }}>
          {filteredWorkouts.map((w) => {
            const dateDisplay = new Date(w.workout_date).toLocaleDateString("en-IN", {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
            });

            return (
              <div
                key={w.id}
                className="glass-card"
                style={{
                  padding: "20px 22px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 16,
                  transition: "all var(--transition-fast)",
                }}
              >
                <div>
                  {/* Top: Category & Date */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span className={`badge badge-${w.category.toLowerCase()}`}>
                      {w.category}
                    </span>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-dim)", display: "flex", alignItems: "center", gap: 4 }}>
                      <Calendar size={13} /> {dateDisplay}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 style={{ fontSize: "1.15rem", margin: "0 0 12px 0", color: "var(--text-main)" }}>
                    {w.workout_name}
                  </h3>

                  {/* Metrics Badge Row */}
                  <div style={{ display: "flex", gap: 12, background: "rgba(255, 255, 255, 0.03)", padding: "10px 14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem" }}>
                      <Clock size={16} color="var(--emerald-primary)" />
                      <span><strong>{w.duration}</strong> mins</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem" }}>
                      <Flame size={16} color="#fb923c" />
                      <span><strong>{Math.round(w.calories_burned)}</strong> kcal</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, borderTop: "1px solid var(--border-subtle)", paddingTop: 14 }}>
                  <button
                    onClick={() => onEditWorkout(w)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: "0.8rem" }}
                  >
                    <Edit3 size={14} /> Edit
                  </button>
                  <button
                    onClick={() => setDeleteTargetId(w.id)}
                    className="btn btn-danger btn-sm"
                    style={{ fontSize: "0.8rem" }}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargetId && (
        <div className="modal-overlay" onClick={() => setDeleteTargetId(null)}>
          <div className="modal-box" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "24px" }}>
              <h3 style={{ fontSize: "1.2rem", margin: "0 0 8px 0" }}>Delete Workout?</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: "0 0 20px 0" }}>
                This will remove the workout and adjust your daily calorie counts and streak. This cannot be undone.
              </p>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button onClick={() => setDeleteTargetId(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button onClick={() => handleDeleteConfirm(deleteTargetId)} className="btn btn-danger">
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
