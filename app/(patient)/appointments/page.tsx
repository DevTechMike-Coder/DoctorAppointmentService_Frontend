"use client";

import { useState } from "react";
import { Calendar, Clock, Stethoscope, X } from "lucide-react";

type Status = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

const PLACEHOLDER_APPOINTMENTS: {
  id: number;
  doctorName: string;
  specialization: string;
  date: string;
  time: string;
  status: Status;
  reason: string;
}[] = [
  {
    id: 1,
    doctorName: "Dr. Amara Chen",
    specialization: "Cardiology",
    date: "Mon, Aug 24",
    time: "9:00 AM",
    status: "CONFIRMED",
    reason: "Follow-up on blood pressure medication",
  },
  {
    id: 2,
    doctorName: "Dr. Lena Kovacs",
    specialization: "General Practice",
    date: "Wed, Aug 26",
    time: "11:00 AM",
    status: "PENDING",
    reason: "Annual check-up",
  },
  {
    id: 3,
    doctorName: "Dr. Femi Okonkwo",
    specialization: "Dermatology",
    date: "Aug 12",
    time: "2:00 PM",
    status: "COMPLETED",
    reason: "Skin rash evaluation",
  },
  {
    id: 4,
    doctorName: "Dr. Tunde Bakare",
    specialization: "Psychiatry",
    date: "Aug 5",
    time: "3:30 PM",
    status: "CANCELLED",
    reason: "Initial consultation",
  },
];

const TABS = ["Upcoming", "Past", "Cancelled"] as const;

export default function AppointmentsPage() {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("Upcoming");

  const filtered = PLACEHOLDER_APPOINTMENTS.filter((a) => {
    if (activeTab === "Upcoming") return a.status === "PENDING" || a.status === "CONFIRMED";
    if (activeTab === "Past") return a.status === "COMPLETED";
    return a.status === "CANCELLED";
  });

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-ink/10 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-display text-xl text-ink">MedBook</span>
          <div className="w-8 h-8 rounded-full bg-teal-light flex items-center justify-center text-teal-dark text-xs font-medium">
            JD
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="font-display text-3xl text-ink mb-1.5">Your appointments</h1>
          <p className="text-ink/60 text-sm">Manage upcoming visits and review past ones.</p>
        </div>

        {/* Tabs */}
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

        {/* List */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-ink/10 py-16 text-center">
            <Calendar className="w-8 h-8 text-ink/15 mx-auto mb-3" />
            <p className="text-sm text-ink/40">Nothing here yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((appt) => (
              <AppointmentRow key={appt.id} appt={appt} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AppointmentRow({
  appt,
}: {
  appt: (typeof PLACEHOLDER_APPOINTMENTS)[number];
}) {
  const initials = appt.doctorName.replace("Dr. ", "").split(" ").map((n) => n[0]).join("");

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
        <div className="flex items-center gap-1.5 text-xs text-teal font-medium mb-1.5">
          <Stethoscope className="w-3.5 h-3.5" />
          {appt.specialization}
        </div>
        <p className="text-sm text-ink/55 truncate">{appt.reason}</p>
      </div>

      <div className="text-right shrink-0">
        <div className="flex items-center justify-end gap-1.5 text-sm text-ink font-medium mb-0.5">
          <Calendar className="w-3.5 h-3.5 text-ink/30" />
          {appt.date}
        </div>
        <div className="flex items-center justify-end gap-1.5 text-xs text-ink/50">
          <Clock className="w-3.5 h-3.5 text-ink/30" />
          {appt.time}
        </div>
      </div>

      {(appt.status === "PENDING" || appt.status === "CONFIRMED") && (
        <button
          className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-ink/30 hover:text-rust hover:bg-rust/5 transition"
          title="Cancel appointment"
        >
          <X className="w-4 h-4" />
        </button>
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