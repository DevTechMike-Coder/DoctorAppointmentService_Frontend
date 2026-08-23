import type { Role } from "./types";

export interface DecodedToken {
  sub: string;
  userId: number;
  role: Role;
  exp: number;
}

const TOKEN_KEY = "token";
const USER_NAME_KEY = "fullName";
const TOKEN_MAX_AGE_SECONDS = 900; // must match app.jwt.expiration-ms (900000ms = 900s) in application.yml

export function setToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${TOKEN_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_NAME_KEY);
  document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

/** Persist the user's display name across refreshes (it isn't in the JWT). */
export function setStoredUserName(name: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_NAME_KEY, name);
}

export function getStoredUserName(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(USER_NAME_KEY) ?? "";
}

/** Decodes a JWT payload, handling URL-safe base64 (the encoding JWTs actually use). */
export function decodeToken(token: string): DecodedToken | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export function isTokenValid(token: string): boolean {
  const decoded = decodeToken(token);
  return !!decoded && decoded.exp * 1000 > Date.now();
}
