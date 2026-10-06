"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { MeetingJoinResponse } from "@/lib/types";

export default function CallPage() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const { user } = useAuth();
  const [joinUrl, setJoinUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    apiFetch<MeetingJoinResponse>(`/appointments/${appointmentId}/meeting`, {
      method: "POST",
      signal: controller.signal,
    })
      .then((res) => setJoinUrl(res.joinUrl))
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof ApiError ? err.message : "Couldn't start the call.");
      });
    return () => controller.abort();
  }, [appointmentId]);

  const backHref = user?.role === "DOCTOR" ? "/doctor/appointments" : "/appointments";

  return (
    <div className="flex flex-col h-screen bg-canvas">
      <div className="px-4 py-3 border-b border-ink/10 bg-white">
        <Link href={backHref} className="inline-flex items-center gap-1.5 text-sm text-ink/60 hover:text-ink">
          <ArrowLeft className="w-4 h-4" />
          Back to appointments
        </Link>
      </div>

      {error && (
        <div className="m-auto text-center px-6">
          <AlertCircle className="w-8 h-8 text-rust/40 mx-auto mb-2" />
          <p className="text-sm text-rust font-medium">{error}</p>
        </div>
      )}

      {!error && !joinUrl && <p className="m-auto text-sm text-ink/40">Connecting…</p>}

      {joinUrl && (
        <iframe
          src={joinUrl}
          title="Video consultation"
          allow="camera; microphone; fullscreen; display-capture; autoplay"
          referrerPolicy="no-referrer"
          className="flex-1 w-full border-0"
        />
      )}
    </div>
  );
}
