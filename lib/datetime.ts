/**
 * Date/time helpers for talking to a Spring backend that uses LocalDateTime
 * (no timezone). Always format using LOCAL wall-clock components — never
 * toISOString(), which converts to UTC and shifts the time.
 */

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** "2026-08-23T14:30:00" in the user's local time. */
export function toLocalDateTime(date: Date): string {
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
}

/** "2026-08-23" portion of an ISO LocalDateTime string. */
export function dateKey(iso: string): string {
  return iso.split("T")[0];
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatDayLabel(dateKeyStr: string): string {
  const date = new Date(`${dateKeyStr}T00:00:00`);
  return date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}
