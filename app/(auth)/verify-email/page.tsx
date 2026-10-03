/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";

type Status = "verifying" | "success" | "error";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<Status>("verifying");
  const [message, setMessage] = useState("");
  // StrictMode runs effects twice in dev; a token is single-use, so only redeem it once.
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const token = new URLSearchParams(window.location.search).get("token");
    // Drop the token from the address bar/history so it can't leak via referrer or screenshots.
    window.history.replaceState(null, "", "/verify-email");

    if (!token) {
      setStatus("error");
      setMessage("This verification link is incomplete. Open the link from your email again.");
      return;
    }

    apiFetch<void>("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    })
      .then(() => setStatus("success"))
      .catch((err) => {
        setStatus("error");
        setMessage(
          err instanceof ApiError ? err.message : "Couldn't verify your email. Try again.",
        );
      });
  }, []);

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm text-center">
        <Link
          href="/"
          className="font-display text-2xl text-ink tracking-tight inline-flex items-center gap-2 mb-10"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-teal inline-block" />
          MedBook
        </Link>

        <div className="bg-white rounded-2xl border border-ink/10 p-8 shadow-xs">
          {status === "verifying" && (
            <p className="text-sm text-ink/60 animate-pulse">Verifying your email…</p>
          )}

          {status === "success" && (
            <>
              <CheckCircle2 className="w-10 h-10 text-teal mx-auto mb-4" />
              <h1 className="font-display text-2xl text-ink mb-2">Email verified</h1>
              <p className="text-sm text-ink/60 mb-6">
                Your account is active. You can sign in now.
              </p>
              <Link
                href="/login"
                className="inline-block rounded-xl bg-teal hover:bg-teal-dark text-white text-sm font-medium px-6 py-2.5 transition shadow-sm"
              >
                Sign in
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <AlertCircle className="w-10 h-10 text-rust mx-auto mb-4" />
              <h1 className="font-display text-2xl text-ink mb-2">Couldn&apos;t verify</h1>
              <p className="text-sm text-ink/60 mb-6">{message}</p>
              <Link
                href="/login"
                className="text-sm font-medium text-teal hover:text-teal-dark underline-offset-4 hover:underline"
              >
                Go to sign in to request a new link
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
