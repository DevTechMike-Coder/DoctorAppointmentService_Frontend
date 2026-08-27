"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, Clock, Check, X, CheckCheck, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useDoctorProfile } from "@/hooks/useDoctorProfile";
import { useDoctorAppointments } from "@/hooks/useDoctorAppointments";
import { useToast } from "@/components/Toast";
import { ApiError } from "@/lib/api";
import type { AppointmentDto, AppointmentStatus } from "@/lib/types";

const TABS = ["Pending", "Confirmed", "Past"] as const;
type DoctorTab = (typeof TABS)[number];

export default function DoctorAppointmentsPage() {
  const { profile, loading: profileLoading } = useDoctorProfile();
  const { appointments, loading, error, updateStatus } = useDoctorAppointments(
    profile?.id ?? null,
  );
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<DoctorTab>("Pending");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const filtered = appointments.filter((a) => {
    if (activeTab === "Pending") return a.status === "PENDING";
    if (activeTab === "Confirmed") return a.status === "CONFIRMED";
    return a.status === "COMPLETED" || a.status === "CANCELLED";
  });

  const STATUS_TOAST: Record<AppointmentStatus, string> = {
    CONFIRMED: "Appointment confirmed.",
    CANCELLED: "Appointment cancelled.",
    COMPLETED: "Marked as completed.",
    PENDING: "Appointment updated.",
  };

  async function handleUpdate(id: number, status: AppointmentStatus) {
    setUpdatingId(id);
    try {
      await updateStatus(id, status);
      toast.success(STATUS_TOAST[status]);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't update. Try again.");
    } finally {
      setUpdatingId(null);
    }
  }

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <p className="text-sm text-ink/40">Loading appointments…</p>
      </div>
    );
  }

  // Onboarding: a fresh doctor account has no profile yet.
  if (!profile) {
    return (
      <div className="flex items-center justify-center py-32 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm bg-white p-8 rounded-2xl border border-ink/10 shadow-sm"
        >
          <p className="font-display text-2xl font-bold text-ink mb-2">Welcome to MedBook</p>
          <p className="text-sm text-ink/60 mb-6 font-light">
            Set up your doctor profile so patients can find and book with you.
          </p>
          <Link
            href="/doctor/profile"
            className="inline-block rounded-xl bg-teal hover:bg-teal-dark text-white text-sm font-semibold px-6 py-3 transition shadow-sm hover:shadow"
          >
            Set up your profile
          </Link>
        </motion.div>
      </div>
    );
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
            Appointments
          </h1>
          <p className="text-ink/60 text-sm sm:text-base">
            Review incoming requests and manage your patient schedule.
          </p>
        </motion.div>

        <div className="flex gap-2 mb-8 border-b border-ink/10 pb-2">
          {TABS.map((tab) => {
            const active = activeTab === tab;
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
                className={`relative flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                  active ? "text-teal-dark font-semibold" : "text-ink/50 hover:text-ink"
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="doctorApptTab"
                    className="absolute inset-0 bg-teal-light rounded-xl -z-10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span>{tab}</span>
                {count > 0 && (
                  <span
                    className={`text-[11px] rounded-full px-2 py-0.5 font-semibold ${
                      active
                        ? "bg-teal text-white shadow-2xs"
                        : "bg-ink/5 text-ink/50"
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
                className="h-28 bg-white rounded-2xl border border-ink/10 animate-pulse shadow-xs"
              />
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
                  updating={updatingId === appt.id}
                  onUpdate={(status) => handleUpdate(appt.id, status)}
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
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="bg-white rounded-2xl border border-ink/10 p-6 shadow-xs hover:shadow-md transition-shadow"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-teal-light text-teal-dark font-display font-semibold text-base flex items-center justify-center shrink-0">
            {initials}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-ink text-base truncate">{appt.patientName}</h3>
              <StatusBadge status={appt.status} />
            </div>
            {appt.reason && (
              <p className="text-xs text-ink/60 truncate font-light max-w-md">{appt.reason}</p>
            )}
          </div>
        </div>

        <div className="text-left sm:text-right shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-ink/5">
          <div className="flex items-center sm:justify-end gap-1.5 text-sm text-ink font-semibold mb-0.5">
            <Calendar className="w-3.5 h-3.5 text-teal" />
            <span>{formatDate(appt.startTime)}</span>
          </div>
          <div className="flex items-center sm:justify-end gap-1.5 text-xs text-ink/50">
            <Clock className="w-3.5 h-3.5 text-ink/35" />
            <span>{formatTime(appt.startTime)}</span>
          </div>
        </div>
      </div>

      {(appt.status === "PENDING" || appt.status === "CONFIRMED") && (
        <div className="flex gap-2.5 mt-5 pt-4 border-t border-ink/5">
          {appt.status === "PENDING" && (
            <>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onUpdate("CONFIRMED")}
                disabled={updating}
                className="inline-flex items-center gap-1.5 rounded-xl bg-teal hover:bg-teal-dark disabled:opacity-50 text-white text-xs font-semibold px-4 py-2.5 transition shadow-2xs"
              >
                <Check className="w-3.5 h-3.5" />
                Confirm appointment
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onUpdate("CANCELLED")}
                disabled={updating}
                className="inline-flex items-center gap-1.5 rounded-xl border border-ink/15 text-ink/70 hover:text-rust hover:border-rust/30 hover:bg-rust/5 disabled:opacity-50 text-xs font-medium px-4 py-2.5 transition"
              >
                <X className="w-3.5 h-3.5" />
                Decline
              </motion.button>
            </>
          )}
          {appt.status === "CONFIRMED" && (
            <>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onUpdate("COMPLETED")}
                disabled={updating}
                className="inline-flex items-center gap-1.5 rounded-xl bg-teal hover:bg-teal-dark disabled:opacity-50 text-white text-xs font-semibold px-4 py-2.5 transition shadow-2xs"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark completed
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onUpdate("CANCELLED")}
                disabled={updating}
                className="inline-flex items-center gap-1.5 rounded-xl border border-ink/15 text-ink/70 hover:text-rust hover:border-rust/30 hover:bg-rust/5 disabled:opacity-50 text-xs font-medium px-4 py-2.5 transition"
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </motion.button>
            </>
          )}
        </div>
      )}
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
    <span
      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${styles[status]}`}
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

