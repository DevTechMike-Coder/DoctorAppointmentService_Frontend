"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Trash2, Calendar as CalendarIcon, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useAvailability } from "@/hooks/useAvailability";
import { useDoctorProfile } from "@/hooks/useDoctorProfile";
import { ApiError } from "@/lib/api";

export default function SlotsPage() {
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useDoctorProfile();
  const { slots, loading, error, deleteSlot, createSlots } = useAvailability(profile?.id ?? null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const grouped = slots.reduce<Record<string, typeof slots>>((acc, slot) => {
    const key = new Date(slot.startTime).toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    acc[key] = acc[key] ? [...acc[key], slot] : [slot];
    return acc;
  }, {});

  async function handleDelete(slotId: number) {
    setDeletingId(slotId);
    try {
      await deleteSlot(slotId);
    } catch {
      // stays in list, user can retry
    } finally {
      setDeletingId(null);
    }
  }

  const initials =
    user?.fullName?.replace("Dr. ", "").split(" ").map((n) => n[0]).join("") ?? "DR";

  // Still resolving the doctor's profile — block on this first
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <p className="text-sm text-ink/40">Loading…</p>
      </div>
    );
  }

  // No profile yet — can't manage slots without one
  if (!profile) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <p className="text-sm text-ink/60 mb-4">
            Set up your doctor profile before adding availability.
          </p>
          <Link href="/doctor/profile" className="text-teal font-medium text-sm hover:text-teal-dark">
            Go to profile →
          </Link>
        </div>
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

        {loading && (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-white rounded-lg border border-ink/10 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="bg-white rounded-xl border border-rust/20 py-16 text-center">
            <p className="text-sm text-rust">{error}</p>
          </div>
        )}

        {!loading && !error && Object.keys(grouped).length === 0 && (
          <div className="bg-white rounded-xl border border-ink/10 py-16 text-center">
            <CalendarIcon className="w-8 h-8 text-ink/15 mx-auto mb-3" />
            <p className="text-sm text-ink/40">No slots yet. Add your first one.</p>
          </div>
        )}

        {!loading && !error && Object.keys(grouped).length > 0 && (
          <div className="space-y-6">
            {Object.entries(grouped).map(([day, daySlots]) => (
              <div key={day}>
                <p className="text-xs font-medium text-ink/40 mb-2.5">{day}</p>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  {daySlots.map((slot) => (
                    <div
                      key={slot.slotId}
                      className={`flex items-center justify-between rounded-lg border px-4 py-3 ${
                        slot.isBooked ? "bg-teal-light/40 border-teal/20" : "bg-white border-ink/10"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-medium text-ink">
                          {new Date(slot.startTime).toLocaleTimeString(undefined, {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                        {slot.isBooked && (
                          <p className="text-[11px] text-teal-dark font-medium mt-0.5">Booked</p>
                        )}
                      </div>
                      {!slot.isBooked && (
                        <button
                          onClick={() => handleDelete(slot.slotId)}
                          disabled={deletingId === slot.slotId}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-ink/30 hover:text-rust hover:bg-rust/5 transition disabled:opacity-40"
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

      {showAddModal && (
        <AddSlotsModal onClose={() => setShowAddModal(false)} onCreate={createSlots} />
      )}
    </div>
  );
}

function AddSlotsModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (payload: {
    startTime: string;
    endTime: string;
    slotDurationMinutes: number;
  }) => Promise<unknown>;
}) {
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [duration, setDuration] = useState("30");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!date || !startTime || !endTime) {
      setError("Fill in date, start, and end time.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onCreate({
        startTime: `${date}T${startTime}:00`,
        endTime: `${date}T${endTime}:00`,
        slotDurationMinutes: Number(duration),
      });
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't add slots.");
    } finally {
      setSubmitting(false);
    }
  }

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

          {error && (
            <p
              role="alert"
              className="text-sm text-rust bg-rust/5 border border-rust/20 rounded-lg px-3.5 py-2.5"
            >
              {error}
            </p>
          )}
        </div>

        <div className="flex gap-2.5 mt-6">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-ink/15 text-ink text-sm font-medium py-2.5 hover:bg-ink/5 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 rounded-lg bg-teal hover:bg-teal-dark disabled:opacity-50 text-white text-sm font-medium py-2.5 transition"
          >
            {submitting ? "Adding…" : "Add slots"}
          </button>
        </div>
      </div>
    </div>
  );
}