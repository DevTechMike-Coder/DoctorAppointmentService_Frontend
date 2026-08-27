"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { AlertCircle, ArrowRight, Sparkles } from "lucide-react";
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
      {/* Brand panel */}
      <div className="hidden lg:flex flex-col justify-between bg-ink text-canvas px-16 py-14 relative overflow-hidden">
        <SlotPattern />

        {/* Glow backdrop */}
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-teal/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <Link href="/" className="font-display text-2xl tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal inline-block" />
            MedBook
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10 max-w-md"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-canvas/10 text-canvas/80 text-xs font-medium mb-4">
            <Sparkles className="w-3.5 h-3.5 text-teal-light" />
            <span>Fast onboarding</span>
          </div>
          <h1 className="font-display text-4xl leading-tight mb-4 tracking-tight">
            Set up in under a minute.
          </h1>
          <p className="text-canvas/70 text-sm leading-relaxed font-light">
            Whether you&apos;re booking a visit or filling your calendar, your
            account gets you there — no paperwork, no phone tag.
          </p>
        </motion.div>

        <p className="relative z-10 text-xs text-canvas/40">
          For patients and doctors.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-sm"
        >
          <div className="lg:hidden mb-10">
            <Link href="/" className="font-display text-2xl text-ink tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal inline-block" />
              MedBook
            </Link>
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
              <div className="grid grid-cols-2 gap-1 rounded-xl bg-ink/5 p-1 border border-ink/5">
                <button
                  type="button"
                  onClick={() => setRole("PATIENT")}
                  className={`relative rounded-lg py-2 text-sm font-medium transition-colors ${
                    role === "PATIENT" ? "text-ink font-semibold" : "text-ink/55 hover:text-ink"
                  }`}
                >
                  {role === "PATIENT" && (
                    <motion.span
                      layoutId="roleActivePill"
                      className="absolute inset-0 bg-white rounded-lg shadow-sm"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">Patient</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("DOCTOR")}
                  className={`relative rounded-lg py-2 text-sm font-medium transition-colors ${
                    role === "DOCTOR" ? "text-ink font-semibold" : "text-ink/55 hover:text-ink"
                  }`}
                >
                  {role === "DOCTOR" && (
                    <motion.span
                      layoutId="roleActivePill"
                      className="absolute inset-0 bg-white rounded-lg shadow-sm"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">Doctor</span>
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
                className="w-full rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/30 outline-none focus:ring-2 focus:ring-teal focus:border-teal transition shadow-2xs"
                placeholder={role === "DOCTOR" ? "Dr. Jane Doe" : "Jane Doe"}
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
                className="w-full rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/30 outline-none focus:ring-2 focus:ring-teal focus:border-teal transition shadow-2xs"
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
                  className="w-full rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/30 outline-none focus:ring-2 focus:ring-teal focus:border-teal transition shadow-2xs"
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
                  className="w-full rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/30 outline-none focus:ring-2 focus:ring-teal focus:border-teal transition shadow-2xs"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <p className="text-xs text-ink/40 leading-relaxed">
              8–72 characters. Use a passphrase you don&apos;t reuse elsewhere.
            </p>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6 }}
                  role="alert"
                  className="flex items-center gap-2 text-sm text-rust bg-rust/5 border border-rust/20 rounded-xl px-3.5 py-2.5"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal hover:bg-teal-dark disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-3 transition shadow-sm hover:shadow"
            >
              <span>{submitting ? "Creating account…" : "Create account"}</span>
              {!submitting && <ArrowRight className="w-4 h-4" />}
            </motion.button>
          </form>

          <p className="mt-8 text-sm text-ink/60 text-center">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-teal font-medium hover:text-teal-dark underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function SlotPattern() {
  const dots = Array.from({ length: 48 });
  return (
    <div className="absolute inset-0 opacity-[0.08] grid grid-cols-8 gap-6 p-10 pointer-events-none">
      {dots.map((_, i) => (
        <motion.div
          key={i}
          animate={{
            opacity: [0.2, (i % 6 === 0 ? 0.9 : 0.4), 0.2],
            scale: [1, (i % 7 === 0 ? 1.3 : 1), 1],
          }}
          transition={{
            duration: 3 + (i % 3),
            repeat: Infinity,
            delay: (i % 8) * 0.25,
            ease: "easeInOut",
          }}
          className="w-1.5 h-1.5 rounded-full bg-canvas"
        />
      ))}
    </div>
  );
}

