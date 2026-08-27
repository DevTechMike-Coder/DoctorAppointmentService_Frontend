"use client";

import { useState } from "react";
import { Calendar, Clock, X, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAppointments } from "@/hooks/useAppointments";
import { useToast } from "@/components/Toast";
import { ApiError } from "@/lib/api";
import type { AppointmentDto, AppointmentStatus } from "@/lib/types";

const TABS = ["Upcoming", "Past", "Cancelled"] as const;
type PatientTab = (typeof TABS)[number];

export default function AppointmentsPage() {
  const { appointments, loading, error, cancelAppointment } = useAppointments();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<PatientTab>("Upcoming");
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
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl sm:text-4xl text-ink mb-1.5 font-bold tracking-tight">
            Your appointments
          </h1>
          <p className="text-ink/60 text-sm sm:text-base">
            Manage upcoming visits, reschedule, or review past consultations.
          </p>
        </motion.div>

        <div className="flex gap-2 mb-8 border-b border-ink/10 pb-2">
          {TABS.map((tab) => {
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-4 py-2 text-sm font-medium transition-colors ${
                  active ? "text-teal-dark font-semibold" : "text-ink/50 hover:text-ink"
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="activeApptTab"
                    className="absolute inset-0 bg-teal-light rounded-xl -z-10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span>{tab}</span>
              </button>
            );
          })}
        </div>

        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-ink/10 p-5 animate-pulse h-24 shadow-xs" />
            ))}
          </div>
        )}

        {!loading && error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border border-rust/20 py-16 text-center shadow-xs"
          >
            <AlertCircle className="w-8 h-8 text-rust/40 mx-auto mb-2" />
            <p className="text-sm text-rust font-medium">{error}</p>
          </motion.div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border border-ink/10 py-16 text-center shadow-xs"
          >
            <Calendar className="w-8 h-8 text-ink/15 mx-auto mb-3" />
            <p className="text-sm text-ink/40">No {activeTab.toLowerCase()} appointments.</p>
          </motion.div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <motion.div layout className="space-y-3.5">
            <AnimatePresence mode="popLayout">
              {filtered.map((appt) => (
                <AppointmentRow
                  key={appt.id}
                  appt={appt}
                  cancelling={cancellingId === appt.id}
                  onCancel={() => handleCancel(appt.id)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
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
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="bg-white rounded-2xl border border-ink/10 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-12 h-12 rounded-2xl bg-teal-light text-teal-dark font-display font-semibold text-base flex items-center justify-center shrink-0">
          {initials}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-ink text-base truncate">{appt.doctorName}</h3>
            <StatusBadge status={appt.status} />
          </div>
          {appt.reason && (
            <p className="text-xs text-ink/60 truncate font-light max-w-md">{appt.reason}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-ink/5">
        <div className="text-left sm:text-right shrink-0">
          <div className="flex items-center sm:justify-end gap-1.5 text-sm text-ink font-semibold mb-0.5">
            <Calendar className="w-3.5 h-3.5 text-teal" />
            <span>{formatDate(appt.startTime)}</span>
          </div>
          <div className="flex items-center sm:justify-end gap-1.5 text-xs text-ink/50">
            <Clock className="w-3.5 h-3.5 text-ink/35" />
            <span>{formatTime(appt.startTime)}</span>
          </div>
        </div>

        {canCancel && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onCancel}
            disabled={cancelling}
            className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-ink/35 hover:text-rust hover:bg-rust/10 transition disabled:opacity-40"
            title="Cancel appointment"
          >
            <X className="w-4 h-4" />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

function StatusBadge({ status }: { status: AppointmentStatus }) {
  const styles: Record<AppointmentStatus, string> = {
    PENDING: "bg-amber-50 text-amber-700 border-amber-200/50",
    CONFIRMED: "bg-teal-light text-teal-dark border-teal/20",
    CANCELLED: "bg-rust/10 text-rust border-rust/20",
    COMPLETED: "bg-ink/5 text-ink/50 border-ink/10",
  };
  const labels: Record<AppointmentStatus, string> = {
    PENDING: "Pending",
    CONFIRMED: "Confirmed",
    CANCELLED: "Cancelled",
    COMPLETED: "Completed",
  };
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${styles[status]}`}>
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