"use client";

import { useState } from "react";
import { Calendar, Clock, X } from "lucide-react";
import { useAppointments } from "@/hooks/useAppointments";
import { useToast } from "@/components/Toast";
import { ApiError } from "@/lib/api";
import type { AppointmentDto, AppointmentStatus } from "@/lib/types";

const TABS = ["Upcoming", "Past", "Cancelled"] as const;

export default function AppointmentsPage() {
  const { appointments, loading, error, cancelAppointment } = useAppointments();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("Upcoming");
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const filtered = appointments.filter((a) => {
    if (activeTab === "Upcoming") return a.status === "PENDING" || a.status === "CONFIRMED";
    if (activeTab === "Past") return a.status === "COMPLETED";
    return a.status === "CANCELLED";
  });

  async function handleCancel(id: number) {
    setCancellingId(id);
    try {
      await cancelAppointment(id);
      toast.success("Appointment cancelled.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't cancel. Try again.");
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <div>
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="font-display text-3xl text-ink mb-1.5">Your appointments</h1>
          <p className="text-ink/60 text-sm">Manage upcoming visits and review past ones.</p>
        </div>

        <div className="flex gap-1 mb-6 border-b border-ink/10">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition ${
                activeTab === tab
                  ? "border-teal text-ink"
                  : "border-transparent text-ink/40 hover:text-ink/60"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-ink/10 p-5 animate-pulse h-20" />
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
            <p className="text-sm text-ink/40">Nothing here yet.</p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((appt) => (
              <AppointmentRow
                key={appt.id}
                appt={appt}
                cancelling={cancellingId === appt.id}
                onCancel={() => handleCancel(appt.id)}
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
  cancelling,
  onCancel,
}: {
  appt: AppointmentDto;
  cancelling: boolean;
  onCancel: () => void;
}) {
  const initials = appt.doctorName.replace("Dr. ", "").split(" ").map((n) => n[0]).join("");
  const canCancel = appt.status === "PENDING" || appt.status === "CONFIRMED";

  return (
    <div className="bg-white rounded-xl border border-ink/10 p-5 flex items-center gap-4">
      <div className="w-11 h-11 rounded-full bg-teal-light text-teal-dark font-display text-sm flex items-center justify-center shrink-0">
        {initials}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-medium text-ink text-sm">{appt.doctorName}</h3>
          <StatusBadge status={appt.status} />
        </div>
        {appt.reason && <p className="text-sm text-ink/55 truncate">{appt.reason}</p>}
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

      {canCancel && (
        <button
          onClick={onCancel}
          disabled={cancelling}
          className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-ink/30 hover:text-rust hover:bg-rust/5 transition disabled:opacity-40"
          title="Cancel appointment"
        >
          <X className="w-4 h-4" />
        </button>
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
    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}