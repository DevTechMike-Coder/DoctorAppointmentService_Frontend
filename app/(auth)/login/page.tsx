/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("expired")) {
      setNotice("Your session expired. Sign in again to continue.");
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login({ email, password });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't sign in. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-canvas grid lg:grid-cols-2">
      {/* Brand panel */}
      <div className="hidden lg:flex flex-col justify-between bg-ink text-canvas px-16 py-14 relative overflow-hidden">
        <SlotPattern />
        <div className="relative z-10">
          <span className="font-display text-2xl">MedBook</span>
        </div>
        <div className="relative z-10 max-w-md">
          <h1 className="font-display text-4xl leading-tight mb-4">
            The next available slot is always in view.
          </h1>
          <p className="text-canvas/70 text-sm leading-relaxed">
            Book with your doctor in a few taps. No calling, no waiting on hold —
            just an open time and a confirmed appointment.
          </p>
        </div>
        <p className="relative z-10 text-xs text-canvas/40">
          For patients and doctors.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-10">
            <span className="font-display text-2xl text-ink">MedBook</span>
          </div>

          <h2 className="font-display text-3xl text-ink mb-2">Sign in</h2>
          <p className="text-ink/60 text-sm mb-8">
            Enter your details to view your appointments.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {notice && (
              <p className="text-sm text-teal-dark bg-teal-light border border-teal/20 rounded-lg px-3.5 py-2.5">
                {notice}
              </p>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/30 outline-none focus:ring-2 focus:ring-teal focus:border-teal transition"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-ink mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/30 outline-none focus:ring-2 focus:ring-teal focus:border-teal transition"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p
                role="alert"
                className="text-sm text-rust bg-rust/5 border border-rust/20 rounded-lg px-3.5 py-2.5"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-teal hover:bg-teal-dark disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 transition"
            >
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-8 text-sm text-ink/60 text-center">
            New here?{" "}
            <Link href="/register" className="text-teal font-medium hover:text-teal-dark">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

/** Signature element: a quiet grid of dots standing in for a calendar of open slots. */
function SlotPattern() {
  const dots = Array.from({ length: 48 });
  return (
    <div className="absolute inset-0 opacity-[0.07] grid grid-cols-8 gap-6 p-10 pointer-events-none">
      {dots.map((_, i) => (
        <div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-canvas"
          style={{ opacity: i % 7 === 0 ? 1 : 0.4 }}
        />
      ))}
    </div>
  );
}