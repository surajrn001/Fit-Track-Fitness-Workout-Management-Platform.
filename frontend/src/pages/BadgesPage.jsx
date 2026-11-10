import React, { useState } from "react";
import { 
  Award, 
  Trophy, 
  Lock, 
  Unlock, 
  Sparkles, 
  Flame, 
  Footprints, 
  Swords, 
  Crown, 
  Zap, 
  Target, 
  Medal,
  Calendar
} from "lucide-react";

export default function BadgesPage({ badges = [], onOpenBadgePopup }) {
  const [filter, setFilter] = useState("all"); // "all", "unlocked", "locked"

  const unlockedCount = badges.filter((b) => b.is_unlocked).length;
  const totalCount = badges.length;
  const completionPercentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  const filteredBadges = badges.filter((b) => {
    if (filter === "unlocked") return b.is_unlocked;
    if (filter === "locked") return !b.is_unlocked;
    return true;
  });

  const getBadgeIcon = (iconName) => {
    switch (iconName) {
      case "footprints": return "👣";
      case "swords": return "⚔️";
      case "trophy": return "🏆";
      case "crown": return "👑";
      case "flame": return "🔥";
      case "zap": return "⚡";
      case "award": return "🎖️";
      case "target": return "🎯";
      case "medal": return "🥇";
      case "sparkles": return "✨";
      default: return "🌟";
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Header */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--emerald-primary)", fontWeight: 700 }}>
            Module 11 • Achievement Badges & Milestones
          </span>
        </div>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, margin: 0, fontFamily: "var(--font-display)" }}>
          Achievement <span className="text-gradient">Badges</span>
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginTop: 4 }}>
          Earn honors, unlock badges, and conquer fitness milestones as you train consistently and build lifelong discipline.
        </p>
      </div>

      {/* Progress Showcase Banner */}
      <div
        className="glass-card"
        style={{
          padding: "24px 28px",
          background: "linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)",
          border: "1px solid rgba(245, 158, 11, 0.3)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 18,
                background: "linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.8rem",
                boxShadow: "0 0 25px rgba(245, 158, 11, 0.4)",
              }}
            >
              🏆
            </div>
            <div>
              <span style={{ fontSize: "0.8rem", color: "#fbbf24", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                FitTrack Hall of Honors
              </span>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 800, margin: "2px 0 0" }}>
                {unlockedCount} of {totalCount} Badges Conquered ({completionPercentage}%)
              </h2>
            </div>
          </div>

          {/* Filter Pills */}
          <div style={{ display: "flex", background: "rgba(15, 23, 42, 0.6)", padding: 4, borderRadius: 10, border: "1px solid var(--border-subtle)" }}>
            <button
              onClick={() => setFilter("all")}
              style={{
                padding: "6px 14px",
                borderRadius: 8,
                border: "none",
                background: filter === "all" ? "var(--emerald-primary)" : "transparent",
                color: filter === "all" ? "#042f2e" : "var(--text-muted)",
                fontWeight: 700,
                fontSize: "0.85rem",
                cursor: "pointer",
              }}
            >
              All Badges ({totalCount})
            </button>
            <button
              onClick={() => setFilter("unlocked")}
              style={{
                padding: "6px 14px",
                borderRadius: 8,
                border: "none",
                background: filter === "unlocked" ? "var(--emerald-primary)" : "transparent",
                color: filter === "unlocked" ? "#042f2e" : "var(--text-muted)",
                fontWeight: 700,
                fontSize: "0.85rem",
                cursor: "pointer",
              }}
            >
              Unlocked ({unlockedCount})
            </button>
            <button
              onClick={() => setFilter("locked")}
              style={{
                padding: "6px 14px",
                borderRadius: 8,
                border: "none",
                background: filter === "locked" ? "var(--emerald-primary)" : "transparent",
                color: filter === "locked" ? "#042f2e" : "var(--text-muted)",
                fontWeight: 700,
                fontSize: "0.85rem",
                cursor: "pointer",
              }}
            >
              Locked ({totalCount - unlockedCount})
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ marginTop: 20 }}>
          <div style={{ height: 10, background: "rgba(255, 255, 255, 0.08)", borderRadius: 9999, overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${completionPercentage}%`,
                background: "linear-gradient(90deg, #f59e0b 0%, #10b981 100%)",
                borderRadius: 9999,
                transition: "width 600ms ease",
              }}
            />
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 18 }}>
        {filteredBadges.map((badge) => {
          return (
            <div
              key={badge.id}
              className={`badge-card ${badge.is_unlocked ? "unlocked" : "locked"}`}
              onClick={() => onOpenBadgePopup(badge)}
              style={{ cursor: "pointer" }}
            >
              {/* Unlock Indicator */}
              <div style={{ position: "absolute", top: 14, right: 14 }}>
                {badge.is_unlocked ? (
                  <span style={{ color: "#fbbf24", display: "flex", alignItems: "center", gap: 4, fontSize: "0.75rem", fontWeight: 700 }}>
                    <Sparkles size={14} /> Unlocked
                  </span>
                ) : (
                  <span style={{ color: "var(--text-dim)", display: "flex", alignItems: "center", gap: 4, fontSize: "0.75rem" }}>
                    <Lock size={14} /> Locked
                  </span>
                )}
              </div>

              {/* Icon */}
              <div className={`badge-icon-box ${badge.is_unlocked ? "unlocked" : "locked"}`}>
                {getBadgeIcon(badge.icon)}
              </div>

              {/* Title & Description */}
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 4, color: badge.is_unlocked ? "var(--text-main)" : "var(--text-muted)" }}>
                  {badge.name}
                </h3>
                <p style={{ fontSize: "0.825rem", color: "var(--text-dim)", lineHeight: 1.5 }}>
                  {badge.description}
                </p>
              </div>

              {/* Earned timestamp or Category */}
              <div style={{ marginTop: "auto", paddingTop: 8, borderTop: "1px solid var(--border-subtle)", width: "100%", fontSize: "0.75rem", color: "var(--text-dim)" }}>
                {badge.is_unlocked && badge.earned_at ? (
                  <span>Unlocked on {new Date(badge.earned_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                ) : (
                  <span>Category: {badge.category.toUpperCase()}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
