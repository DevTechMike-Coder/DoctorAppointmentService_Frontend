import type { AppointmentDto } from "./types";

// Keep in sync with app.meeting.join-early-minutes / join-late-minutes on the backend.
// The server is the real gate; this only decides whether to show the button as active.
const JOIN_EARLY_MS = 10 * 60_000;
const JOIN_LATE_MS = 15 * 60_000;

export type CallState = "unavailable" | "early" | "open" | "closed";

export function callState(appt: AppointmentDto, now: number): CallState {
  if (appt.status !== "CONFIRMED") return "unavailable";
  const start = new Date(appt.startTime).getTime();
  const end = new Date(appt.endTime).getTime();
  if (now < start - JOIN_EARLY_MS) return "early";
  if (now > end + JOIN_LATE_MS) return "closed";
  return "open";
}
