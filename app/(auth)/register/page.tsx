"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";

export default function RegisterPage() {
  const { register } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"PATIENT" | "DOCTOR">("PATIENT");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    try {
      await register({ fullName, email, password, role });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Couldn't create your account. Try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-canvas grid lg:grid-cols-2">
      {/* Brand panel — unchanged from before */}
      <div className="hidden lg:flex flex-col justify-between bg-ink text-canvas px-16 py-14 relative overflow-hidden">
        <SlotPattern />
        <div className="relative z-10">
          <span className="font-display text-2xl">MedBook</span>
        </div>
        <div className="relative z-10 max-w-md">
          <h1 className="font-display text-4xl leading-tight mb-4">
            Set up in under a minute.
          </h1>
          <p className="text-canvas/70 text-sm leading-relaxed">
            Whether you&apos;re booking a visit or filling your calendar, your
            account gets you there — no paperwork, no phone tag.
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

          <h2 className="font-display text-3xl text-ink mb-2">
            Create your account
          </h2>
          <p className="text-ink/60 text-sm mb-8">
            Tell us a little about you to get started.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <span className="block text-sm font-medium text-ink mb-1.5">
                I am a
              </span>
              <div className="grid grid-cols-2 gap-2 rounded-lg bg-ink/5 p-1">
                <button
                  type="button"
                  onClick={() => setRole("PATIENT")}
                  className={`rounded-md py-2 text-sm font-medium transition ${
                    role === "PATIENT"
                      ? "bg-white text-ink shadow-sm"
                      : "text-ink/50 hover:text-ink/70"
                  }`}
                >
                  Patient
                </button>
                <button
                  type="button"
                  onClick={() => setRole("DOCTOR")}
                  className={`rounded-md py-2 text-sm font-medium transition ${
                    role === "DOCTOR"
                      ? "bg-white text-ink shadow-sm"
                      : "text-ink/50 hover:text-ink/70"
                  }`}
                >
                  Doctor
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-ink mb-1.5"
              >
                Full name
              </label>
              <input
                id="fullName"
                type="text"
                required
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/30 outline-none focus:ring-2 focus:ring-teal focus:border-teal transition"
                placeholder="Jane Doe"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-ink mb-1.5"
              >
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-ink mb-1.5"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  maxLength={72}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/30 outline-none focus:ring-2 focus:ring-teal focus:border-teal transition"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-ink mb-1.5"
                >
                  Confirm
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/30 outline-none focus:ring-2 focus:ring-teal focus:border-teal transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <p className="text-xs text-ink/40 leading-relaxed">
              8–72 characters. Use a passphrase you don&apos;t reuse elsewhere.
            </p>

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
              {submitting ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="mt-8 text-sm text-ink/60 text-center">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-teal font-medium hover:text-teal-dark"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

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
