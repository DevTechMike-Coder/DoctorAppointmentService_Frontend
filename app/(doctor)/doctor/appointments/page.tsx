"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, Check, X, CheckCheck } from "lucide-react";
import { useDoctorProfile } from "@/hooks/useDoctorProfile";
import { useDoctorAppointments } from "@/hooks/useDoctorAppointments";
import type { AppointmentDto, AppointmentStatus } from "@/lib/types";

const TABS = ["Pending", "Confirmed", "Past"] as const;

export default function DoctorAppointmentsPage() {
  const { profile, loading: profileLoading } = useDoctorProfile();
  const { appointments, loading, error, updateStatus } = useDoctorAppointments(
    profile?.id ?? null,
  );
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("Pending");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const filtered = appointments.filter((a) => {
    if (activeTab === "Pending") return a.status === "PENDING";
    if (activeTab === "Confirmed") return a.status === "CONFIRMED";
    return a.status === "COMPLETED" || a.status === "CANCELLED";
  });

  async function handleUpdate(id: number, status: AppointmentStatus) {
    setUpdatingId(id);
    try {
      await updateStatus(id, status);
    } catch {
      // stays as-is, doctor can retry
    } finally {
      setUpdatingId(null);
    }
  }

  const initials =
    profile?.fullName
      ?.replace("Dr. ", "")
      .split(" ")
      .map((n) => n[0])
      .join("") ?? "DR";

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <p className="text-sm text-ink/40">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-ink/10 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-display text-xl text-ink">MedBook</span>
          <div className="w-8 h-8 rounded-full bg-teal-light flex items-center justify-center text-teal-dark text-xs font-medium">
            {initials}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="font-display text-3xl text-ink mb-1.5">
            Appointments
          </h1>
          <p className="text-ink/60 text-sm">
            Review requests and manage your schedule.
          </p>
        </div>

        <div className="flex gap-1 mb-6 border-b border-ink/10">
          {TABS.map((tab) => {
            const count = appointments.filter((a) =>
              tab === "Pending"
                ? a.status === "PENDING"
                : tab === "Confirmed"
                  ? a.status === "CONFIRMED"
                  : a.status === "COMPLETED" || a.status === "CANCELLED",
            ).length;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition ${
                  activeTab === tab
                    ? "border-teal text-ink"
                    : "border-transparent text-ink/40 hover:text-ink/60"
                }`}
              >
                {tab}
                {count > 0 && (
                  <span
                    className={`text-[11px] rounded-full px-1.5 py-0.5 ${
                      activeTab === tab
                        ? "bg-teal-light text-teal-dark"
                        : "bg-ink/5 text-ink/40"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-24 bg-white rounded-xl border border-ink/10 animate-pulse"
              />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="bg-white rounded-xl border border-rust/20 py-16 text-center">
            <p className="text-sm text-rust">{error}</p>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="bg-white rounded-xl border border-ink/10 py-16 text-center">
            <Calendar className="w-8 h-8 text-ink/15 mx-auto mb-3" />
            <p className="text-sm text-ink/40">Nothing here right now.</p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((appt) => (
              <AppointmentRow
                key={appt.id}
                appt={appt}
                updating={updatingId === appt.id}
                onUpdate={(status) => handleUpdate(appt.id, status)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AppointmentRow({
  appt,
  updating,
  onUpdate,
}: {
  appt: AppointmentDto;
  updating: boolean;
  onUpdate: (status: AppointmentStatus) => void;
}) {
  const initials = appt.patientName
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <div className="bg-white rounded-xl border border-ink/10 p-5">
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-full bg-ink/5 text-ink/60 font-display text-sm flex items-center justify-center shrink-0">
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-ink text-sm">{appt.patientName}</h3>
            <StatusBadge status={appt.status} />
          </div>
          {appt.reason && (
            <p className="text-sm text-ink/55 truncate">{appt.reason}</p>
          )}
        </div>

        <div className="text-right shrink-0">
          <div className="flex items-center justify-end gap-1.5 text-sm text-ink font-medium mb-0.5">
            <Calendar className="w-3.5 h-3.5 text-ink/30" />
            {formatDate(appt.startTime)}
          </div>
          <div className="flex items-center justify-end gap-1.5 text-xs text-ink/50">
            <Clock className="w-3.5 h-3.5 text-ink/30" />
            {formatTime(appt.startTime)}
          </div>
        </div>
      </div>

      {(appt.status === "PENDING" || appt.status === "CONFIRMED") && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-ink/5">
          {appt.status === "PENDING" && (
            <>
              <button
                onClick={() => onUpdate("CONFIRMED")}
                disabled={updating}
                className="inline-flex items-center gap-1.5 rounded-lg bg-teal hover:bg-teal-dark disabled:opacity-50 text-white text-xs font-medium px-3.5 py-2 transition"
              >
                <Check className="w-3.5 h-3.5" />
                Confirm
              </button>
              <button
                onClick={() => onUpdate("CANCELLED")}
                disabled={updating}
                className="inline-flex items-center gap-1.5 rounded-lg border border-ink/15 text-ink/60 hover:text-rust hover:border-rust/30 disabled:opacity-50 text-xs font-medium px-3.5 py-2 transition"
              >
                <X className="w-3.5 h-3.5" />
                Decline
              </button>
            </>
          )}
          {appt.status === "CONFIRMED" && (
            <>
              <button
                onClick={() => onUpdate("COMPLETED")}
                disabled={updating}
                className="inline-flex items-center gap-1.5 rounded-lg bg-teal hover:bg-teal-dark disabled:opacity-50 text-white text-xs font-medium px-3.5 py-2 transition"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark completed
              </button>
              <button
                onClick={() => onUpdate("CANCELLED")}
                disabled={updating}
                className="inline-flex items-center gap-1.5 rounded-lg border border-ink/15 text-ink/60 hover:text-rust hover:border-rust/30 disabled:opacity-50 text-xs font-medium px-3.5 py-2 transition"
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: AppointmentStatus }) {
  const styles: Record<AppointmentStatus, string> = {
    PENDING: "bg-amber-50 text-amber-700",
    CONFIRMED: "bg-teal-light text-teal-dark",
    CANCELLED: "bg-rust/5 text-rust",
    COMPLETED: "bg-ink/5 text-ink/50",
  };
  const labels: Record<AppointmentStatus, string> = {
    PENDING: "Pending",
    CONFIRMED: "Confirmed",
    CANCELLED: "Cancelled",
    COMPLETED: "Completed",
  };
  return (
    <span
      className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}
