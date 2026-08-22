"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { setToken, getToken, clearToken, decodeToken, isTokenValid } from "@/lib/auth";
import type { AuthResponse, LoginRequest, RegisterRequest, Role } from "@/lib/types";

interface AuthUser {
  userId: number;
  fullName: string;
  role: Role;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (token && isTokenValid(token)) {
      const decoded = decodeToken(token);
      if (decoded) {
        setUser({ userId: decoded.userId, fullName: "", role: decoded.role });
      }
    } else if (token) {
      clearToken();
    }
    setLoading(false);
  }, []);

  function applyAuthResponse(res: AuthResponse) {
    setToken(res.token);
    setUser({ userId: res.userId, fullName: res.fullName, role: res.role });
    router.push(res.role === "DOCTOR" ? "/doctor/appointments" : "/doctors");
  }

  async function login(credentials: LoginRequest) {
    const res = await apiFetch<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    applyAuthResponse(res);
  }

  async function register(data: RegisterRequest) {
    const res = await apiFetch<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
    applyAuthResponse(res);
  }

  function logout() {
    clearToken();
    setUser(null);
    router.push("/login");
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}