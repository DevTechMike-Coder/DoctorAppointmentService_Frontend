import { getToken, clearToken } from "./auth";
import type { ErrorResponse } from "./types";

/**
 * Defaults to the same-origin `/api/v1` path, which next.config.ts rewrites
 * to the Spring backend. This avoids CORS entirely (the backend only allows
 * http://localhost:3000). Set NEXT_PUBLIC_API_BASE_URL to call the backend
 * directly instead.
 */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api/v1";

export class ApiError extends Error {
  status: number;
  details?: string[];

  constructor(message: string, status: number, details?: string[]) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

/** On an expired/invalid session, drop credentials and send the user to login. */
function handleUnauthorized() {
  if (typeof window === "undefined") return;
  clearToken();
  const path = window.location.pathname;
  const isPublic = path === "/" || path === "/login" || path === "/register";
  if (!isPublic) {
    // Hard navigation on purpose: we're outside React here and want a clean
    // slate (all in-memory auth state dropped) when the session expires.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = `/login?redirectTo=${encodeURIComponent(path)}&expired=1`;
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    let body: ErrorResponse | null = null;
    try {
      body = await res.json();
    } catch {
      // non-JSON error body
    }

    if (res.status === 401 && token) {
      handleUnauthorized();
    }

    // Bean-validation errors arrive as a details array — surface them.
    const detailMessage = body?.details?.length ? body.details.join(" ") : null;
    throw new ApiError(
      detailMessage ?? body?.message ?? res.statusText ?? "Request failed",
      res.status,
      body?.details
    );
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}
