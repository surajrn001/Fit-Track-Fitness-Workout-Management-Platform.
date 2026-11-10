import React, { useState, useEffect, useCallback, useRef } from "react";
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

  // Cached tracking to prevent redundant fetches
  const exercisesLoadedRef = useRef(false);

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
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  // Efficient core data fetcher - targeted and fast
  const fetchCoreData = useCallback(async (silent = false) => {
    if (!isAuthenticated) return;
    try {
      if (!silent) setLoadingData(true);
      const [
        personalizedRes,
        workoutsData,
        goalsData,
        plansData,
        badgesData,
        notifsData,
        streakData,
        summaryData,
      ] = await Promise.all([
        api.getPersonalizedDashboard().catch(() => null),
        api.getWorkouts().catch(() => []),
        api.getGoals().catch(() => []),
        api.getWorkoutPlans().catch(() => []),
        api.getBadges().catch(() => []),
        api.getNotifications().catch(() => []),
        api.getStreak().catch(() => null),
        api.getSummary().catch(() => null),
      ]);

      if (personalizedRes) setPersonalizedData(personalizedRes);
      if (workoutsData) setWorkouts(workoutsData);
      if (goalsData) setGoals(goalsData);
      if (plansData) setPlans(plansData);
      if (badgesData) setBadges(badgesData);
      if (notifsData) setNotifications(notifsData);
      if (streakData) setStreak(streakData);
      if (summaryData) setSummary(summaryData);
    } catch (err) {
      console.error("Error loading core FitTrack data:", err);
    } finally {
      if (!silent) setLoadingData(false);
    }
  }, [isAuthenticated]);

  // Load static exercises catalog once
  const loadExercisesOnce = useCallback(async () => {
    if (exercisesLoadedRef.current || !isAuthenticated) return;
    try {
      const data = await api.getExercises();
      setExercises(data || []);
      exercisesLoadedRef.current = true;
    } catch (e) {
      console.error("Error loading exercises:", e);
    }
  }, [isAuthenticated]);

  // Lazy tab loader to avoid unnecessary network queries
  const handleTabChange = useCallback(async (tab) => {
    setActiveTab(tab);

    if (tab === "exercises" && !exercisesLoadedRef.current) {
      loadExercisesOnce();
    } else if (tab === "progress" && dailyRecords.length === 0) {
      try {
        const records = await api.getDailyProgress(30);
        setDailyRecords(records || []);
      } catch (e) {}
    } else if (tab === "comparison" && (!weeklyComp || !monthlyComp)) {
      try {
        const [w, m] = await Promise.all([
          api.getWeeklyComparison().catch(() => null),
          api.getMonthlyComparison().catch(() => null),
        ]);
        if (w) setWeeklyComp(w);
        if (m) setMonthlyComp(m);
      } catch (e) {}
    } else if (tab === "analytics" && (!weeklyAnalytics || !monthlyAnalytics)) {
      try {
        const [w, m] = await Promise.all([
          api.getWeeklyAnalytics().catch(() => null),
          api.getMonthlyAnalytics().catch(() => null),
        ]);
        if (w) setWeeklyAnalytics(w);
        if (m) setMonthlyAnalytics(m);
      } catch (e) {}
    }
  }, [dailyRecords.length, weeklyComp, monthlyComp, weeklyAnalytics, monthlyAnalytics, loadExercisesOnce]);

  // Initial load
  useEffect(() => {
    if (isAuthenticated) {
      fetchCoreData();
      loadExercisesOnce();
    }
  }, [isAuthenticated, fetchCoreData, loadExercisesOnce]);

  // Periodic notification polling
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(async () => {
      try {
        const notifs = await api.getNotifications();
        setNotifications(notifs || []);
      } catch (e) {}
    }, 45000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // ---------------- ACTION HANDLERS WITH OPTIMISTIC UPDATES ----------------

  // Workouts Handlers
  const handleSaveWorkout = async (workoutPayload) => {
    try {
      if (editingWorkout) {
        await api.updateWorkout(editingWorkout.id, workoutPayload);
        showFeedback("Workout updated successfully!");
      } else {
        await api.addWorkout(workoutPayload);
        showFeedback("Workout logged! Calories & streak synced. 🔥");
      }
      setEditingWorkout(null);
      fetchCoreData(true);
    } catch (err) {
      alert("Error saving workout: " + err.message);
    }
  };

  const handleDeleteWorkout = async (id) => {
    try {
      // Optimistic delete
      setWorkouts((prev) => prev.filter((w) => w.id !== id));
      await api.deleteWorkout(id);
      showFeedback("Workout deleted.");
      fetchCoreData(true);
    } catch (err) {
      alert("Failed to delete workout: " + err.message);
      fetchCoreData(true);
    }
  };

  // Workout Plans Handlers (Module 7)
  const handleSavePlan = async (planPayload) => {
    try {
      if (editingPlan) {
        await api.updateWorkoutPlan(editingPlan.id, planPayload);
        showFeedback("Scheduled workout updated successfully!");
      } else {
        await api.createWorkoutPlan(planPayload);
        showFeedback("Workout scheduled in your calendar! 📅");
      }
      setEditingPlan(null);
      fetchCoreData(true);
    } catch (err) {
      alert("Error saving plan: " + err.message);
    }
  };

  const handleDeletePlan = async (id) => {
    try {
      // Optimistic delete
      setPlans((prev) => prev.filter((p) => p.id !== id));
      await api.deleteWorkoutPlan(id);
      showFeedback("Workout plan removed from schedule.");
      fetchCoreData(true);
    } catch (err) {
      alert("Failed to delete plan: " + err.message);
      fetchCoreData(true);
    }
  };

  const handleCompletePlan = async (id) => {
    try {
      // Optimistic completion mark
      setPlans((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_completed: true } : p))
      );
      await api.completeWorkoutPlan(id);
      showFeedback("Scheduled workout completed and added to history! 💪");
      fetchCoreData(true);
    } catch (err) {
      alert("Failed to complete workout plan: " + err.message);
      fetchCoreData(true);
    }
  };

  // Exercise Library Handlers (Module 8)
  const handleLogExercise = async (exerciseId, payload) => {
    try {
      await api.logExercise(exerciseId, payload);
      showFeedback("Exercise logged! Calories & streak updated. ⚡");
      fetchCoreData(true);
    } catch (err) {
      alert("Failed to log exercise: " + err.message);
    }
  };

  const handleScheduleExercise = async (exerciseId, payload) => {
    try {
      await api.scheduleExercise(exerciseId, payload);
      showFeedback("Exercise scheduled in calendar! 📅");
      fetchCoreData(true);
    } catch (err) {
      alert("Failed to schedule exercise: " + err.message);
    }
  };

  // Goals Handlers (Module 4)
  const handleSaveGoal = async (goalPayload) => {
    try {
      if (editingGoal) {
        await api.updateGoal(editingGoal.id, goalPayload);
        showFeedback("Goal updated successfully!");
      } else {
        await api.addGoal(goalPayload);
        showFeedback("New fitness goal created!");
      }
      setEditingGoal(null);
      fetchCoreData(true);
    } catch (err) {
      alert("Error saving goal: " + err.message);
    }
  };

  const handleUpdateGoalProgress = async (id, currentValue) => {
    try {
      // Optimistic update
      setGoals((prev) =>
        prev.map((g) =>
          g.id === id
            ? {
                ...g,
                current_value: currentValue,
                is_completed: currentValue >= g.target_value,
              }
            : g
        )
      );
      await api.updateGoalProgress(id, currentValue);
      showFeedback("Goal progress updated! 🎯");
      fetchCoreData(true);
    } catch (err) {
      alert("Failed to update goal: " + err.message);
      fetchCoreData(true);
    }
  };

  const handleDeleteGoal = async (id) => {
    try {
      setGoals((prev) => prev.filter((g) => g.id !== id));
      await api.deleteGoal(id);
      showFeedback("Goal deleted.");
      fetchCoreData(true);
    } catch (err) {
      alert("Failed to delete goal: " + err.message);
      fetchCoreData(true);
    }
  };

  // Progress Handlers
  const handleResyncProgress = async () => {
    try {
      const res = await api.resyncProgress();
      const records = await api.getDailyProgress(30);
      setDailyRecords(records || []);
      fetchCoreData(true);
      return res;
    } catch (err) {
      throw err;
    }
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
        setActiveTab={handleTabChange}
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
            onNavigateTab={handleTabChange}
            onDeleteWorkout={handleDeleteWorkout}
            onEditWorkout={(w) => {
              setEditingWorkout(w);
              setIsWorkoutModalOpen(true);
            }}
            onCompletePlan={handleCompletePlan}
            onOpenBadgePopup={handleOpenBadgePopup}
            onUpdateGoalProgress={handleUpdateGoalProgress}
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
        FitTrack – Fitness & Workout Management Platform • FastAPI & React
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
