export interface DecodedToken {
  sub: string;
  userId: number;
  role: "PATIENT" | "DOCTOR" | "ADMIN";
  exp: number;
}

const TOKEN_KEY = "token";
const TOKEN_MAX_AGE_SECONDS = 900; // must match app.jwt.expiration-ms (900000ms = 900s) in application.yml

export function setToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${TOKEN_MAX_AGE_SECONDS}; SameSite=Lax`;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export function decodeToken(token: string): DecodedToken | null {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export function isTokenValid(token: string): boolean {
  const decoded = decodeToken(token);
  return !!decoded && decoded.exp * 1000 > Date.now();
}
