import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("fittrack_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("fittrack_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem("fittrack_token");
      if (storedToken) {
        try {
          const profile = await api.getMe();
          setUser(profile);
          localStorage.setItem("fittrack_user", JSON.stringify(profile));
        } catch (err) {
          console.error("Token verification failed:", err);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();

    const handleExpired = () => logout();
    window.addEventListener("auth_expired", handleExpired);
    return () => window.removeEventListener("auth_expired", handleExpired);
  }, []);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    localStorage.setItem("fittrack_token", res.access_token);
    localStorage.setItem("fittrack_user", JSON.stringify(res.user));
    setToken(res.access_token);
    setUser(res.user);
    return res.user;
  };

  const register = async (username, email, password) => {
    const res = await api.register({ username, email, password });
    localStorage.setItem("fittrack_token", res.access_token);
    localStorage.setItem("fittrack_user", JSON.stringify(res.user));
    setToken(res.access_token);
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    localStorage.removeItem("fittrack_token");
    localStorage.removeItem("fittrack_user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
