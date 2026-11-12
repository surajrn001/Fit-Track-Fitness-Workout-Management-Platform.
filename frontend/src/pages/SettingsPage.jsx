import React, { useState, useEffect } from "react";
import {
  Link2,
  RefreshCw,
  Bell,
  Footprints,
  Flame,
  Check,
  Clock,
  Droplets,
  Utensils,
} from "lucide-react";

export default function SettingsPage({
  integrations = [],
  reminderSettings = null,
  onConnectIntegration,
  onDisconnectIntegration,
  onSyncIntegration,
  onSaveReminderSettings,
  onCheckReminders,
}) {
  const [customSteps, setCustomSteps] = useState({ google_fit: "7500", apple_health: "8200" });
  const [syncingProvider, setSyncingProvider] = useState(null);

  const [formState, setFormState] = useState({
    workout_reminder_enabled: true,
    workout_reminder_time: "07:00",
    workout_reminder_note: "Time for today's workout session",
    meal_reminder_enabled: true,
    meal_reminder_times: "08:30, 13:00, 20:00",
    water_reminder_enabled: true,
    water_reminder_interval_mins: 90,
    daily_water_goal_ml: 2500,
    daily_calorie_goal: 2200,
  });
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    if (reminderSettings) {
      setFormState({
        workout_reminder_enabled: reminderSettings.workout_reminder_enabled,
        workout_reminder_time: reminderSettings.workout_reminder_time,
        workout_reminder_note: reminderSettings.workout_reminder_note,
        meal_reminder_enabled: reminderSettings.meal_reminder_enabled,
        meal_reminder_times: reminderSettings.meal_reminder_times,
        water_reminder_enabled: reminderSettings.water_reminder_enabled,
        water_reminder_interval_mins: reminderSettings.water_reminder_interval_mins,
        daily_water_goal_ml: reminderSettings.daily_water_goal_ml,
        daily_calorie_goal: reminderSettings.daily_calorie_goal,
      });
    }
  }, [reminderSettings]);

  const handleSync = async (provider) => {
    setSyncingProvider(provider);
    try {
      const stepsNum = Number(customSteps[provider] || 7000);
      await onSyncIntegration(provider, { steps: stepsNum });
    } finally {
      setSyncingProvider(null);
    }
  };

  const handleSubmitSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await onSaveReminderSettings({
        ...formState,
        water_reminder_interval_mins: Number(formState.water_reminder_interval_mins),
        daily_water_goal_ml: Number(formState.daily_water_goal_ml),
        daily_calorie_goal: Number(formState.daily_calorie_goal),
      });
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
      {/* Page Title */}
      <div>
        <h1 style={{ fontSize: "2rem", margin: "0 0 4px 0" }}>Connected Apps & Reminders</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: 0 }}>
          Sync step activity from external health tools and configure daily training, meal, and hydration alerts.
        </p>
      </div>

      {/* Connected Fitness Apps */}
      <div>
        <h2 style={{ fontSize: "1.2rem", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
          <Link2 size={18} color="#34d399" /> Fitness App Integrations
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))", gap: 18 }}>
          {integrations.map((item) => {
            const isConnected = item.is_connected;
            const isSyncing = syncingProvider === item.provider;
            return (
              <div key={item.provider} className="glass-card" style={{ padding: 22 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div>
                    <h3 style={{ fontSize: "1.1rem", margin: "0 0 4px 0" }}>{item.label}</h3>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                      {item.last_synced_at
                        ? `Last synced ${new Date(item.last_synced_at).toLocaleString()}`
                        : "Not synced yet"}
                    </span>
                  </div>
                  <span
                    className="badge"
                    style={{
                      background: isConnected ? "rgba(16, 185, 129, 0.15)" : "rgba(148, 163, 184, 0.12)",
                      color: isConnected ? "#34d399" : "var(--text-muted)",
                      border: `1px solid ${isConnected ? "rgba(16, 185, 129, 0.35)" : "var(--border-subtle)"}`,
                    }}
                  >
                    {isConnected ? "Connected" : "Disconnected"}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 18,
                    padding: 12,
                    borderRadius: "var(--radius-sm)",
                    background: "rgba(255,255,255,0.03)",
                    marginBottom: 16,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Footprints size={16} color="#22d3ee" />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{item.daily_steps.toLocaleString()}</div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>Synced Steps</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Flame size={16} color="#fb923c" />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{Math.round(item.synced_calories)} kcal</div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>Active Burn</div>
                    </div>
                  </div>
                </div>

                {isConnected ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        type="number"
                        min="100"
                        max="100000"
                        className="form-input"
                        value={customSteps[item.provider] || ""}
                        onChange={(e) =>
                          setCustomSteps((prev) => ({ ...prev, [item.provider]: e.target.value }))
                        }
                        placeholder="Steps count"
                      />
                      <button
                        type="button"
                        disabled={isSyncing}
                        onClick={() => handleSync(item.provider)}
                        className="btn btn-primary btn-sm"
                        style={{ whiteSpace: "nowrap" }}
                      >
                        <RefreshCw size={14} /> {isSyncing ? "Syncing..." : "Sync Steps"}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => onDisconnectIntegration(item.provider)}
                      className="btn btn-secondary btn-sm"
                    >
                      Disconnect {item.label}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => onConnectIntegration(item.provider)}
                    className="btn btn-primary"
                    style={{ width: "100%" }}
                  >
                    Connect {item.label}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* In-App Reminders & Targets */}
      <div className="glass-card" style={{ padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Bell size={20} color="#fbbf24" />
            <div>
              <h2 style={{ fontSize: "1.2rem", margin: 0 }}>Reminder Settings & Daily Targets</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.84rem", margin: "2px 0 0 0" }}>
                Alerts appear inside your notification bell when daily logs are pending.
              </p>
            </div>
          </div>

          <button type="button" onClick={onCheckReminders} className="btn btn-secondary btn-sm">
            <Bell size={14} /> Check Due Reminders
          </button>
        </div>

        <form onSubmit={handleSubmitSettings} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
            {/* Workout Reminder */}
            <div style={{ padding: 16, borderRadius: "var(--radius-md)", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-subtle)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontWeight: 700 }}>
                  <Clock size={15} color="#34d399" /> Workout Reminder
                </span>
                <input
                  type="checkbox"
                  checked={formState.workout_reminder_enabled}
                  onChange={(e) => setFormState((s) => ({ ...s, workout_reminder_enabled: e.target.checked }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Reminder Time</label>
                <input
                  type="time"
                  className="form-input"
                  value={formState.workout_reminder_time}
                  onChange={(e) => setFormState((s) => ({ ...s, workout_reminder_time: e.target.value }))}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Custom Message</label>
                <input
                  type="text"
                  className="form-input"
                  value={formState.workout_reminder_note}
                  onChange={(e) => setFormState((s) => ({ ...s, workout_reminder_note: e.target.value }))}
                />
              </div>
            </div>

            {/* Meal Reminder */}
            <div style={{ padding: 16, borderRadius: "var(--radius-md)", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-subtle)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontWeight: 700 }}>
                  <Utensils size={15} color="#fbbf24" /> Meal Reminder
                </span>
                <input
                  type="checkbox"
                  checked={formState.meal_reminder_enabled}
                  onChange={(e) => setFormState((s) => ({ ...s, meal_reminder_enabled: e.target.checked }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Meal Windows</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="08:30, 13:00, 20:00"
                  value={formState.meal_reminder_times}
                  onChange={(e) => setFormState((s) => ({ ...s, meal_reminder_times: e.target.value }))}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Daily Calorie Goal (kcal)</label>
                <input
                  type="number"
                  min="800"
                  max="8000"
                  step="50"
                  className="form-input"
                  value={formState.daily_calorie_goal}
                  onChange={(e) => setFormState((s) => ({ ...s, daily_calorie_goal: e.target.value }))}
                />
              </div>
            </div>

            {/* Water Reminder */}
            <div style={{ padding: 16, borderRadius: "var(--radius-md)", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-subtle)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontWeight: 700 }}>
                  <Droplets size={15} color="#22d3ee" /> Hydration Reminder
                </span>
                <input
                  type="checkbox"
                  checked={formState.water_reminder_enabled}
                  onChange={(e) => setFormState((s) => ({ ...s, water_reminder_enabled: e.target.checked }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Interval (minutes)</label>
                <input
                  type="number"
                  min="15"
                  max="480"
                  step="15"
                  className="form-input"
                  value={formState.water_reminder_interval_mins}
                  onChange={(e) => setFormState((s) => ({ ...s, water_reminder_interval_mins: e.target.value }))}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Daily Water Target (ml)</label>
                <input
                  type="number"
                  min="500"
                  max="10000"
                  step="100"
                  className="form-input"
                  value={formState.daily_water_goal_ml}
                  onChange={(e) => setFormState((s) => ({ ...s, daily_water_goal_ml: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button type="submit" disabled={savingSettings} className="btn btn-primary">
              <Check size={16} /> {savingSettings ? "Saving..." : "Save Reminder Preferences"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

