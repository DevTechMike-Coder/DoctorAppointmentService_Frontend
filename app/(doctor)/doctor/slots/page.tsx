"use client";

import { useState } from "react";
import { Plus, Trash2, Calendar as CalendarIcon, X } from "lucide-react";

type Slot = {
  id: number;
  date: string;
  day: string;
  time: string;
  isBooked: boolean;
};

const INITIAL_SLOTS: Slot[] = [
  { id: 1, date: "Aug 24", day: "Mon", time: "9:00 AM", isBooked: true },
  { id: 2, date: "Aug 24", day: "Mon", time: "9:30 AM", isBooked: false },
  { id: 3, date: "Aug 24", day: "Mon", time: "10:30 AM", isBooked: false },
  { id: 4, date: "Aug 25", day: "Tue", time: "9:00 AM", isBooked: false },
  { id: 5, date: "Aug 25", day: "Tue", time: "11:00 AM", isBooked: true },
  { id: 6, date: "Aug 27", day: "Thu", time: "10:00 AM", isBooked: false },
  { id: 7, date: "Aug 27", day: "Thu", time: "2:30 PM", isBooked: false },
];

export default function SlotsPage() {
  const [slots, setSlots] = useState(INITIAL_SLOTS);
  const [showAddModal, setShowAddModal] = useState(false);

  const grouped = slots.reduce<Record<string, Slot[]>>((acc, slot) => {
    const key = `${slot.day} · ${slot.date}`;
    acc[key] = acc[key] ? [...acc[key], slot] : [slot];
    return acc;
  }, {});

  function removeSlot(id: number) {
    setSlots((prev) => prev.filter((s) => s.id !== id));
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
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl text-ink mb-1.5">Your availability</h1>
            <p className="text-ink/60 text-sm">Add open slots for patients to book.</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-teal hover:bg-teal-dark text-white text-sm font-medium px-4 py-2.5 transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add slots
          </button>
        </div>

        {Object.keys(grouped).length === 0 ? (
          <div className="bg-white rounded-xl border border-ink/10 py-16 text-center">
            <CalendarIcon className="w-8 h-8 text-ink/15 mx-auto mb-3" />
            <p className="text-sm text-ink/40">No slots yet. Add your first one.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([day, daySlots]) => (
              <div key={day}>
                <p className="text-xs font-medium text-ink/40 mb-2.5">{day}</p>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  {daySlots.map((slot) => (
                    <div
                      key={slot.id}
                      className={`flex items-center justify-between rounded-lg border px-4 py-3 ${
                        slot.isBooked
                          ? "bg-teal-light/40 border-teal/20"
                          : "bg-white border-ink/10"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-medium text-ink">{slot.time}</p>
                        {slot.isBooked && (
                          <p className="text-[11px] text-teal-dark font-medium mt-0.5">
                            Booked
                          </p>
                        )}
                      </div>
                      {!slot.isBooked && (
                        <button
                          onClick={() => removeSlot(slot.id)}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-ink/30 hover:text-rust hover:bg-rust/5 transition"
                          title="Remove slot"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddModal && <AddSlotsModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}

function AddSlotsModal({ onClose }: { onClose: () => void }) {
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [duration, setDuration] = useState("30");

  return (
    <div className="fixed inset-0 bg-ink/40 flex items-center justify-center px-6 z-50">
      <div className="bg-white rounded-xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg text-ink">Add availability</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-ink/40 hover:bg-ink/5 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-ink mb-1.5">
              Date
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:ring-2 focus:ring-teal focus:border-teal transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-ink mb-1.5">
                Start time
              </label>
              <input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:ring-2 focus:ring-teal focus:border-teal transition"
              />
            </div>
            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-ink mb-1.5">
                End time
              </label>
              <input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:ring-2 focus:ring-teal focus:border-teal transition"
              />
            </div>
          </div>

          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-ink mb-1.5">
              Slot length
            </label>
            <select
              id="duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:ring-2 focus:ring-teal focus:border-teal transition"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes</option>
            </select>
          </div>

          <p className="text-xs text-ink/40 leading-relaxed">
            This will split the time range into individual bookable slots.
          </p>
        </div>

        <div className="flex gap-2.5 mt-6">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-ink/15 text-ink text-sm font-medium py-2.5 hover:bg-ink/5 transition"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-lg bg-teal hover:bg-teal-dark text-white text-sm font-medium py-2.5 transition"
          >
            Add slots
          </button>
        </div>
      </div>
    </div>
  );
}