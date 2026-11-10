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
  Flame
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import NotificationsDropdown from "./NotificationsDropdown";

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  onOpenAddWorkout, 
  notifications = [], 
  unreadCount = 0, 
  onMarkRead, 
  onMarkAllRead, 
  onDeleteNotification,
  currentStreak = 0
}) {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const notifRef = useRef(null);

  // Close notifications dropdown when clicking outside
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
    { id: "schedule", label: "Schedule", icon: CalendarDays },
    { id: "exercises", label: "Library", icon: BookOpen },
    { id: "progress", label: "Progress", icon: Calendar },
    { id: "comparison", label: "Comparison", icon: TrendingUp },
    { id: "goals", label: "Goals", icon: Target },
    { id: "badges", label: "Badges", icon: Award },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(11, 15, 25, 0.88)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <div
        style={{
          maxWidth: 1300,
          margin: "0 auto",
          padding: "0 24px",
          height: 72,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 20,
        }}
      >
        {/* Brand with Indian Flag / Saffron Accent */}
        <div
          onClick={() => setActiveTab("dashboard")}
          style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", userSelect: "none" }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: "linear-gradient(135deg, #f97316 0%, #10b981 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#042f2e",
              boxShadow: "0 0 20px rgba(249, 115, 22, 0.35)",
            }}
          >
            <Activity size={24} strokeWidth={2.8} color="#fff" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
              <span style={{ fontSize: "1.45rem", fontWeight: 800, fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}>
                Fit<span className="text-gradient">Track</span>
              </span>
              <span
                style={{
                  fontSize: "0.65rem",
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
        </div>

        {/* Desktop Nav Links */}
        <nav
          style={{
            display: "none",
            gap: 6,
            background: "rgba(255, 255, 255, 0.03)",
            padding: "4px 6px",
            borderRadius: "var(--radius-full)",
            border: "1px solid var(--border-subtle)",
          }}
          className="desktop-nav"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 16px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  transition: "all var(--transition-fast)",
                  background: isActive ? "var(--grad-emerald)" : "transparent",
                  color: isActive ? "#042f2e" : "var(--text-muted)",
                  boxShadow: isActive ? "0 4px 14px rgba(16, 185, 129, 0.3)" : "none",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.color = "var(--text-muted)";
                }}
              >
                <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Live Streak Pill */}
          <div
            onClick={() => setActiveTab("dashboard")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: 10,
              background: "rgba(249, 115, 22, 0.12)",
              border: "1px solid rgba(249, 115, 22, 0.3)",
              color: "#fb923c",
              fontSize: "0.825rem",
              fontWeight: 800,
              cursor: "pointer",
              userSelect: "none",
            }}
            title="Current Workout Streak"
          >
            <Flame size={16} className={currentStreak > 0 ? "flame-active" : ""} />
            <span>{currentStreak}d Streak</span>
          </div>

          {/* Quick Log Workout */}
          <button
            onClick={onOpenAddWorkout}
            className="btn btn-primary btn-sm"
            style={{ display: "none" }}
            id="quick-log-btn"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>+ Log</span>
          </button>

          {/* Notifications Bell */}
          <div style={{ position: "relative" }} ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="btn-secondary"
              style={{
                width: 40,
                height: 40,
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
              <Bell size={18} />
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
                onClose={() => setShowNotifications(false)}
              />
            )}
          </div>

          {/* User profile & Sign Out */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 14px",
                borderRadius: 10,
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
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
              <span style={{ fontSize: "0.85rem", fontWeight: 600, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.username ? (user.username.split('_')[0].charAt(0).toUpperCase() + user.username.split('_')[0].slice(1)) : "Account"}
              </span>
            </div>

            <button
              onClick={logout}
              className="btn-ghost"
              style={{
                width: 38,
                height: 38,
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
              <LogOut size={18} />
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

      {/* Mobile Nav dropdown */}
      {mobileMenuOpen && (
        <div
          style={{
            padding: "16px 24px",
            background: "rgba(15, 23, 42, 0.98)",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            flexDirection: "column",
            gap: 8,
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
        @media (min-width: 1100px) {
          .desktop-nav { display: flex !important; }
          #quick-log-btn { display: inline-flex !important; }
          .mobile-menu-btn { display: none !important; }
        }
        @media (max-width: 1099px) {
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </header>
  );
}
