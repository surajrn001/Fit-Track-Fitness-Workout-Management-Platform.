import React, { useState } from "react";
import { Activity, Dumbbell, ShieldCheck, Flame, ArrowRight, Sparkles, CheckCircle2, Heart } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AuthPage() {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match. Please verify.");
      return;
    }

    try {
      setLoading(true);
      if (isLogin) {
        await login(email, password);
      } else {
        await register(username, email, password);
      }
    } catch (err) {
      setError(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail, demoPass) => {
    try {
      setLoading(true);
      setError("");
      setEmail(demoEmail);
      setPassword(demoPass);
      await login(demoEmail, demoPass);
    } catch (err) {
      setError(err.message || "Demo login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "30px 20px",
        position: "relative",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1040,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 36,
          alignItems: "center",
        }}
      >
        {/* Left: Branding & Cultural Indian Fitness Story */}
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 14px",
              borderRadius: "var(--radius-full)",
              background: "rgba(249, 115, 22, 0.12)",
              border: "1px solid rgba(249, 115, 22, 0.35)",
              color: "#fb923c",
              fontSize: "0.825rem",
              fontWeight: 700,
              marginBottom: 18,
            }}
          >
            <span>🇮🇳</span> Fit India Movement • Workout & Wellness
          </div>

          <h1 style={{ fontSize: "2.8rem", lineHeight: 1.18, fontWeight: 800, marginBottom: 14 }}>
            Empower Your Fitness with <span className="text-gradient">FitTrack Bharat</span>
          </h1>

          <p style={{ fontSize: "1.05rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 26 }}>
            Designed for the Indian fitness journey. Whether you are running at Marine Drive, 
            practicing 108 Surya Namaskars, pumping iron in the akhada, or hitting 10,000 steps with 
            post-dinner Shatapawali — track your energy output with precision.
          </p>

          {/* Core Feature Pillars */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 28 }}>
            {[
              {
                icon: Heart,
                color: "#10b981",
                title: "Yoga, Running, Akhada & Gym",
                desc: "Pre-configured calorie rates for Yogasan, Strength, HIIT, Badminton, and Shatapawali.",
              },
              {
                icon: Flame,
                color: "#f97316",
                title: "Fit India Streaks & Calorie Targets",
                desc: "Set real milestones: Wedding season weight loss, festive calorie burn, and step goals.",
              },
              {
                icon: ShieldCheck,
                color: "#6366f1",
                title: "FastAPI + Secure JWT Authentication",
                desc: "Bcrypt salted password encryption and private data isolation for every athlete.",
              },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid var(--border-subtle)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: f.color,
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={19} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: "0.95rem", marginBottom: 2, fontWeight: 700 }}>{f.title}</h4>
                    <p style={{ fontSize: "0.825rem", color: "var(--text-dim)", margin: 0, lineHeight: 1.4 }}>{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick 1-Click Demo Profiles */}
          <div
            style={{
              padding: "16px 20px",
              borderRadius: "var(--radius-md)",
              background: "linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(16, 185, 129, 0.08) 100%)",
              border: "1px dashed rgba(249, 115, 22, 0.35)",
            }}
          >
            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff", marginBottom: 4 }}>
              ⚡ Quick Demo Access (Explore Seeded Data):
            </div>
            <div style={{ fontSize: "0.775rem", color: "var(--text-muted)", marginBottom: 12 }}>
              Experience 30 days of workout logs, active streaks, and goals instantly:
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                onClick={() => handleDemoLogin("arjun.sharma@fittrack.in", "password123")}
                disabled={loading}
                className="btn btn-primary btn-sm"
              >
                <Sparkles size={13} /> Login as Arjun Sharma (Athlete)
              </button>
              <button
                onClick={() => handleDemoLogin("priya.patel@fittrack.in", "password123")}
                disabled={loading}
                className="btn btn-secondary btn-sm"
              >
                Login as Priya Patel
              </button>
            </div>
          </div>
        </div>

        {/* Right: Modern Auth Form Card */}
        <div className="glass-card" style={{ padding: "36px 32px", background: "rgba(17, 24, 39, 0.92)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
            <div>
              <h2 style={{ fontSize: "1.65rem", margin: 0 }}>{isLogin ? "Namaste! Welcome Back" : "Start Your Fitness Yatra"}</h2>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: 4 }}>
                {isLogin ? "Sign in to view your daily calorie burn & streaks" : "Join thousands of Indians living a fitter, healthier life"}
              </p>
            </div>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "rgba(16, 185, 129, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--emerald-primary)",
              }}
            >
              <Activity size={22} />
            </div>
          </div>

          {error && (
            <div
              style={{
                padding: "12px 14px",
                borderRadius: 8,
                background: "rgba(239, 68, 68, 0.15)",
                color: "#f87171",
                fontSize: "0.85rem",
                marginBottom: 20,
                border: "1px solid rgba(239, 68, 68, 0.3)",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. arjun_fitness, rohit_runs"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="name@example.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {!isLogin && (
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: "100%", padding: 13, marginTop: 12, fontSize: "0.95rem" }}
            >
              {loading ? "Authenticating..." : isLogin ? "Sign In to FitTrack" : "Create Account & Start"}
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Toggle between Login and Register */}
          <div style={{ marginTop: 24, textAlign: "center", borderTop: "1px solid var(--border-subtle)", paddingTop: 18 }}>
            <span style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
              {isLogin ? "New to FitTrack?" : "Already have an account?"}{" "}
            </span>
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              style={{
                background: "none",
                border: "none",
                color: "var(--emerald-primary)",
                fontWeight: 700,
                cursor: "pointer",
                fontSize: "0.875rem",
              }}
            >
              {isLogin ? "Register your profile" : "Sign in here"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
