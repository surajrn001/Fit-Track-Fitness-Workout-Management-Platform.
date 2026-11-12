import React, { useState } from "react";
import {
  Utensils,
  Droplets,
  Plus,
  Trash2,
  Flame,
  Edit3,
  Target,
  Activity,
  X,
  Check,
} from "lucide-react";

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snacks"];

const MEAL_PRESETS = [
  { meal_type: "Breakfast", food_name: "Oats & Whey Bowl", calories: 380, protein: 28, carbs: 48, fats: 8 },
  { meal_type: "Lunch", food_name: "Paneer Rice Bowl", calories: 590, protein: 30, carbs: 64, fats: 20 },
  { meal_type: "Snacks", food_name: "Greek Yogurt & Nuts", calories: 220, protein: 16, carbs: 14, fats: 11 },
  { meal_type: "Dinner", food_name: "Grilled Chicken & Greens", calories: 460, protein: 42, carbs: 28, fats: 15 },
];

const MEAL_TYPE_STYLE = {
  Breakfast: { bg: "rgba(245, 158, 11, 0.14)", color: "#fbbf24" },
  Lunch: { bg: "rgba(16, 185, 129, 0.14)", color: "#34d399" },
  Dinner: { bg: "rgba(99, 102, 241, 0.15)", color: "#818cf8" },
  Snacks: { bg: "rgba(6, 182, 212, 0.15)", color: "#22d3ee" },
};

export default function NutritionPage({
  selectedDate,
  onChangeDate,
  meals = [],
  nutritionSummary = null,
  waterSummary = null,
  onCreateMeal,
  onUpdateMeal,
  onDeleteMeal,
  onLogWater,
  onDeleteWaterLog,
  onUpdateWaterGoal,
}) {
  const [mealType, setMealType] = useState("Breakfast");
  const [foodName, setFoodName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fats, setFats] = useState("");
  const [editingMealId, setEditingMealId] = useState(null);
  const [submittingMeal, setSubmittingMeal] = useState(false);

  const [customWaterMl, setCustomWaterMl] = useState("300");
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInputMl, setGoalInputMl] = useState(String(waterSummary?.daily_goal_ml || 2500));

  const calorieGoal = nutritionSummary?.calorie_goal || 2200;
  const totalEaten = nutritionSummary?.total_calories || 0;
  const burned = nutritionSummary?.calories_burned || 0;
  const netCalories = nutritionSummary?.net_calories || 0;
  const caloriePct = Math.min(100, Math.round((totalEaten / Math.max(1, calorieGoal)) * 100));

  const waterMl = waterSummary?.total_ml || 0;
  const waterGoalMl = waterSummary?.daily_goal_ml || 2500;
  const litersConsumed = waterSummary?.liters_consumed ?? 0;
  const goalLiters = waterSummary?.goal_liters ?? 2.5;
  const waterPct = waterSummary?.progress_percentage ?? 0;
  const waterLogs = waterSummary?.logs || [];

  const totalMacros =
    (nutritionSummary?.total_protein || 0) +
    (nutritionSummary?.total_carbs || 0) +
    (nutritionSummary?.total_fats || 0);

  const resetMealForm = () => {
    setFoodName("");
    setCalories("");
    setProtein("");
    setCarbs("");
    setFats("");
    setEditingMealId(null);
  };

  const applyPreset = (preset) => {
    setMealType(preset.meal_type);
    setFoodName(preset.food_name);
    setCalories(String(preset.calories));
    setProtein(String(preset.protein));
    setCarbs(String(preset.carbs));
    setFats(String(preset.fats));
    setEditingMealId(null);
  };

  const startEditMeal = (meal) => {
    setEditingMealId(meal.id);
    setMealType(meal.meal_type);
    setFoodName(meal.food_name);
    setCalories(String(meal.calories));
    setProtein(String(meal.protein));
    setCarbs(String(meal.carbs));
    setFats(String(meal.fats));
  };

  const handleMealSubmit = async (e) => {
    e.preventDefault();
    if (!foodName.trim() || calories === "") return;
    setSubmittingMeal(true);
    try {
      const payload = {
        meal_type: mealType,
        food_name: foodName.trim(),
        calories: Number(calories),
        protein: Number(protein || 0),
        carbs: Number(carbs || 0),
        fats: Number(fats || 0),
        meal_date: selectedDate,
      };
      if (editingMealId) {
        await onUpdateMeal(editingMealId, payload);
      } else {
        await onCreateMeal(payload);
      }
      resetMealForm();
    } finally {
      setSubmittingMeal(false);
    }
  };

  const handleSaveWaterGoal = async (e) => {
    e.preventDefault();
    const parsed = Number(goalInputMl);
    if (!parsed || parsed < 500) return;
    await onUpdateWaterGoal(parsed);
    setEditingGoal(false);
  };

  const handleQuickWater = async (amountMl) => {
    if (!amountMl || amountMl <= 0) return;
    await onLogWater({ quantity: Number(amountMl), date: selectedDate });
  };

  const weeklyNutrition = nutritionSummary?.weekly_trend || [];
  const maxCalTrend = Math.max(500, ...weeklyNutrition.map((d) => Math.max(d.calories_in, d.calories_burned)));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: "2rem", margin: "0 0 4px 0" }}>Nutrition & Hydration</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: 0 }}>
            Log daily meals, monitor macro intake against calories burned, and track water consumption.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <label className="form-label" style={{ margin: 0, fontSize: "0.82rem" }}>Date:</label>
          <input
            type="date"
            className="form-input"
            value={selectedDate}
            onChange={(e) => onChangeDate(e.target.value)}
            style={{ width: "auto", padding: "8px 12px" }}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 16 }}>
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ color: "var(--text-muted)", fontSize: "0.82rem", fontWeight: 600 }}>Calories Consumed</span>
            <Utensils size={18} color="#fbbf24" />
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800 }}>
            {Math.round(totalEaten)} <span style={{ fontSize: "0.9rem", color: "var(--text-dim)", fontWeight: 500 }}>/ {calorieGoal} kcal</span>
          </div>
          <div style={{ marginTop: 10, height: 7, borderRadius: 99, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
            <div style={{ width: `${caloriePct}%`, height: "100%", background: totalEaten > calorieGoal ? "#f97316" : "var(--grad-emerald)", transition: "width 0.3s ease" }} />
          </div>
        </div>

        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ color: "var(--text-muted)", fontSize: "0.82rem", fontWeight: 600 }}>Net Energy Balance</span>
            <Flame size={18} color="#f97316" />
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800 }}>
            {Math.round(netCalories)} <span style={{ fontSize: "0.9rem", color: "var(--text-dim)", fontWeight: 500 }}>kcal net</span>
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 6 }}>
            {Math.round(burned)} kcal burned across workouts
          </div>
        </div>

        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ color: "var(--text-muted)", fontSize: "0.82rem", fontWeight: 600 }}>Macros Breakdown</span>
            <Activity size={18} color="#34d399" />
          </div>
          <div style={{ display: "flex", gap: 14, marginTop: 4 }}>
            <div>
              <div style={{ fontSize: "1.15rem", fontWeight: 700, color: "#34d399" }}>{Math.round(nutritionSummary?.total_protein || 0)}g</div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>Protein</div>
            </div>
            <div>
              <div style={{ fontSize: "1.15rem", fontWeight: 700, color: "#60a5fa" }}>{Math.round(nutritionSummary?.total_carbs || 0)}g</div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>Carbs</div>
            </div>
            <div>
              <div style={{ fontSize: "1.15rem", fontWeight: 700, color: "#fbbf24" }}>{Math.round(nutritionSummary?.total_fats || 0)}g</div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>Fats</div>
            </div>
          </div>
          <div style={{ fontSize: "0.76rem", color: "var(--text-dim)", marginTop: 6 }}>
            {totalMacros > 0 ? `${Math.round(((nutritionSummary?.total_protein || 0) / totalMacros) * 100)}% protein share` : "No macros logged yet"}
          </div>
        </div>

        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ color: "var(--text-muted)", fontSize: "0.82rem", fontWeight: 600 }}>Water Intake</span>
            <Droplets size={18} color="#22d3ee" />
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#22d3ee" }}>
            {litersConsumed.toFixed(2)} <span style={{ fontSize: "0.9rem", color: "var(--text-dim)", fontWeight: 500 }}>/ {goalLiters.toFixed(2)} L</span>
          </div>
          <div style={{ marginTop: 10, height: 7, borderRadius: 99, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
            <div style={{ width: `${waterPct}%`, height: "100%", background: "linear-gradient(90deg, #06b6d4, #3b82f6)", transition: "width 0.3s ease" }} />
          </div>
        </div>
      </div>

      {/* Main Split: Meals vs Water Tracker */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 20, alignItems: "start" }}>
        {/* Left: Add Meal + Meals Log */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="glass-card" style={{ padding: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h2 style={{ fontSize: "1.15rem", margin: 0 }}>{editingMealId ? "Edit Meal Entry" : "Add Meal Entry"}</h2>
              {editingMealId && (
                <button type="button" onClick={resetMealForm} className="btn btn-ghost btn-sm" style={{ padding: "4px 8px" }}>
                  <X size={14} /> Cancel
                </button>
              )}
            </div>

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
              {MEAL_PRESETS.map((p) => (
                <button
                  key={p.food_name}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: "0.75rem", padding: "5px 10px" }}
                >
                  + {p.food_name}
                </button>
              ))}
            </div>

            <form onSubmit={handleMealSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 10 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Meal Type</label>
                  <select className="form-select" value={mealType} onChange={(e) => setMealType(e.target.value)}>
                    {MEAL_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Food Name</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g., Paneer Tikka & Rice"
                    value={foodName}
                    onChange={(e) => setFoodName(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Calories</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    className="form-input"
                    placeholder="kcal"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Protein (g)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    className="form-input"
                    placeholder="0"
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Carbs (g)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    className="form-input"
                    placeholder="0"
                    value={carbs}
                    onChange={(e) => setCarbs(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Fats (g)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    className="form-input"
                    placeholder="0"
                    value={fats}
                    onChange={(e) => setFats(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" disabled={submittingMeal} className="btn btn-primary" style={{ marginTop: 4 }}>
                <Plus size={16} /> {submittingMeal ? "Saving..." : editingMealId ? "Update Meal" : "Save Meal Entry"}
              </button>
            </form>
          </div>

          <div className="glass-card" style={{ padding: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h2 style={{ fontSize: "1.1rem", margin: 0 }}>Logged Meals ({meals.length})</h2>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{selectedDate}</span>
            </div>

            {meals.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", margin: 0 }}>
                No meals logged for this date yet. Use the form above to record your food intake.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {meals.map((meal) => {
                  const badgeStyle = MEAL_TYPE_STYLE[meal.meal_type] || MEAL_TYPE_STYLE.Breakfast;
                  return (
                    <div
                      key={meal.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 12,
                        padding: "12px 14px",
                        borderRadius: "var(--radius-md)",
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid var(--border-subtle)",
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                          <span
                            style={{
                              fontSize: "0.72rem",
                              fontWeight: 700,
                              padding: "2px 8px",
                              borderRadius: 99,
                              background: badgeStyle.bg,
                              color: badgeStyle.color,
                            }}
                          >
                            {meal.meal_type}
                          </span>
                          <span style={{ fontWeight: 600, fontSize: "0.94rem", color: "#fff" }}>{meal.food_name}</span>
                        </div>
                        <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                          {Math.round(meal.calories)} kcal · P: {meal.protein}g · C: {meal.carbs}g · F: {meal.fats}g
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                        <button
                          type="button"
                          onClick={() => startEditMeal(meal)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: "6px 8px" }}
                          title="Edit meal"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteMeal(meal.id)}
                          className="btn btn-danger btn-sm"
                          style={{ padding: "6px 8px" }}
                          title="Delete meal"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Water Intake Tracker & 7-Day Trend */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="glass-card" style={{ padding: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Droplets size={20} color="#22d3ee" />
                <h2 style={{ fontSize: "1.15rem", margin: 0 }}>Water Intake Tracker</h2>
              </div>
              {!editingGoal ? (
                <button
                  type="button"
                  onClick={() => {
                    setGoalInputMl(String(waterGoalMl));
                    setEditingGoal(true);
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: "0.76rem", padding: "5px 10px" }}
                >
                  <Target size={13} /> Goal: {goalLiters.toFixed(1)} L
                </button>
              ) : (
                <form onSubmit={handleSaveWaterGoal} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <input
                    type="number"
                    min="500"
                    max="10000"
                    step="100"
                    className="form-input"
                    value={goalInputMl}
                    onChange={(e) => setGoalInputMl(e.target.value)}
                    style={{ width: 90, padding: "4px 8px", fontSize: "0.8rem" }}
                  />
                  <button type="submit" className="btn btn-primary btn-sm" style={{ padding: "5px 8px" }}>
                    <Check size={13} />
                  </button>
                </form>
              )}
            </div>

            <div
              style={{
                padding: 18,
                borderRadius: "var(--radius-md)",
                background: "rgba(6, 182, 212, 0.08)",
                border: "1px solid rgba(6, 182, 212, 0.25)",
                marginBottom: 16,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                <div>
                  <span style={{ fontSize: "2rem", fontWeight: 800, color: "#22d3ee" }}>{litersConsumed.toFixed(2)} L</span>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginLeft: 8 }}>
                    ({waterMl} / {waterGoalMl} ml)
                  </span>
                </div>
                <span style={{ fontWeight: 700, color: waterPct >= 100 ? "#34d399" : "#22d3ee" }}>{waterPct}%</span>
              </div>
              <div style={{ height: 10, borderRadius: 99, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                <div
                  style={{
                    width: `${waterPct}%`,
                    height: "100%",
                    background: waterPct >= 100 ? "var(--grad-emerald)" : "linear-gradient(90deg, #06b6d4, #3b82f6)",
                    transition: "width 0.35s ease",
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
              {[250, 500, 750].map((ml) => (
                <button
                  key={ml}
                  type="button"
                  onClick={() => handleQuickWater(ml)}
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1, minWidth: 90 }}
                >
                  + {ml} ml
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <input
                type="number"
                min="50"
                max="5000"
                step="50"
                className="form-input"
                placeholder="Custom ml"
                value={customWaterMl}
                onChange={(e) => setCustomWaterMl(e.target.value)}
              />
              <button
                type="button"
                onClick={() => handleQuickWater(customWaterMl)}
                className="btn btn-primary btn-sm"
                style={{ whiteSpace: "nowrap" }}
              >
                <Plus size={15} /> Log Water
              </button>
            </div>

            <h3 style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: 10 }}>
              Today&apos;s Hydration Entries ({waterLogs.length})
            </h3>
            {waterLogs.length === 0 ? (
              <p style={{ fontSize: "0.84rem", color: "var(--text-dim)", margin: 0 }}>No water entries logged for this date.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 190, overflowY: "auto" }}>
                {waterLogs.map((entry) => (
                  <div
                    key={entry.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 12px",
                      borderRadius: "var(--radius-sm)",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    <span style={{ fontSize: "0.86rem", fontWeight: 600, color: "#fff" }}>
                      {entry.quantity} ml <span style={{ color: "var(--text-dim)", fontWeight: 400 }}>({(entry.quantity / 1000).toFixed(2)} L)</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => onDeleteWaterLog(entry.id)}
                      className="btn btn-ghost btn-sm"
                      style={{ color: "#f87171", padding: "4px 6px" }}
                      title="Remove water entry"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 7-Day Calorie Intake vs Burn */}
          <div className="glass-card" style={{ padding: 22 }}>
            <h2 style={{ fontSize: "1.05rem", margin: "0 0 14px 0" }}>7-Day Calorie Intake vs Burn</h2>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 150, paddingTop: 12 }}>
              {weeklyNutrition.map((d) => {
                const inH = Math.max(4, Math.round((d.calories_in / maxCalTrend) * 110));
                const burnH = Math.max(4, Math.round((d.calories_burned / maxCalTrend) * 110));
                return (
                  <div key={d.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 112 }}>
                      <div
                        title={`Intake: ${Math.round(d.calories_in)} kcal`}
                        style={{ width: 10, height: inH, borderRadius: "4px 4px 0 0", background: "#fbbf24" }}
                      />
                      <div
                        title={`Burned: ${Math.round(d.calories_burned)} kcal`}
                        style={{ width: 10, height: burnH, borderRadius: "4px 4px 0 0", background: "#10b981" }}
                      />
                    </div>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{d.label}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 10, fontSize: "0.76rem", color: "var(--text-muted)" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: "#fbbf24" }} /> Calories Eaten
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: "#10b981" }} /> Calories Burned
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

