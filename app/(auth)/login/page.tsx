/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { AlertCircle, ArrowRight, Sparkles } from "lucide-react";
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
            <span>Instant booking</span>
          </div>
          <h1 className="font-display text-4xl leading-tight mb-4 tracking-tight">
            The next available slot is always in view.
          </h1>
          <p className="text-canvas/70 text-sm leading-relaxed font-light">
            Book with your doctor in a few taps. No calling, no waiting on hold —
            just an open time and a confirmed appointment.
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

          <h2 className="font-display text-3xl text-ink mb-2">Sign in</h2>
          <p className="text-ink/60 text-sm mb-8">
            Enter your details to view your appointments.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence>
              {notice && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="text-sm text-teal-dark bg-teal-light border border-teal/20 rounded-xl px-3.5 py-2.5"
                >
                  {notice}
                </motion.div>
              )}
            </AnimatePresence>

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
                className="w-full rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/30 outline-none focus:ring-2 focus:ring-teal focus:border-teal transition shadow-2xs"
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
                className="w-full rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/30 outline-none focus:ring-2 focus:ring-teal focus:border-teal transition shadow-2xs"
                placeholder="••••••••"
              />
            </div>

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
              <span>{submitting ? "Signing in…" : "Sign in"}</span>
              {!submitting && <ArrowRight className="w-4 h-4" />}
            </motion.button>
          </form>

          <p className="mt-8 text-sm text-ink/60 text-center">
            New here?{" "}
            <Link href="/register" className="text-teal font-medium hover:text-teal-dark underline-offset-4 hover:underline">
              Create an account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

/** Signature animated grid of dots standing in for a calendar of open slots. */
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