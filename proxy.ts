import { NextRequest, NextResponse } from "next/server";

interface DecodedToken {
  sub: string;
  userId: number;
  role: "PATIENT" | "DOCTOR" | "ADMIN";
  exp: number;
}

function decodeToken(token: string): DecodedToken | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    // Replace URL-safe base64 characters for standard atob() compatibility
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function isValid(token: string | undefined): DecodedToken | null {
  if (!token) return null;
  const decoded = decodeToken(token);
  if (!decoded) return null;
  if (decoded.exp * 1000 <= Date.now()) return null;
  return decoded;
}

const PATIENT_ROUTES = ["/doctors", "/appointments"];
const DOCTOR_ROUTES = ["/doctor"];
const AUTH_ROUTES = ["/login", "/register"];

function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some((r) => pathname === r || pathname.startsWith(`${r}/`));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Never intercept API calls being rewritten to the backend.
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;
  const decoded = isValid(token);

  const isAuthRoute = AUTH_ROUTES.some((r) => pathname === r);

  if (isAuthRoute && decoded) {
    const destination = decoded.role === "DOCTOR" ? "/doctor/appointments" : "/doctors";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  if (pathname === "/" || isAuthRoute) {
    return NextResponse.next();
  }

  if (!decoded) {
    const url = new URL("/login", request.url);
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  const isDoctorRoute = matchesRoute(pathname, DOCTOR_ROUTES);
  const isPatientRoute = matchesRoute(pathname, PATIENT_ROUTES);

  if (isDoctorRoute && decoded.role !== "DOCTOR") {
    return NextResponse.redirect(new URL("/doctors", request.url));
  }
  if (isPatientRoute && decoded.role === "DOCTOR") {
    return NextResponse.redirect(new URL("/doctor/appointments", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.svg$).*)"],
};
