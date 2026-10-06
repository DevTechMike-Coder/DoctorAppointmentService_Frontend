"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Video } from "lucide-react";
import { callState } from "@/lib/meeting";
import type { AppointmentDto } from "@/lib/types";

/** "Join call" for confirmed appointments; greyed out until the join window opens. */
export default function JoinCallButton({ appt }: { appt: AppointmentDto }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const state = callState(appt, now);
  if (state === "unavailable" || state === "closed") return null;

  if (state === "early") {
    return (
      <span
        title="The call opens 10 minutes before the appointment"
        className="inline-flex items-center gap-1.5 rounded-xl border border-ink/10 text-ink/35 text-xs font-medium px-4 py-2.5 cursor-not-allowed"
      >
        <Video className="w-3.5 h-3.5" />
        Call opens soon
      </span>
    );
  }

  return (
    <Link
      href={`/call/${appt.id}`}
      className="inline-flex items-center gap-1.5 rounded-xl bg-teal hover:bg-teal-dark text-white text-xs font-semibold px-4 py-2.5 transition shadow-2xs"
    >
      <Video className="w-3.5 h-3.5" />
      Join call
    </Link>
  );
}
