import React from "react";
import { X, Award, Sparkles, Check } from "lucide-react";

export default function BadgePopupModal({ isOpen, onClose, badge }) {
  if (!isOpen || !badge) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 440,
          textAlign: "center",
          padding: "36px 28px",
          position: "relative",
          background: "linear-gradient(180deg, #131c2e 0%, #0b0f19 100%)",
          border: "1px solid rgba(245, 158, 11, 0.4)",
          boxShadow: "0 0 50px rgba(245, 158, 11, 0.25), 0 25px 50px rgba(0, 0, 0, 0.9)",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "transparent",
            border: "none",
            color: "var(--text-dim)",
            cursor: "pointer",
          }}
        >
          <X size={20} />
        </button>

        {/* Celebration Aura */}
        <div style={{ position: "relative", display: "inline-block", margin: "0 auto 20px" }}>
          <div
            style={{
              position: "absolute",
              inset: -15,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(245, 158, 11, 0.4) 0%, transparent 70%)",
              animation: "pulseGlow 2s infinite",
            }}
          />
          <div
            style={{
              width: 90,
              height: 90,
              borderRadius: 24,
              background: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2.8rem",
              color: "#fff",
              position: "relative",
              boxShadow: "0 10px 30px rgba(245, 158, 11, 0.5)",
            }}
          >
            🏆
          </div>
        </div>

        <span
          style={{
            display: "inline-block",
            fontSize: "0.75rem",
            textTransform: "uppercase",
            fontWeight: 800,
            letterSpacing: "0.1em",
            color: "#fbbf24",
            background: "rgba(245, 158, 11, 0.15)",
            padding: "4px 12px",
            borderRadius: 9999,
            marginBottom: 10,
          }}
        >
          🎖️ Achievement Unlocked!
        </span>

        <h2 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: 8, color: "#fff" }}>
          {badge.name}
        </h2>

        <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 24 }}>
          {badge.description}
        </p>

        <div
          style={{
            background: "rgba(255, 255, 255, 0.04)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 12,
            padding: "12px",
            fontSize: "0.85rem",
            color: "var(--text-dim)",
            marginBottom: 24,
          }}
        >
          Category: <strong style={{ color: "var(--text-main)" }}>{badge.category ? badge.category.toUpperCase() : "GENERAL"}</strong>
        </div>

        <button
          onClick={onClose}
          className="btn-primary"
          style={{
            width: "100%",
            padding: "12px",
            fontSize: "1rem",
            fontWeight: 700,
            background: "linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <Sparkles size={18} />
          Shabaash! Continue Training
        </button>
      </div>
    </div>
  );
}
