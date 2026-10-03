"use client";

import { useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";

const COOLDOWN_SECONDS = 60; // matches the backend's per-account resend cooldown

/** "Didn't get the email?" control with a client-side cooldown. The endpoint never reveals whether an email is registered. */
export function ResendVerification({ email }: { email: string }) {
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function resend() {
    setSending(true);
    setFeedback(null);
    try {
      await apiFetch<void>("/auth/resend-verification", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setFeedback({ ok: true, text: "If that account needs verifying, a new link is on its way." });
      setCooldown(COOLDOWN_SECONDS);
    } catch (err) {
      setFeedback({
        ok: false,
        text: err instanceof ApiError ? err.message : "Couldn't resend the email. Try again.",
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={resend}
        disabled={sending || cooldown > 0 || !email}
        className="text-sm font-medium text-teal hover:text-teal-dark disabled:opacity-50 disabled:cursor-not-allowed underline-offset-4 hover:underline"
      >
        {sending
          ? "Sending…"
          : cooldown > 0
            ? `Resend available in ${cooldown}s`
            : "Resend verification email"}
      </button>
      {feedback && (
        <p className={`text-xs ${feedback.ok ? "text-teal-dark" : "text-rust"}`} role="status">
          {feedback.text}
        </p>
      )}
    </div>
  );
}
