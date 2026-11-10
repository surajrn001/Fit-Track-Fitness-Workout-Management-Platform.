import React, { useState } from "react";
import { 
  Search, 
  Dumbbell, 
  Clock, 
  Flame, 
  Plus, 
  Calendar, 
  Zap, 
  Activity, 
  Sparkles,
  Layers,
  X
} from "lucide-react";

export default function ExerciseLibraryPage({ 
  exercises = [], 
  onSelectExerciseToLog, 
  onSelectExerciseToSchedule 
}) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["All", "Cardio", "Strength", "Yoga"];
  const difficulties = ["All", "Beginner", "Intermediate", "Advanced"];

  // Compute category counts
  const categoryCounts = {
    All: exercises.length,
    Cardio: exercises.filter((e) => e.category.toLowerCase() === "cardio").length,
    Strength: exercises.filter((e) => e.category.toLowerCase() === "strength").length,
    Yoga: exercises.filter((e) => e.category.toLowerCase() === "yoga").length,
  };

  const filteredExercises = exercises.filter((ex) => {
    const matchCat = selectedCategory === "All" || ex.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchDiff = selectedDifficulty === "All" || (ex.difficulty && ex.difficulty.toLowerCase() === selectedDifficulty.toLowerCase());
    const matchSearch = !searchQuery || 
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (ex.description && ex.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchDiff && matchSearch;
  });

  const getDifficultyColor = (diff) => {
    switch (diff?.toLowerCase()) {
      case "beginner": return { bg: "rgba(16, 185, 129, 0.15)", text: "#34d399", border: "rgba(16, 185, 129, 0.3)" };
      case "advanced": return { bg: "rgba(239, 68, 68, 0.15)", text: "#f87171", border: "rgba(239, 68, 68, 0.3)" };
      default: return { bg: "rgba(245, 158, 11, 0.15)", text: "#fbbf24", border: "rgba(245, 158, 11, 0.3)" };
    }
  };

  const getCategoryBadgeClass = (cat) => {
    switch (cat?.toLowerCase()) {
      case "cardio": return "badge-cardio";
      case "strength": return "badge-strength";
      case "yoga": return "badge-yoga";
      default: return "badge-hiit";
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Header */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--emerald-primary)", fontWeight: 700 }}>
            Module 8 • Predefined Exercise Library
          </span>
        </div>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, margin: 0, fontFamily: "var(--font-display)" }}>
          Exercise <span className="text-gradient">Library</span>
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginTop: 4 }}>
          Discover predefined workouts, strength drills, and yogic flows. Log directly into your activity history or schedule into your training calendar.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card" style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
          {/* Category Pills with Dynamic Counts */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={selectedCategory === cat ? "btn-primary" : "btn-secondary"}
                style={{
                  padding: "8px 16px",
                  fontSize: "0.85rem",
                  borderRadius: 10,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span>
                  {cat === "All" && "🌐 "}
                  {cat === "Cardio" && "🏃 "}
                  {cat === "Strength" && "🏋️ "}
                  {cat === "Yoga" && "🧘 "}
                  {cat}
                </span>
                <span
                  style={{
                    fontSize: "0.725rem",
                    padding: "1px 6px",
                    borderRadius: 6,
                    background: selectedCategory === cat ? "rgba(0, 0, 0, 0.25)" : "rgba(255, 255, 255, 0.1)",
                    color: selectedCategory === cat ? "#042f2e" : "var(--text-muted)",
                    fontWeight: 800,
                  }}
                >
                  {categoryCounts[cat] ?? 0}
                </span>
              </button>
            ))}
          </div>

          {/* Search input with Clear Button */}
          <div style={{ position: "relative", minWidth: 260, flex: "1 1 260px", maxWidth: 420 }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search exercises (e.g. Baithak, Surya, Run)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: 40, paddingRight: searchQuery ? 36 : 14 }}
            />
            <Search size={18} style={{ position: "absolute", left: 14, top: 12, color: "var(--text-dim)" }} />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{
                  position: "absolute",
                  right: 12,
                  top: 10,
                  background: "transparent",
                  border: "none",
                  color: "var(--text-dim)",
                  cursor: "pointer",
                  padding: 2,
                }}
                title="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Sub-filter row: Difficulty levels */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, borderTop: "1px solid var(--border-subtle)", paddingTop: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-dim)", fontWeight: 600 }}>Difficulty:</span>
          {difficulties.map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className="btn-secondary"
              style={{
                padding: "4px 10px",
                fontSize: "0.75rem",
                borderRadius: 6,
                background: selectedDifficulty === diff ? "rgba(16, 185, 129, 0.2)" : undefined,
                color: selectedDifficulty === diff ? "var(--emerald-primary)" : "var(--text-muted)",
                borderColor: selectedDifficulty === diff ? "var(--emerald-primary)" : undefined,
              }}
            >
              {diff}
            </button>
          ))}
          <span style={{ marginLeft: "auto", fontSize: "0.8rem", color: "var(--text-dim)" }}>
            Found {filteredExercises.length} {filteredExercises.length === 1 ? "exercise" : "exercises"}
          </span>
        </div>
      </div>

      {/* Exercise Cards Grid */}
      {filteredExercises.length === 0 ? (
        <div className="glass-card" style={{ padding: "48px 24px", textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(255, 255, 255, 0.04)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "var(--text-dim)" }}>
            <Dumbbell size={28} />
          </div>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 6 }}>No exercises found matching your criteria</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Try adjusting your search terms or clearing the filters.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
          {filteredExercises.map((exercise) => {
            const diffStyle = getDifficultyColor(exercise.difficulty);
            return (
              <div
                key={exercise.id}
                className="glass-card"
                style={{
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 16,
                  transition: "all var(--transition-normal)",
                }}
              >
                <div>
                  {/* Badges Row */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span className={`badge-pill ${getCategoryBadgeClass(exercise.category)}`}>
                      {exercise.category}
                    </span>

                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: 6,
                        background: diffStyle.bg,
                        color: diffStyle.text,
                        border: `1px solid ${diffStyle.border}`,
                      }}
                    >
                      {exercise.difficulty || "Intermediate"}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 8, color: "var(--text-main)" }}>
                    {exercise.name}
                  </h3>

                  <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 16 }}>
                    {exercise.description}
                  </p>

                  {/* Metrics Row */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 18,
                      padding: "10px 14px",
                      borderRadius: 10,
                      background: "rgba(255, 255, 255, 0.02)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem", color: "var(--text-main)" }}>
                      <Clock size={16} color="var(--emerald-primary)" />
                      <span><strong>{exercise.duration}</strong> mins</span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem", color: "var(--text-main)" }}>
                      <Flame size={16} color="#f97316" />
                      <span>~<strong>{Math.round(exercise.calories_est)}</strong> kcal</span>
                    </div>
                  </div>
                </div>

                {/* Actions: Log as Workout or Schedule */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <button
                    onClick={() => onSelectExerciseToLog(exercise)}
                    className="btn-primary"
                    style={{
                      padding: "8px 12px",
                      fontSize: "0.825rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      cursor: "pointer",
                    }}
                  >
                    <Plus size={15} />
                    Log Workout
                  </button>

                  <button
                    onClick={() => onSelectExerciseToSchedule(exercise)}
                    className="btn-secondary"
                    style={{
                      padding: "8px 12px",
                      fontSize: "0.825rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      cursor: "pointer",
                    }}
                  >
                    <Calendar size={15} />
                    Schedule
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
