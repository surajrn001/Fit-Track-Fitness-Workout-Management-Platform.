import React, { useState, useEffect, useCallback } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { api } from "./services/api";
import Navbar from "./components/Navbar";
import WorkoutModal from "./components/WorkoutModal";
import GoalModal from "./components/GoalModal";
import PlanModal from "./components/PlanModal";
import LogExerciseModal from "./components/LogExerciseModal";
import BadgePopupModal from "./components/BadgePopupModal";

import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import WorkoutsPage from "./pages/WorkoutsPage";
import SchedulePage from "./pages/SchedulePage";
import ExerciseLibraryPage from "./pages/ExerciseLibraryPage";
import ProgressPage from "./pages/ProgressPage";
import ComparisonPage from "./pages/ComparisonPage";
import GoalsPage from "./pages/GoalsPage";
import BadgesPage from "./pages/BadgesPage";
import AnalyticsPage from "./pages/AnalyticsPage";

import { Activity } from "lucide-react";

function MainApp() {
  const { isAuthenticated, loading: authLoading } = useAuth();

  // Navigation State
  const [activeTab, setActiveTab] = useState("dashboard");

  // Core Data States
  const [workouts, setWorkouts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [dailyRecords, setDailyRecords] = useState([]);
  const [goals, setGoals] = useState([]);
  const [weeklyAnalytics, setWeeklyAnalytics] = useState(null);
  const [monthlyAnalytics, setMonthlyAnalytics] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Phase 2 Data States
  const [plans, setPlans] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [streak, setStreak] = useState(null);
  const [badges, setBadges] = useState([]);
  const [personalizedData, setPersonalizedData] = useState(null);
  const [weeklyComp, setWeeklyComp] = useState(null);
  const [monthlyComp, setMonthlyComp] = useState(null);

  const [loadingData, setLoadingData] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  // Modal States
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const [isLogExerciseModalOpen, setIsLogExerciseModalOpen] = useState(false);
  const [selectedExerciseForModal, setSelectedExerciseForModal] = useState(null);

  const [isBadgePopupOpen, setIsBadgePopupOpen] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(null);

  // Helper feedback toast
  const showFeedback = (text, type = "success") => {
    setFeedbackMessage({ text, type });
    setTimeout(() => setFeedbackMessage(null), 4500);
  };

  // Fetch all Phase 1 & Phase 2 datasets
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
        plansData,
        exercisesData,
        streakData,
        badgesData,
        personalizedRes,
        weeklyCompRes,
        monthlyCompRes,
      ] = await Promise.all([
        api.getWorkouts().catch(() => []),
        api.getSummary().catch(() => null),
        api.getDailyProgress(30).catch(() => []),
        api.getGoals().catch(() => []),
        api.getWeeklyAnalytics().catch(() => null),
        api.getMonthlyAnalytics().catch(() => null),
        api.getNotifications().catch(() => []),
        api.getWorkoutPlans().catch(() => []),
        api.getExercises().catch(() => []),
        api.getStreak().catch(() => null),
        api.getBadges().catch(() => []),
        api.getPersonalizedDashboard().catch(() => null),
        api.getWeeklyComparison().catch(() => null),
        api.getMonthlyComparison().catch(() => null),
      ]);

      setWorkouts(workoutsData || []);
      setSummary(summaryData || null);
      setDailyRecords(recordsData || []);
      setGoals(goalsData || []);
      setWeeklyAnalytics(weeklyData || null);
      setMonthlyAnalytics(monthlyData || null);
      setNotifications(notifsData || []);
      setPlans(plansData || []);
      setExercises(exercisesData || []);
      setStreak(streakData || null);
      setBadges(badgesData || []);
      setPersonalizedData(personalizedRes || null);
      setWeeklyComp(weeklyCompRes || null);
      setMonthlyComp(monthlyCompRes || null);
    } catch (err) {
      console.error("Error loading FitTrack data:", err);
    } finally {
      setLoadingData(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Periodic notification & reminders refresh
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

  // Workout Plans Handlers (Module 7)
  const handleSavePlan = async (planPayload) => {
    if (editingPlan) {
      await api.updateWorkoutPlan(editingPlan.id, planPayload);
      showFeedback("Scheduled workout updated successfully!");
    } else {
      await api.createWorkoutPlan(planPayload);
      showFeedback("Workout successfully scheduled in your calendar! 📅");
    }
    setEditingPlan(null);
    fetchAllData();
  };

  const handleDeletePlan = async (id) => {
    try {
      await api.deleteWorkoutPlan(id);
      showFeedback("Workout plan removed from schedule.");
      fetchAllData();
    } catch (err) {
      alert("Failed to delete plan: " + err.message);
    }
  };

  const handleCompletePlan = async (id) => {
    try {
      await api.completeWorkoutPlan(id);
      showFeedback("Shabaash! Scheduled workout completed and logged into workout history! 🔥");
      fetchAllData();
    } catch (err) {
      alert("Failed to complete workout plan: " + err.message);
    }
  };

  // Exercise Library Handlers (Module 8)
  const handleLogExercise = async (exerciseId, payload) => {
    await api.logExercise(exerciseId, payload);
    showFeedback("Exercise logged into workouts! Calories & daily streak updated. 💪");
    fetchAllData();
  };

  const handleScheduleExercise = async (exerciseId, payload) => {
    await api.scheduleExercise(exerciseId, payload);
    showFeedback("Exercise successfully scheduled in calendar planner! 📅");
    fetchAllData();
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

  // Badges Handler (Module 11)
  const handleOpenBadgePopup = (badge) => {
    setSelectedBadge(badge);
    setIsBadgePopupOpen(true);
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <div style={{ width: 50, height: 50, borderRadius: 14, background: "var(--grad-emerald)", display: "flex", alignItems: "center", justifyContent: "center", color: "#042f2e" }} className="pulse-animation">
          <Activity size={28} />
        </div>
        <span style={{ fontSize: "0.95rem", color: "var(--text-muted)", letterSpacing: "0.05em" }}>INITIALIZING FITTRACK PHASE 2...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const todayStr = new Date().toISOString().split("T")[0];
  const todayWorkouts = workouts.filter((w) => w.workout_date === todayStr);
  const currentStreakDays = streak?.current_streak ?? summary?.current_streak ?? 0;

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
        currentStreak={currentStreakDays}
      />

      {/* Main Body Content */}
      <main style={{ flex: 1, maxWidth: 1300, width: "100%", margin: "0 auto", padding: "30px 24px 60px 24px" }}>
        {/* Module 12: Personalized Dashboard */}
        {activeTab === "dashboard" && (
          <DashboardPage
            summary={summary}
            streak={streak}
            todayWorkouts={todayWorkouts}
            activeGoals={goals.filter((g) => !g.is_completed)}
            upcomingPlans={plans.filter((p) => !p.is_completed && p.scheduled_date >= todayStr)}
            recentBadges={badges.filter((b) => b.is_unlocked)}
            weeklyAnalytics={weeklyAnalytics}
            personalizedData={personalizedData}
            onOpenAddWorkout={() => {
              setEditingWorkout(null);
              setIsWorkoutModalOpen(true);
            }}
            onOpenAddPlan={() => {
              setEditingPlan(null);
              setIsPlanModalOpen(true);
            }}
            onNavigateTab={setActiveTab}
            onDeleteWorkout={handleDeleteWorkout}
            onEditWorkout={(w) => {
              setEditingWorkout(w);
              setIsWorkoutModalOpen(true);
            }}
            onCompletePlan={handleCompletePlan}
            onOpenBadgePopup={handleOpenBadgePopup}
          />
        )}

        {/* Module 2: Workouts */}
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

        {/* Module 7: Workout Plans & Scheduling */}
        {activeTab === "schedule" && (
          <SchedulePage
            plans={plans}
            onOpenAddPlan={() => {
              setEditingPlan(null);
              setIsPlanModalOpen(true);
            }}
            onEditPlan={(plan) => {
              setEditingPlan(plan);
              setIsPlanModalOpen(true);
            }}
            onDeletePlan={handleDeletePlan}
            onCompletePlan={handleCompletePlan}
          />
        )}

        {/* Module 8: Exercise Library */}
        {activeTab === "exercises" && (
          <ExerciseLibraryPage
            exercises={exercises}
            onSelectExerciseToLog={(ex) => {
              setSelectedExerciseForModal(ex);
              setIsLogExerciseModalOpen(true);
            }}
            onSelectExerciseToSchedule={(ex) => {
              setSelectedExerciseForModal(ex);
              setIsLogExerciseModalOpen(true);
            }}
          />
        )}

        {/* Module 3: Daily Progress */}
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

        {/* Module 9: Progress Comparison */}
        {activeTab === "comparison" && (
          <ComparisonPage
            initialWeeklyData={weeklyComp}
            initialMonthlyData={monthlyComp}
          />
        )}

        {/* Module 4: Fitness Goals */}
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

        {/* Module 11: Achievement Badges */}
        {activeTab === "badges" && (
          <BadgesPage
            badges={badges}
            onOpenBadgePopup={handleOpenBadgePopup}
          />
        )}

        {/* Module 5: Analytics & Reports */}
        {activeTab === "analytics" && (
          <AnalyticsPage
            weeklyData={weeklyAnalytics}
            monthlyData={monthlyAnalytics}
          />
        )}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border-subtle)", padding: "20px 24px", textAlign: "center", color: "var(--text-dim)", fontSize: "0.825rem" }}>
        FitTrack Bharat 🇮🇳 – Phase 2 Advanced Fitness & Workout Management Platform • Made with ❤️ for Indian Fitness Athletes • FastAPI & React
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

      <PlanModal
        isOpen={isPlanModalOpen}
        onClose={() => {
          setIsPlanModalOpen(false);
          setEditingPlan(null);
        }}
        onSave={handleSavePlan}
        initialData={editingPlan}
      />

      <LogExerciseModal
        isOpen={isLogExerciseModalOpen}
        onClose={() => {
          setIsLogExerciseModalOpen(false);
          setSelectedExerciseForModal(null);
        }}
        exercise={selectedExerciseForModal}
        onLog={handleLogExercise}
        onSchedule={handleScheduleExercise}
      />

      <BadgePopupModal
        isOpen={isBadgePopupOpen}
        onClose={() => {
          setIsBadgePopupOpen(false);
          setSelectedBadge(null);
        }}
        badge={selectedBadge}
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
