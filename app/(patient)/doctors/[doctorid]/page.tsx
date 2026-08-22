"use client";

import { useState } from "react";
import { ArrowLeft, Stethoscope, Calendar, Clock } from "lucide-react";
import Link from "next/link";

const DOCTOR = {
  fullName: "Dr. Amara Chen",
  specialization: "Cardiology",
  qualifications: "MD, FACC",
  bio: "15 years treating complex cardiac conditions with a focus on preventive care. Dr. Chen takes time to explain findings clearly and involves patients in every decision about their treatment.",
  consultationFee: 120,
};

const DAYS = [
  { label: "Mon", date: "24" },
  { label: "Tue", date: "25" },
  { label: "Wed", date: "26" },
  { label: "Thu", date: "27" },
  { label: "Fri", date: "28" },
];

const SLOTS_BY_DAY: Record<string, { id: number; time: string; period: "Morning" | "Afternoon" }[]> = {
  "24": [
    { id: 1, time: "9:00 AM", period: "Morning" },
    { id: 2, time: "9:30 AM", period: "Morning" },
    { id: 3, time: "10:30 AM", period: "Morning" },
    { id: 4, time: "2:00 PM", period: "Afternoon" },
    { id: 5, time: "3:30 PM", period: "Afternoon" },
  ],
  "25": [
    { id: 6, time: "9:00 AM", period: "Morning" },
    { id: 7, time: "11:00 AM", period: "Morning" },
    { id: 8, time: "1:00 PM", period: "Afternoon" },
  ],
  "26": [],
  "27": [
    { id: 9, time: "10:00 AM", period: "Morning" },
    { id: 10, time: "2:30 PM", period: "Afternoon" },
    { id: 11, time: "4:00 PM", period: "Afternoon" },
  ],
  "28": [
    { id: 12, time: "9:30 AM", period: "Morning" },
  ],
};

export default function DoctorProfilePage() {
  const [activeDay, setActiveDay] = useState("24");
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  const initials = DOCTOR.fullName.replace("Dr. ", "").split(" ").map((n) => n[0]).join("");
  const slots = SLOTS_BY_DAY[activeDay] ?? [];
  const morning = slots.filter((s) => s.period === "Morning");
  const afternoon = slots.filter((s) => s.period === "Afternoon");

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-ink/10 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <Link href="/doctors" className="inline-flex items-center gap-1.5 text-sm text-ink/60 hover:text-ink transition">
            <ArrowLeft className="w-4 h-4" />
            Back to doctors
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10 grid lg:grid-cols-[1fr_360px] gap-10">
        {/* Left: doctor info + calendar */}
        <div>
          <div className="flex items-start gap-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-teal-light text-teal-dark font-display text-xl flex items-center justify-center shrink-0">
              {initials}
            </div>
            <div>
              <h1 className="font-display text-2xl text-ink mb-1">{DOCTOR.fullName}</h1>
              <div className="flex items-center gap-1.5 text-sm text-teal font-medium mb-2.5">
                <Stethoscope className="w-4 h-4" />
                {DOCTOR.specialization}
                <span className="text-ink/30 font-normal">· {DOCTOR.qualifications}</span>
              </div>
              <p className="text-sm text-ink/60 leading-relaxed">{DOCTOR.bio}</p>
            </div>
          </div>

          {/* Day selector */}
          <div className="mb-6">
            <div className="flex items-center gap-1.5 text-sm font-medium text-ink mb-3">
              <Calendar className="w-4 h-4 text-ink/40" />
              Select a day
            </div>
            <div className="grid grid-cols-5 gap-2">
              {DAYS.map((d) => {
                const hasSlots = (SLOTS_BY_DAY[d.date] ?? []).length > 0;
                const active = activeDay === d.date;
                return (
                  <button
                    key={d.date}
                    disabled={!hasSlots}
                    onClick={() => {
                      setActiveDay(d.date);
                      setSelectedSlot(null);
                    }}
                    className={`rounded-lg py-3 text-center transition border ${
                      active
                        ? "bg-teal text-white border-teal"
                        : hasSlots
                        ? "bg-white text-ink border-ink/10 hover:border-teal/40"
                        : "bg-white text-ink/25 border-ink/5 cursor-not-allowed"
                    }`}
                  >
                    <div className="text-xs font-medium">{d.label}</div>
                    <div className="font-display text-lg leading-tight">{d.date}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time slots */}
          <div>
            <div className="flex items-center gap-1.5 text-sm font-medium text-ink mb-3">
              <Clock className="w-4 h-4 text-ink/40" />
              Available times
            </div>

            {slots.length === 0 ? (
              <div className="bg-white rounded-lg border border-ink/10 py-10 text-center">
                <p className="text-sm text-ink/40">No open slots this day. Try another.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {morning.length > 0 && (
                  <SlotGroup
                    label="Morning"
                    slots={morning}
                    selectedSlot={selectedSlot}
                    onSelect={setSelectedSlot}
                  />
                )}
                {afternoon.length > 0 && (
                  <SlotGroup
                    label="Afternoon"
                    slots={afternoon}
                    selectedSlot={selectedSlot}
                    onSelect={setSelectedSlot}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: booking summary */}
        <aside className="lg:sticky lg:top-10 h-fit">
          <div className="bg-white rounded-xl border border-ink/10 p-6">
            <h2 className="font-display text-lg text-ink mb-4">Your appointment</h2>

            <div className="space-y-3 mb-5">
              <SummaryRow label="Doctor" value={DOCTOR.fullName} />
              <SummaryRow
                label="Date"
                value={
                  selectedSlot
                    ? `${DAYS.find((d) => d.date === activeDay)?.label}, Aug ${activeDay}`
                    : "—"
                }
              />
              <SummaryRow
                label="Time"
                value={slots.find((s) => s.id === selectedSlot)?.time ?? "—"}
              />
              <SummaryRow label="Fee" value={`$${DOCTOR.consultationFee}`} />
            </div>

            <label htmlFor="reason" className="block text-sm font-medium text-ink mb-1.5">
              Reason for visit <span className="text-ink/30 font-normal">(optional)</span>
            </label>
            <textarea
              id="reason"
              rows={3}
              placeholder="Briefly describe what you'd like to discuss"
              className="w-full rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/30 outline-none focus:ring-2 focus:ring-teal focus:border-teal transition resize-none mb-5"
            />

            <button
              disabled={!selectedSlot}
              className="w-full rounded-lg bg-teal hover:bg-teal-dark disabled:bg-ink/10 disabled:text-ink/30 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 transition"
            >
              {selectedSlot ? "Confirm booking" : "Select a time slot"}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SlotGroup({
  label,
  slots,
  selectedSlot,
  onSelect,
}: {
  label: string;
  slots: { id: number; time: string }[];
  selectedSlot: number | null;
  onSelect: (id: number) => void;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-ink/40 mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {slots.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
              selectedSlot === s.id
                ? "bg-teal text-white border-teal"
                : "bg-white text-ink border-ink/10 hover:border-teal/40"
            }`}
          >
            {s.time}
          </button>
        ))}
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-ink/50">{label}</span>
      <span className="text-ink font-medium">{value}</span>
    </div>
  );
}