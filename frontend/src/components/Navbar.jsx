import React, { useState, useRef, useEffect } from "react";
import {
  Activity,
  Dumbbell,
  Calendar,
  Target,
  BarChart3,
  Plus,
  Bell,
  LogOut,
  Menu,
  X,
  CalendarDays,
  BookOpen,
  TrendingUp,
  Award,
  Flame,
  Utensils,
  Settings,
  Clock,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import NotificationsDropdown from "./NotificationsDropdown";
import { formatElapsedClock } from "./WorkoutTimerModal";

export default function Navbar({
  activeTab,
  setActiveTab,
  onOpenAddWorkout,
  onOpenTimer,
  timerState = { elapsedSeconds: 0, isRunning: false },
  notifications = [],
  unreadCount = 0,
  onMarkRead,
  onMarkAllRead,
  onDeleteNotification,
  currentStreak = 0,
}) {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Activity },
    { id: "workouts", label: "Workouts", icon: Dumbbell },
    { id: "nutrition", label: "Nutrition", icon: Utensils },
    { id: "schedule", label: "Schedule", icon: CalendarDays },
    { id: "exercises", label: "Library", icon: BookOpen },
    { id: "progress", label: "Progress", icon: Calendar },
    { id: "comparison", label: "Comparison", icon: TrendingUp },
    { id: "goals", label: "Goals", icon: Target },
    { id: "badges", label: "Badges", icon: Award },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "settings", label: "Sync & Alerts", icon: Settings },
  ];

  const isTimerActive = timerState.isRunning || timerState.elapsedSeconds > 0;

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(11, 15, 25, 0.9)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      {/* Top Action Tier */}
      <div
        style={{
          maxWidth: 1300,
          margin: "0 auto",
          padding: "0 24px",
          height: 62,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        {/* Brand */}
        <div
          onClick={() => setActiveTab("dashboard")}
          style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", userSelect: "none" }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 11,
              background: "linear-gradient(135deg, #f97316 0%, #10b981 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 18px rgba(249, 115, 22, 0.35)",
            }}
          >
            <Activity size={22} strokeWidth={2.8} color="#fff" />
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
            <span style={{ fontSize: "1.35rem", fontWeight: 800, fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}>
              Fit<span className="text-gradient">Track</span>
            </span>
            <span
              style={{
                fontSize: "0.62rem",
                textTransform: "uppercase",
                fontWeight: 800,
                letterSpacing: "0.1em",
                color: "var(--emerald-primary)",
                padding: "1px 6px",
                borderRadius: 4,
                background: "rgba(16, 185, 129, 0.15)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
              }}
            >
              PRO
            </span>
          </div>
        </div>

        {/* Right Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Live Timer Trigger */}
          <button
            type="button"
            onClick={onOpenTimer}
            className="btn btn-secondary btn-sm"
            style={{
              padding: "6px 12px",
              borderColor: isTimerActive ? "rgba(16, 185, 129, 0.5)" : undefined,
              background: isTimerActive ? "rgba(16, 185, 129, 0.14)" : undefined,
              color: isTimerActive ? "#34d399" : undefined,
              fontFamily: isTimerActive ? "var(--font-mono)" : undefined,
            }}
            title="Live Workout Timer"
          >
            <Clock size={15} />
            <span>{isTimerActive ? formatElapsedClock(timerState.elapsedSeconds) : "Timer"}</span>
          </button>

          {/* Live Streak Pill */}
          <div
            onClick={() => setActiveTab("dashboard")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 11px",
              borderRadius: 10,
              background: "rgba(249, 115, 22, 0.12)",
              border: "1px solid rgba(249, 115, 22, 0.3)",
              color: "#fb923c",
              fontSize: "0.8rem",
              fontWeight: 800,
              cursor: "pointer",
              userSelect: "none",
            }}
            title="Current Workout Streak"
          >
            <Flame size={15} className={currentStreak > 0 ? "flame-active" : ""} />
            <span>{currentStreak}d</span>
          </div>

          {/* Quick Log Workout */}
          <button
            onClick={onOpenAddWorkout}
            className="btn btn-primary btn-sm"
            style={{ display: "none" }}
            id="quick-log-btn"
          >
            <Plus size={15} strokeWidth={2.5} />
            <span>Log</span>
          </button>

          {/* Notifications Bell */}
          <div style={{ position: "relative" }} ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="btn-secondary"
              style={{
                width: 38,
                height: 38,
                padding: 0,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                position: "relative",
              }}
              title="Notifications & Reminders"
            >
              <Bell size={17} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: -4,
                    right: -4,
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: "#ef4444",
                    color: "#fff",
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid var(--bg-primary)",
                  }}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <NotificationsDropdown
                notifications={notifications}
                unreadCount={unreadCount}
                onMarkRead={onMarkRead}
                onMarkAllRead={onMarkAllRead}
                onDelete={onDeleteNotification}
                onOpenLogWorkout={onOpenAddWorkout}
                onOpenNutrition={() => setActiveTab("nutrition")}
                onClose={() => setShowNotifications(false)}
              />
            )}
          </div>

          {/* Account & Sign Out */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "5px 12px",
                borderRadius: 10,
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 7,
                  background: "linear-gradient(135deg, #f97316 0%, #10b981 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                }}
              >
                {user?.username?.charAt(0).toUpperCase() || "A"}
              </div>
              <span style={{ fontSize: "0.82rem", fontWeight: 600, maxWidth: 105, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.username ? user.username.split("_")[0].charAt(0).toUpperCase() + user.username.split("_")[0].slice(1) : "Account"}
              </span>
            </div>

            <button
              onClick={logout}
              className="btn-ghost"
              style={{
                width: 36,
                height: 36,
                padding: 0,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                border: "none",
                color: "var(--text-dim)",
              }}
              title="Sign Out"
              onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-dim)")}
            >
              <LogOut size={17} />
            </button>
          </div>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="btn-ghost mobile-menu-btn"
            style={{ display: "none", padding: 8, borderRadius: 8, cursor: "pointer", border: "none" }}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Desktop Nav Tier */}
      <div
        className="desktop-nav"
        style={{
          display: "none",
          borderTop: "1px solid rgba(255, 255, 255, 0.05)",
          background: "rgba(15, 23, 42, 0.5)",
        }}
      >
        <nav
          style={{
            maxWidth: 1300,
            width: "100%",
            margin: "0 auto",
            padding: "8px 24px",
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexWrap: "wrap",
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.81rem",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  transition: "all var(--transition-fast)",
                  background: isActive ? "var(--grad-emerald)" : "transparent",
                  color: isActive ? "#042f2e" : "var(--text-muted)",
                  boxShadow: isActive ? "0 3px 12px rgba(16, 185, 129, 0.25)" : "none",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.color = "var(--text-muted)";
                }}
              >
                <Icon size={14} strokeWidth={isActive ? 2.5 : 2} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Nav dropdown */}
      {mobileMenuOpen && (
        <div
          style={{
            padding: "16px 24px",
            background: "rgba(15, 23, 42, 0.98)",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            flexDirection: "column",
            gap: 6,
            maxHeight: "75vh",
            overflowY: "auto",
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className="btn"
                style={{
                  justifyContent: "flex-start",
                  background: isActive ? "var(--grad-emerald)" : "transparent",
                  color: isActive ? "#042f2e" : "var(--text-main)",
                }}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
          <button
            onClick={() => {
              onOpenAddWorkout();
              setMobileMenuOpen(false);
            }}
            className="btn btn-primary"
            style={{ marginTop: 8 }}
          >
            <Plus size={16} /> Log Workout
          </button>
        </div>
      )}

      <style>{`
        @media (min-width: 1024px) {
          .desktop-nav { display: block !important; }
          #quick-log-btn { display: inline-flex !important; }
          .mobile-menu-btn { display: none !important; }
        }
        @media (max-width: 1023px) {
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </header>
  );
}
