"use client";

import { useState } from "react";
import { Calendar, Clock, Check, X, CheckCheck } from "lucide-react";

type Status = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

const PLACEHOLDER_APPOINTMENTS: {
  id: number;
  patientName: string;
  date: string;
  day: string;
  time: string;
  status: Status;
  reason: string;
}[] = [
  {
    id: 1,
    patientName: "James Okafor",
    date: "Aug 24",
    day: "Mon",
    time: "9:00 AM",
    status: "PENDING",
    reason: "Follow-up on blood pressure medication",
  },
  {
    id: 2,
    patientName: "Sophia Martins",
    date: "Aug 24",
    day: "Mon",
    time: "10:30 AM",
    status: "CONFIRMED",
    reason: "Chest tightness during exercise",
  },
  {
    id: 3,
    patientName: "Daniel Reyes",
    date: "Aug 25",
    day: "Tue",
    time: "11:00 AM",
    status: "PENDING",
    reason: "Annual check-up",
  },
  {
    id: 4,
    patientName: "Hannah Cole",
    date: "Aug 12",
    day: "Wed",
    time: "2:00 PM",
    status: "COMPLETED",
    reason: "Post-surgery follow-up",
  },
  {
    id: 5,
    patientName: "Michael Osei",
    date: "Aug 5",
    day: "Tue",
    time: "3:30 PM",
    status: "CANCELLED",
    reason: "Initial consultation",
  },
];

const TABS = ["Pending", "Confirmed", "Past"] as const;

export default function DoctorAppointmentsPage() {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("Pending");
  const [appointments, setAppointments] = useState(PLACEHOLDER_APPOINTMENTS);

  const filtered = appointments.filter((a) => {
    if (activeTab === "Pending") return a.status === "PENDING";
    if (activeTab === "Confirmed") return a.status === "CONFIRMED";
    return a.status === "COMPLETED" || a.status === "CANCELLED";
  });

  function updateStatus(id: number, status: Status) {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  }

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-ink/10 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-display text-xl text-ink">MedBook</span>
          <div className="w-8 h-8 rounded-full bg-teal-light flex items-center justify-center text-teal-dark text-xs font-medium">
            AC
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="font-display text-3xl text-ink mb-1.5">Appointments</h1>
          <p className="text-ink/60 text-sm">Review requests and manage your schedule.</p>
        </div>

        <div className="flex gap-1 mb-6 border-b border-ink/10">
          {TABS.map((tab) => {
            const count = appointments.filter((a) =>
              tab === "Pending"
                ? a.status === "PENDING"
                : tab === "Confirmed"
                ? a.status === "CONFIRMED"
                : a.status === "COMPLETED" || a.status === "CANCELLED"
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
                      activeTab === tab ? "bg-teal-light text-teal-dark" : "bg-ink/5 text-ink/40"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-ink/10 py-16 text-center">
            <Calendar className="w-8 h-8 text-ink/15 mx-auto mb-3" />
            <p className="text-sm text-ink/40">Nothing here right now.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((appt) => (
              <AppointmentRow key={appt.id} appt={appt} onUpdateStatus={updateStatus} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AppointmentRow({
  appt,
  onUpdateStatus,
}: {
  appt: (typeof PLACEHOLDER_APPOINTMENTS)[number];
  onUpdateStatus: (id: number, status: Status) => void;
}) {
  const initials = appt.patientName.split(" ").map((n) => n[0]).join("");

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
          <p className="text-sm text-ink/55 truncate">{appt.reason}</p>
        </div>

        <div className="text-right shrink-0">
          <div className="flex items-center justify-end gap-1.5 text-sm text-ink font-medium mb-0.5">
            <Calendar className="w-3.5 h-3.5 text-ink/30" />
            {appt.day}, {appt.date}
          </div>
          <div className="flex items-center justify-end gap-1.5 text-xs text-ink/50">
            <Clock className="w-3.5 h-3.5 text-ink/30" />
            {appt.time}
          </div>
        </div>
      </div>

      {(appt.status === "PENDING" || appt.status === "CONFIRMED") && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-ink/5">
          {appt.status === "PENDING" && (
            <>
              <button
                onClick={() => onUpdateStatus(appt.id, "CONFIRMED")}
                className="inline-flex items-center gap-1.5 rounded-lg bg-teal hover:bg-teal-dark text-white text-xs font-medium px-3.5 py-2 transition"
              >
                <Check className="w-3.5 h-3.5" />
                Confirm
              </button>
              <button
                onClick={() => onUpdateStatus(appt.id, "CANCELLED")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-ink/15 text-ink/60 hover:text-rust hover:border-rust/30 text-xs font-medium px-3.5 py-2 transition"
              >
                <X className="w-3.5 h-3.5" />
                Decline
              </button>
            </>
          )}
          {appt.status === "CONFIRMED" && (
            <>
              <button
                onClick={() => onUpdateStatus(appt.id, "COMPLETED")}
                className="inline-flex items-center gap-1.5 rounded-lg bg-teal hover:bg-teal-dark text-white text-xs font-medium px-3.5 py-2 transition"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark completed
              </button>
              <button
                onClick={() => onUpdateStatus(appt.id, "CANCELLED")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-ink/15 text-ink/60 hover:text-rust hover:border-rust/30 text-xs font-medium px-3.5 py-2 transition"
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

function StatusBadge({ status }: { status: Status }) {
  const styles: Record<Status, string> = {
    PENDING: "bg-amber-50 text-amber-700",
    CONFIRMED: "bg-teal-light text-teal-dark",
    CANCELLED: "bg-rust/5 text-rust",
    COMPLETED: "bg-ink/5 text-ink/50",
  };
  const labels: Record<Status, string> = {
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