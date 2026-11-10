import React, { useState } from "react";
import { 
  Calendar as CalendarIcon, 
  Plus, 
  CheckCircle2, 
  Clock, 
  CalendarDays, 
  Trash2, 
  Edit3, 
  Flame, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Filter
} from "lucide-react";

export default function SchedulePage({ 
  plans = [], 
  onOpenAddPlan, 
  onEditPlan, 
  onDeletePlan, 
  onCompletePlan 
}) {
  const [filterMode, setFilterMode] = useState("upcoming"); // "upcoming", "all", "completed", "date"
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [filterBySelectedDateOnly, setFilterBySelectedDateOnly] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];

  // Helper date calculators
  const getTomorrowStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  };

  const getWeekendStr = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = (6 - day + 7) % 7 || 7; // next Saturday
    d.setDate(d.getDate() + diff);
    return d.toISOString().split("T")[0];
  };

  const getNextWeekStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split("T")[0];
  };

  // Filter plans based on view
  const filteredPlans = plans.filter((p) => {
    if (filterBySelectedDateOnly) {
      return p.scheduled_date === selectedDate;
    }
    if (filterMode === "upcoming") return !p.is_completed && p.scheduled_date >= todayStr;
    if (filterMode === "completed") return p.is_completed;
    return true;
  });

  // Generate 14-day rolling mini calendar
  const generateTwoWeeks = () => {
    const days = [];
    const base = new Date();
    // Start 2 days before today
    base.setDate(base.getDate() - 2);

    for (let i = 0; i < 14; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const isoStr = d.toISOString().split("T")[0];
      const count = plans.filter((p) => p.scheduled_date === isoStr).length;
      days.push({
        dateObj: d,
        isoStr,
        dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
        dayNum: d.getDate(),
        monthName: d.toLocaleDateString("en-US", { month: "short" }),
        isToday: isoStr === todayStr,
        planCount: count,
      });
    }
    return days;
  };

  const rollingDays = generateTwoWeeks();

  const handleSelectDay = (iso) => {
    setSelectedDate(iso);
    setFilterBySelectedDateOnly(true);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Header */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--emerald-primary)", fontWeight: 700 }}>
              Training Schedule & Calendar
            </span>
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, margin: 0, fontFamily: "var(--font-display)" }}>
            Workout <span className="text-gradient">Planner & Schedule</span>
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginTop: 4 }}>
            Plan upcoming training sessions in advance, maintain consistency, and track your schedule.
          </p>
        </div>

        <button onClick={onOpenAddPlan} className="btn-primary" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Plus size={18} />
          Schedule Workout
        </button>
      </div>

      {/* 14-Day Calendar Strip */}
      <div className="glass-card" style={{ padding: "20px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <CalendarDays size={18} color="var(--emerald-primary)" />
            <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-main)" }}>
              Interactive 14-Day Calendar Strip
            </span>
            {filterBySelectedDateOnly && (
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "#fb923c",
                  background: "rgba(249, 115, 22, 0.15)",
                  padding: "2px 8px",
                  borderRadius: 6,
                }}
              >
                Filtered by Day
              </span>
            )}
          </div>

          {/* Quick Date Jumper Pills */}
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.775rem", color: "var(--text-dim)" }}>Jump to:</span>
            <button
              onClick={() => handleSelectDay(todayStr)}
              className="btn-secondary"
              style={{
                padding: "3px 8px",
                fontSize: "0.75rem",
                borderRadius: 6,
                background: selectedDate === todayStr && filterBySelectedDateOnly ? "rgba(16, 185, 129, 0.2)" : undefined,
                color: selectedDate === todayStr && filterBySelectedDateOnly ? "var(--emerald-primary)" : undefined,
              }}
            >
              Today
            </button>
            <button
              onClick={() => handleSelectDay(getTomorrowStr())}
              className="btn-secondary"
              style={{ padding: "3px 8px", fontSize: "0.75rem", borderRadius: 6 }}
            >
              Tomorrow
            </button>
            <button
              onClick={() => handleSelectDay(getWeekendStr())}
              className="btn-secondary"
              style={{ padding: "3px 8px", fontSize: "0.75rem", borderRadius: 6 }}
            >
              Weekend
            </button>
            <button
              onClick={() => handleSelectDay(getNextWeekStr())}
              className="btn-secondary"
              style={{ padding: "3px 8px", fontSize: "0.75rem", borderRadius: 6 }}
            >
              +7 Days
            </button>
            {filterBySelectedDateOnly && (
              <button
                onClick={() => setFilterBySelectedDateOnly(false)}
                className="btn-ghost"
                style={{ padding: "3px 8px", fontSize: "0.75rem", color: "var(--text-muted)" }}
              >
                Show All
              </button>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6 }}>
          {rollingDays.map((day) => {
            const isSelected = day.isoStr === selectedDate && filterBySelectedDateOnly;
            return (
              <button
                key={day.isoStr}
                onClick={() => handleSelectDay(day.isoStr)}
                style={{
                  flex: "0 0 calc(100% / 7 - 8px)",
                  minWidth: 76,
                  padding: "12px 6px",
                  borderRadius: 12,
                  border: isSelected
                    ? "2px solid var(--emerald-primary)"
                    : day.isToday
                    ? "1px solid rgba(16, 185, 129, 0.4)"
                    : "1px solid var(--border-subtle)",
                  background: isSelected
                    ? "rgba(16, 185, 129, 0.18)"
                    : day.isToday
                    ? "rgba(16, 185, 129, 0.06)"
                    : "rgba(15, 23, 42, 0.6)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 3,
                  cursor: "pointer",
                  transition: "all var(--transition-fast)",
                }}
                title={`${day.dayName}, ${day.monthName} ${day.dayNum} (${day.planCount} plans)`}
              >
                <span style={{ fontSize: "0.725rem", color: day.isToday ? "var(--emerald-primary)" : "var(--text-dim)", fontWeight: 700 }}>
                  {day.dayName}
                </span>
                <span style={{ fontSize: "1.2rem", fontWeight: 800, color: isSelected ? "var(--emerald-primary)" : "var(--text-main)" }}>
                  {day.dayNum}
                </span>
                <span style={{ fontSize: "0.675rem", color: "var(--text-muted)" }}>
                  {day.monthName}
                </span>

                {day.planCount > 0 && (
                  <span
                    style={{
                      marginTop: 3,
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      background: "rgba(249, 115, 22, 0.2)",
                      border: "1px solid rgba(249, 115, 22, 0.4)",
                      color: "#fb923c",
                      fontSize: "0.65rem",
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {day.planCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Tabs & Quick Summary */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", background: "rgba(15, 23, 42, 0.6)", padding: 4, borderRadius: 10, border: "1px solid var(--border-subtle)" }}>
          <button
            onClick={() => {
              setFilterMode("upcoming");
              setFilterBySelectedDateOnly(false);
            }}
            style={{
              padding: "6px 14px",
              borderRadius: 8,
              border: "none",
              background: filterMode === "upcoming" && !filterBySelectedDateOnly ? "var(--emerald-primary)" : "transparent",
              color: filterMode === "upcoming" && !filterBySelectedDateOnly ? "#042f2e" : "var(--text-muted)",
              fontWeight: 700,
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            Upcoming Plans ({plans.filter((p) => !p.is_completed && p.scheduled_date >= todayStr).length})
          </button>
          <button
            onClick={() => {
              setFilterMode("all");
              setFilterBySelectedDateOnly(false);
            }}
            style={{
              padding: "6px 14px",
              borderRadius: 8,
              border: "none",
              background: filterMode === "all" && !filterBySelectedDateOnly ? "var(--emerald-primary)" : "transparent",
              color: filterMode === "all" && !filterBySelectedDateOnly ? "#042f2e" : "var(--text-muted)",
              fontWeight: 700,
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            All Plans ({plans.length})
          </button>
          <button
            onClick={() => {
              setFilterMode("completed");
              setFilterBySelectedDateOnly(false);
            }}
            style={{
              padding: "6px 14px",
              borderRadius: 8,
              border: "none",
              background: filterMode === "completed" && !filterBySelectedDateOnly ? "var(--emerald-primary)" : "transparent",
              color: filterMode === "completed" && !filterBySelectedDateOnly ? "#042f2e" : "var(--text-muted)",
              fontWeight: 700,
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            Completed ({plans.filter((p) => p.is_completed).length})
          </button>
        </div>

        <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
          Showing: <strong style={{ color: "var(--text-main)" }}>{filteredPlans.length}</strong> {filteredPlans.length === 1 ? "workout" : "workouts"}
        </span>
      </div>

      {/* Plans List Grid */}
      {filteredPlans.length === 0 ? (
        <div className="glass-card" style={{ padding: "48px 24px", textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(255, 255, 255, 0.04)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "var(--text-dim)" }}>
            <CalendarIcon size={28} />
          </div>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 6 }}>
            {filterBySelectedDateOnly ? `No workouts scheduled for ${selectedDate}` : "No scheduled workouts in this view"}
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", maxWidth: 440, margin: "0 auto 20px" }}>
            Planning ahead removes morning friction. Schedule your next workout session today!
          </p>
          <button onClick={onOpenAddPlan} className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <Plus size={16} /> Schedule a Workout Now
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
          {filteredPlans.map((plan) => {
            const isToday = plan.scheduled_date === todayStr;
            const isPast = plan.scheduled_date < todayStr;
            const formattedDate = new Date(plan.scheduled_date).toLocaleDateString("en-IN", {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
            });

            return (
              <div
                key={plan.id}
                className="glass-card"
                style={{
                  padding: "20px 22px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 16,
                  borderLeft: plan.is_completed
                    ? "4px solid #10b981"
                    : isToday
                    ? "4px solid #f97316"
                    : isPast
                    ? "4px solid #64748b"
                    : "4px solid #3b82f6",
                  position: "relative",
                  transition: "all var(--transition-fast)",
                }}
              >
                <div>
                  {/* Status header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          padding: "2px 8px",
                          borderRadius: 6,
                          background: plan.is_completed
                            ? "rgba(16, 185, 129, 0.15)"
                            : isToday
                            ? "rgba(249, 115, 22, 0.2)"
                            : "rgba(59, 130, 246, 0.15)",
                          color: plan.is_completed
                            ? "#34d399"
                            : isToday
                            ? "#fb923c"
                            : "#60a5fa",
                        }}
                      >
                        {plan.is_completed ? "Completed" : isToday ? "Today's Target" : isPast ? "Past Plan" : "Upcoming"}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <button
                        onClick={() => onEditPlan(plan)}
                        className="btn-secondary"
                        style={{ padding: 6, borderRadius: 8, display: "flex" }}
                        title="Edit Plan"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => onDeletePlan(plan.id)}
                        className="btn-secondary"
                        style={{ padding: 6, borderRadius: 8, display: "flex", color: "#fca5a5" }}
                        title="Delete Plan"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: 6, color: "var(--text-main)" }}>
                    {plan.title}
                  </h3>

                  {plan.description && (
                    <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 12 }}>
                      {plan.description}
                    </p>
                  )}

                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8rem", color: "var(--text-dim)" }}>
                    <CalendarIcon size={14} color="var(--emerald-primary)" />
                    <span>{formattedDate}</span>
                  </div>
                </div>

                {/* Bottom Action: Complete & Log into Workouts */}
                {!plan.is_completed && (
                  <button
                    onClick={() => onCompletePlan(plan.id)}
                    className="btn-primary"
                    style={{
                      width: "100%",
                      padding: "8px 14px",
                      fontSize: "0.85rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      background: isToday ? "var(--grad-fire)" : "var(--grad-emerald)",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <CheckCircle2 size={16} />
                    Mark Completed & Log Workout
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
