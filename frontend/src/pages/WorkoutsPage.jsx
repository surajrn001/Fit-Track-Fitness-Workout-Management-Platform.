import React, { useState, useMemo } from "react";
import { 
  Dumbbell, 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  Flame, 
  Edit3, 
  Trash2
} from "lucide-react";

const CATEGORIES = ["All", "Yoga", "Strength", "Cardio", "HIIT", "Walking", "Cycling", "Pilates"];

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
          <h1 style={{ fontSize: "2rem", margin: "0 0 4px 0" }}>Workout Log & Management</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: 0 }}>
            Log, categorize, filter, and track all your Yogic flows, Akhada lifts, and Cardio sessions.
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
              style={{ paddingLeft: 40 }}
              placeholder="Search by activity name (e.g. Surya Namaskar, Marine Drive, Akhada)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
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
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", borderTop: "1px solid var(--border-subtle)", paddingTop: 14 }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-dim)", fontWeight: 600, marginRight: 6 }}>Discipline:</span>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
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
                  transition: "all var(--transition-fast)",
                }}
              >
                {cat === "Yoga" ? "🧘 Yoga" : cat === "Strength" ? "🏋️ Strength & Akhada" : cat === "Walking" ? "🚶 Walking / Shatapawali" : cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filtered stats summary pill bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem", color: "var(--text-muted)", padding: "0 4px" }}>
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
                  transition: "transform var(--transition-normal), box-shadow var(--transition-normal)",
                }}
              >
                <div>
                  {/* Top Bar: Category & Date */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <div className={`badge badge-${w.category.toLowerCase()}`}>
                      {w.category}
                    </div>
                    <span style={{ fontSize: "0.775rem", color: "var(--text-dim)" }}>
                      {dateDisplay}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 style={{ fontSize: "1.05rem", margin: "0 0 12px 0", lineHeight: 1.35 }}>
                    {w.workout_name}
                  </h3>

                  {/* Metrics Cards */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div
                      style={{
                        padding: "10px 12px",
                        borderRadius: 10,
                        background: "rgba(255, 255, 255, 0.03)",
                        border: "1px solid rgba(255, 255, 255, 0.05)",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <Clock size={16} color="var(--emerald-primary)" />
                      <div>
                        <div style={{ fontSize: "0.7rem", color: "var(--text-dim)", textTransform: "uppercase" }}>Duration</div>
                        <div style={{ fontSize: "0.95rem", fontWeight: 700 }}>{w.duration} min</div>
                      </div>
                    </div>

                    <div
                      style={{
                        padding: "10px 12px",
                        borderRadius: 10,
                        background: "rgba(255, 255, 255, 0.03)",
                        border: "1px solid rgba(255, 255, 255, 0.05)",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <Flame size={16} color="#f97316" />
                      <div>
                        <div style={{ fontSize: "0.7rem", color: "var(--text-dim)", textTransform: "uppercase" }}>Burned</div>
                        <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#fb923c" }}>
                          {Math.round(w.calories_burned)} kcal
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, borderTop: "1px solid var(--border-subtle)", paddingTop: 14 }}>
                  <button
                    onClick={() => onEditWorkout(w)}
                    className="btn btn-secondary btn-sm"
                    title="Edit session details"
                  >
                    <Edit3 size={14} /> Edit
                  </button>
                  <button
                    onClick={() => setDeleteTargetId(w.id)}
                    className="btn btn-danger btn-sm"
                    title="Delete session"
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
          <div className="modal-box" style={{ maxWidth: 420, padding: 26 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: "1.2rem", margin: "0 0 10px 0" }}>Delete Workout Session?</h3>
            <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", margin: "0 0 20px 0" }}>
              Are you sure you want to remove this workout? Your daily progress table and streak will automatically be recalculated.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={() => setDeleteTargetId(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={() => handleDeleteConfirm(deleteTargetId)} className="btn btn-danger">
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
