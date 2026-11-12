import React from "react";
import { Bell, CheckCheck, Trash2, Trophy, Flame, Clock, Sparkles } from "lucide-react";

function formatTimeAgo(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffSec = Math.floor((now - d) / 1000);

  if (diffSec < 60) return "Just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 172800) return "Yesterday";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function NotificationsDropdown({
  notifications,
  unreadCount,
  onMarkRead,
  onMarkAllRead,
  onDelete,
  onOpenLogWorkout,
  onOpenNutrition,
  onClose,
}) {
  const getIcon = (title) => {
    const t = title.toLowerCase();
    if (t.includes("goal") || t.includes("conquered") || t.includes("completed")) {
      return <Trophy size={16} color="#10b981" />;
    }
    if (t.includes("milestone") || t.includes("80%")) {
      return <Flame size={16} color="#f97316" />;
    }
    return <Clock size={16} color="#06b6d4" />;
  };

  return (
    <div
      className="glass-card"
      style={{
        position: "absolute",
        top: "calc(100% + 12px)",
        right: 0,
        width: 380,
        maxHeight: 480,
        display: "flex",
        flexDirection: "column",
        zIndex: 1100,
        background: "#0f172a",
        borderColor: "rgba(255, 255, 255, 0.12)",
        boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.8)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 18px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Bell size={18} color="var(--emerald-primary)" />
          <h4 style={{ fontSize: "1rem", margin: 0 }}>Notifications</h4>
          {unreadCount > 0 && (
            <span
              style={{
                background: "var(--emerald-primary)",
                color: "#042f2e",
                borderRadius: 12,
                padding: "2px 8px",
                fontSize: "0.725rem",
                fontWeight: 700,
              }}
            >
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            className="btn-ghost"
            style={{
              fontSize: "0.75rem",
              padding: "4px 8px",
              display: "flex",
              alignItems: "center",
              gap: 4,
              cursor: "pointer",
              border: "none",
            }}
          >
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div style={{ overflowY: "auto", flex: 1, padding: "8px 0" }}>
        {notifications.length === 0 ? (
          <div style={{ padding: "32px 20px", textAlign: "center", color: "var(--text-dim)" }}>
            <Sparkles size={32} style={{ margin: "0 auto 8px auto", opacity: 0.4 }} />
            <p style={{ fontSize: "0.9rem", margin: 0 }}>You're all caught up!</p>
            <span style={{ fontSize: "0.775rem" }}>No new notifications at this time.</span>
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => !item.is_read && onMarkRead(item.id)}
              style={{
                padding: "12px 18px",
                display: "flex",
                gap: 12,
                alignItems: "flex-start",
                borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
                background: item.is_read ? "transparent" : "rgba(16, 185, 129, 0.06)",
                cursor: item.is_read ? "default" : "pointer",
                transition: "background 150ms ease",
                position: "relative",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = item.is_read ? "transparent" : "rgba(16, 185, 129, 0.06)")
              }
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "rgba(255, 255, 255, 0.05)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: 2,
                }}
              >
                {getIcon(item.title)}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 3 }}>
                  <span
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: item.is_read ? 600 : 700,
                      color: item.is_read ? "var(--text-main)" : "#fff",
                    }}
                  >
                    {item.title}
                  </span>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-dim)", whiteSpace: "nowrap", marginLeft: 8 }}>
                    {formatTimeAgo(item.created_at)}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: item.is_read ? "var(--text-muted)" : "var(--text-main)",
                    lineHeight: 1.4,
                    margin: 0,
                  }}
                >
                  {item.message}
                </p>

                {item.title.toLowerCase().includes("reminder") && (() => {
                  const isNutritionOrWater =
                    item.title.toLowerCase().includes("meal") ||
                    item.title.toLowerCase().includes("hydration");
                  return (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isNutritionOrWater && onOpenNutrition) {
                          onOpenNutrition();
                        } else if (onOpenLogWorkout) {
                          onOpenLogWorkout();
                        }
                        if (onClose) onClose();
                      }}
                      className="btn btn-primary btn-sm"
                      style={{ marginTop: 8, fontSize: "0.725rem", padding: "3px 8px" }}
                    >
                      {isNutritionOrWater ? "Open Nutrition" : "Log Workout Now"}
                    </button>
                  );
                })()}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.id);
                }}
                className="btn-ghost"
                title="Delete notification"
                style={{
                  padding: 4,
                  color: "var(--text-dim)",
                  opacity: 0.6,
                  cursor: "pointer",
                  border: "none",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-dim)")}
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
