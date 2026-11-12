const API_BASE = "http://localhost:8010/api";

function getAuthHeader() {
  const token = localStorage.getItem("fittrack_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeader(),
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    // If token invalid/expired, clear it
    localStorage.removeItem("fittrack_token");
    localStorage.removeItem("fittrack_user");
    window.dispatchEvent(new Event("auth_expired"));
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.detail || "An unexpected error occurred. Please try again.";
    throw new Error(typeof errorMsg === "string" ? errorMsg : JSON.stringify(errorMsg));
  }

  return data;
}

export const api = {
  // Auth
  register: (payload) => request("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload) => request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  getMe: () => request("/auth/me"),

  // Workouts
  getWorkouts: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.category && params.category !== "All") searchParams.append("category", params.category);
    if (params.search) searchParams.append("search", params.search);
    if (params.start_date) searchParams.append("start_date", params.start_date);
    if (params.end_date) searchParams.append("end_date", params.end_date);
    const query = searchParams.toString();
    return request(`/workouts/${query ? `?${query}` : ""}`);
  },
  getCategories: () => request("/workouts/categories"),
  addWorkout: (payload) => request("/workouts/", { method: "POST", body: JSON.stringify(payload) }),
  updateWorkout: (id, payload) => request(`/workouts/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteWorkout: (id) => request(`/workouts/${id}`, { method: "DELETE" }),

  // Daily Progress
  getSummary: () => request("/progress/summary"),
  getDailyProgress: (days = 30) => request(`/progress/daily?days=${days}`),
  getTodayProgress: () => request("/progress/today"),
  resyncProgress: () => request("/progress/sync-all", { method: "POST" }),

  // Goals
  getGoals: () => request("/goals/"),
  addGoal: (payload) => request("/goals/", { method: "POST", body: JSON.stringify(payload) }),
  updateGoal: (id, payload) => request(`/goals/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  updateGoalProgress: (id, currentValue) => request(`/goals/${id}/progress`, { 
    method: "PATCH", 
    body: JSON.stringify({ current_value: currentValue }) 
  }),
  deleteGoal: (id) => request(`/goals/${id}`, { method: "DELETE" }),

  // Analytics
  getWeeklyAnalytics: () => request("/analytics/weekly"),
  getMonthlyAnalytics: () => request("/analytics/monthly"),

  // Notifications
  getNotifications: () => request("/notifications/"),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: "PATCH" }),
  markAllNotificationsRead: () => request("/notifications/read-all", { method: "POST" }),
  deleteNotification: (id) => request(`/notifications/${id}`, { method: "DELETE" }),

  // Phase 2: Streak Tracking (Module 10)
  getStreak: () => request("/streak/"),

  // Phase 2: Achievement Badges (Module 11)
  getBadges: () => request("/badges/"),
  checkBadges: () => request("/badges/check", { method: "POST" }),

  // Phase 2: Workout Plans & Scheduling (Module 7)
  getWorkoutPlans: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.start_date) searchParams.append("start_date", params.start_date);
    if (params.end_date) searchParams.append("end_date", params.end_date);
    if (params.upcoming_only) searchParams.append("upcoming_only", "true");
    const query = searchParams.toString();
    return request(`/plans/${query ? `?${query}` : ""}`);
  },
  createWorkoutPlan: (payload) => request("/plans/", { method: "POST", body: JSON.stringify(payload) }),
  updateWorkoutPlan: (id, payload) => request(`/plans/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteWorkoutPlan: (id) => request(`/plans/${id}`, { method: "DELETE" }),
  completeWorkoutPlan: (id) => request(`/plans/${id}/complete`, { method: "POST" }),

  // Phase 2: Exercise Library (Module 8)
  getExercises: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.category && params.category !== "All") searchParams.append("category", params.category);
    if (params.search) searchParams.append("search", params.search);
    const query = searchParams.toString();
    return request(`/exercises/${query ? `?${query}` : ""}`);
  },
  getExercise: (id) => request(`/exercises/${id}`),
  logExercise: (id, payload = {}) => request(`/exercises/${id}/log`, { method: "POST", body: JSON.stringify(payload) }),
  scheduleExercise: (id, payload) => request(`/exercises/${id}/schedule`, { method: "POST", body: JSON.stringify(payload) }),

  // Phase 2: Progress Comparison (Module 9)
  getWeeklyComparison: () => request("/progress/comparison/weekly"),
  getMonthlyComparison: () => request("/progress/comparison/monthly"),

  // Phase 2: Personalized Dashboard (Module 12)
  getPersonalizedDashboard: () => request("/progress/personalized"),

  // Phase 3: Nutrition & Meals
  getMeals: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.meal_date) searchParams.append("meal_date", params.meal_date);
    if (params.meal_type && params.meal_type !== "All") searchParams.append("meal_type", params.meal_type);
    const query = searchParams.toString();
    return request(`/meals/${query ? `?${query}` : ""}`);
  },
  createMeal: (payload) => request("/meals/", { method: "POST", body: JSON.stringify(payload) }),
  updateMeal: (id, payload) => request(`/meals/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteMeal: (id) => request(`/meals/${id}`, { method: "DELETE" }),
  getNutritionSummary: (targetDate) => request(`/meals/summary${targetDate ? `?target_date=${targetDate}` : ""}`),

  // Phase 3: Water Intake Tracker
  getWaterSummary: (targetDate) => request(`/water/${targetDate ? `?target_date=${targetDate}` : ""}`),
  logWater: (payload) => request("/water/", { method: "POST", body: JSON.stringify(payload) }),
  deleteWaterLog: (id) => request(`/water/${id}`, { method: "DELETE" }),
  updateWaterGoal: (dailyWaterGoalMl) =>
    request("/water/goal", { method: "PUT", body: JSON.stringify({ daily_water_goal_ml: dailyWaterGoalMl }) }),

  // Phase 3: Workout Suggestions
  getWorkoutSuggestions: () => request("/workouts/suggestions"),

  // Phase 3: Third-Party Integrations
  getIntegrations: () => request("/integrations/"),
  connectIntegration: (provider) => request(`/integrations/${provider}/connect`, { method: "POST" }),
  disconnectIntegration: (provider) => request(`/integrations/${provider}/disconnect`, { method: "POST" }),
  syncIntegration: (provider, payload = null) =>
    request(`/integrations/${provider}/sync`, {
      method: "POST",
      ...(payload ? { body: JSON.stringify(payload) } : {}),
    }),

  // Phase 3: In-App Reminders & Settings
  getReminderSettings: () => request("/reminders/settings"),
  updateReminderSettings: (payload) =>
    request("/reminders/settings", { method: "PUT", body: JSON.stringify(payload) }),
  checkDueReminders: () => request("/reminders/check", { method: "POST" }),

  // Phase 3: Advanced Analytics
  getAdvancedAnalytics: (period = "monthly") => request(`/analytics/advanced?period=${period}`),
};

