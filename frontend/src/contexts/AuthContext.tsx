import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "manager" | "incharge" | "executive";
  phone?: string;
  status?: "active" | "inactive";
  projects?: string[];   // ✅ match DataContext
  joinDate?: string;
  avatar?: string;
  confirmPassword?: string;  // ✅ new
}


interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// const API_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000";
const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedToken) setToken(savedToken);
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password }),
      });
      if (!res.ok) {
        setLoading(false);
        return false;
      }
      const data = await res.json();
      localStorage.setItem("token", data.access);
      localStorage.setItem("refresh", data.refresh);
      setToken(data.access);

      const userRes = await fetch(`${API_BASE}/api/users/`, {
        headers: { Authorization: `Bearer ${data.access}` },
      });
      const users = await userRes.json();
      const found = users.find((u: any) => u.email === email) || users.find((u: any) => u.username === email);
      if (found) {
        const normalized: User = {
          id: found.id,
          name: `${found.first_name || ""} ${found.last_name || ""}`.trim() || found.username,
          email: found.email,
          role: found.role,
          projects: [],  // ✅ use string[] instead of projectIds
          confirmPassword: found.confirm_password || "",
        };

        setUser(normalized);
        localStorage.setItem("user", JSON.stringify(normalized));
        setLoading(false);
        return true;
      }
      setLoading(false);
      return false;
    } catch (e) {
      console.error("Login failed", e);
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("refresh");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
