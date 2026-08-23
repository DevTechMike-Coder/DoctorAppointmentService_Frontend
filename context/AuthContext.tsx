/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import {
  setToken,
  getToken,
  clearToken,
  decodeToken,
  isTokenValid,
  setStoredUserName,
  getStoredUserName,
} from "@/lib/auth";
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

/** Only allow same-site relative redirect targets. */
function safeRedirectTarget(): string | null {
  if (typeof window === "undefined") return null;
  const target = new URLSearchParams(window.location.search).get("redirectTo");
  if (target && target.startsWith("/") && !target.startsWith("//")) return target;
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (token && isTokenValid(token)) {
      const decoded = decodeToken(token);
      if (decoded) {
        setUser({
          userId: decoded.userId,
          fullName: getStoredUserName(),
          role: decoded.role,
        });
      }
    } else if (token) {
      clearToken();
    }
    setLoading(false);
  }, []);

  function applyAuthResponse(res: AuthResponse) {
    setToken(res.token);
    setStoredUserName(res.fullName);
    setUser({ userId: res.userId, fullName: res.fullName, role: res.role });

    const fallback = res.role === "DOCTOR" ? "/doctor/appointments" : "/doctors";
    router.push(safeRedirectTarget() ?? fallback);
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
