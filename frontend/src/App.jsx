import React, { useState, useEffect, useCallback } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { api } from "./services/api";
import Navbar from "./components/Navbar";
import WorkoutModal from "./components/WorkoutModal";
import GoalModal from "./components/GoalModal";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import WorkoutsPage from "./pages/WorkoutsPage";
import ProgressPage from "./pages/ProgressPage";
import GoalsPage from "./pages/GoalsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import { Activity } from "lucide-react";

function MainApp() {
  const { isAuthenticated, loading: authLoading } = useAuth();

  // Navigation State
  const [activeTab, setActiveTab] = useState("dashboard");

  // Data States
  const [workouts, setWorkouts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [dailyRecords, setDailyRecords] = useState([]);
  const [goals, setGoals] = useState([]);
  const [weeklyAnalytics, setWeeklyAnalytics] = useState(null);
  const [monthlyAnalytics, setMonthlyAnalytics] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  // Modal States
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  // Helper toast notification
  const showFeedback = (text, type = "success") => {
    setFeedbackMessage({ text, type });
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  // Fetch all primary datasets
  const fetchAllData = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoadingData(true);
      const [
        workoutsData,
        summaryData,
        recordsData,
        goalsData,
        weeklyData,
        monthlyData,
        notifsData,
      ] = await Promise.all([
        api.getWorkouts(),
        api.getSummary(),
        api.getDailyProgress(30),
        api.getGoals(),
        api.getWeeklyAnalytics(),
        api.getMonthlyAnalytics(),
        api.getNotifications(),
      ]);

      setWorkouts(workoutsData || []);
      setSummary(summaryData || null);
      setDailyRecords(recordsData || []);
      setGoals(goalsData || []);
      setWeeklyAnalytics(weeklyData || null);
      setMonthlyAnalytics(monthlyData || null);
      setNotifications(notifsData || []);
    } catch (err) {
      console.error("Error loading FitTrack data:", err);
    } finally {
      setLoadingData(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Periodic notification & reminder refresh (every 30s)
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(async () => {
      try {
        const notifs = await api.getNotifications();
        setNotifications(notifs || []);
      } catch (e) {
        // quiet catch
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Workouts Handlers
  const handleSaveWorkout = async (workoutPayload) => {
    if (editingWorkout) {
      await api.updateWorkout(editingWorkout.id, workoutPayload);
      showFeedback("Workout updated successfully! Daily progress updated.");
    } else {
      await api.addWorkout(workoutPayload);
      showFeedback("Shabaash! Workout logged successfully! Daily streak & calories synced.");
    }
    setEditingWorkout(null);
    fetchAllData();
  };

  const handleDeleteWorkout = async (id) => {
    try {
      await api.deleteWorkout(id);
      showFeedback("Workout deleted.");
      fetchAllData();
    } catch (err) {
      alert("Failed to delete workout: " + err.message);
    }
  };

  // Goals Handlers
  const handleSaveGoal = async (goalPayload) => {
    if (editingGoal) {
      await api.updateGoal(editingGoal.id, goalPayload);
      showFeedback("Goal updated successfully!");
    } else {
      await api.addGoal(goalPayload);
      showFeedback("New fitness goal created!");
    }
    setEditingGoal(null);
    fetchAllData();
  };

  const handleUpdateGoalProgress = async (id, currentValue) => {
    await api.updateGoalProgress(id, currentValue);
    showFeedback("Goal progress updated!");
    fetchAllData();
  };

  const handleDeleteGoal = async (id) => {
    try {
      await api.deleteGoal(id);
      showFeedback("Goal deleted.");
      fetchAllData();
    } catch (err) {
      alert("Failed to delete goal: " + err.message);
    }
  };

  // Progress Handlers
  const handleResyncProgress = async () => {
    const res = await api.resyncProgress();
    fetchAllData();
    return res;
  };

  // Notifications Handlers
  const handleMarkNotificationRead = async (id) => {
    await api.markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const handleMarkAllNotificationsRead = async () => {
    await api.markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const handleDeleteNotification = async (id) => {
    await api.deleteNotification(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <div style={{ width: 50, height: 50, borderRadius: 14, background: "var(--grad-emerald)", display: "flex", alignItems: "center", justifyContent: "center", color: "#042f2e" }} className="pulse-animation">
          <Activity size={28} />
        </div>
        <span style={{ fontSize: "0.95rem", color: "var(--text-muted)", letterSpacing: "0.05em" }}>INITIALIZING FITTRACK...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const todayStr = new Date().toISOString().split("T")[0];
  const todayWorkouts = workouts.filter((w) => w.workout_date === todayStr);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Toast Feedback */}
      {feedbackMessage && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 2000,
            padding: "12px 20px",
            borderRadius: 12,
            background: feedbackMessage.type === "success" ? "#064e3b" : "#7f1d1d",
            color: "#fff",
            border: `1px solid ${feedbackMessage.type === "success" ? "var(--emerald-primary)" : "#ef4444"}`,
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.6)",
            fontSize: "0.9rem",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 10,
            animation: "fadeIn 200ms ease",
          }}
        >
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddWorkout={() => {
          setEditingWorkout(null);
          setIsWorkoutModalOpen(true);
        }}
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkRead={handleMarkNotificationRead}
        onMarkAllRead={handleMarkAllNotificationsRead}
        onDeleteNotification={handleDeleteNotification}
      />

      {/* Main Body Content */}
      <main style={{ flex: 1, maxWidth: 1300, width: "100%", margin: "0 auto", padding: "30px 24px 60px 24px" }}>
        {activeTab === "dashboard" && (
          <DashboardPage
            summary={summary}
            todayWorkouts={todayWorkouts}
            activeGoals={goals.filter((g) => !g.is_completed)}
            weeklyAnalytics={weeklyAnalytics}
            onOpenAddWorkout={() => {
              setEditingWorkout(null);
              setIsWorkoutModalOpen(true);
            }}
            onNavigateTab={setActiveTab}
            onDeleteWorkout={handleDeleteWorkout}
            onEditWorkout={(w) => {
              setEditingWorkout(w);
              setIsWorkoutModalOpen(true);
            }}
          />
        )}

        {activeTab === "workouts" && (
          <WorkoutsPage
            workouts={workouts}
            loading={loadingData}
            onOpenAddWorkout={() => {
              setEditingWorkout(null);
              setIsWorkoutModalOpen(true);
            }}
            onEditWorkout={(w) => {
              setEditingWorkout(w);
              setIsWorkoutModalOpen(true);
            }}
            onDeleteWorkout={handleDeleteWorkout}
          />
        )}

        {activeTab === "progress" && (
          <ProgressPage
            dailyRecords={dailyRecords}
            summary={summary}
            onResyncProgress={handleResyncProgress}
            onOpenAddWorkout={() => {
              setEditingWorkout(null);
              setIsWorkoutModalOpen(true);
            }}
          />
        )}

        {activeTab === "goals" && (
          <GoalsPage
            goals={goals}
            onOpenAddGoal={() => {
              setEditingGoal(null);
              setIsGoalModalOpen(true);
            }}
            onEditGoal={(g) => {
              setEditingGoal(g);
              setIsGoalModalOpen(true);
            }}
            onDeleteGoal={handleDeleteGoal}
            onUpdateGoalProgress={handleUpdateGoalProgress}
          />
        )}

        {activeTab === "analytics" && (
          <AnalyticsPage
            weeklyData={weeklyAnalytics}
            monthlyData={monthlyAnalytics}
          />
        )}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border-subtle)", padding: "20px 24px", textAlign: "center", color: "var(--text-dim)", fontSize: "0.825rem" }}>
        FitTrack Bharat 🇮🇳 – Fitness, Workout & Daily Progress Platform • Made with ❤️ for Indian Fitness Athletes • FastAPI & React
      </footer>

      {/* Modals */}
      <WorkoutModal
        isOpen={isWorkoutModalOpen}
        onClose={() => {
          setIsWorkoutModalOpen(false);
          setEditingWorkout(null);
        }}
        onSave={handleSaveWorkout}
        initialData={editingWorkout}
      />

      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => {
          setIsGoalModalOpen(false);
          setEditingGoal(null);
        }}
        onSave={handleSaveGoal}
        initialData={editingGoal}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
