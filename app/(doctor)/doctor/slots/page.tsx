"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Trash2, Calendar as CalendarIcon, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAvailability } from "@/hooks/useAvailability";
import { useDoctorProfile } from "@/hooks/useDoctorProfile";
import { useToast } from "@/components/Toast";
import { ApiError } from "@/lib/api";

export default function SlotsPage() {
  const { profile, loading: profileLoading } = useDoctorProfile();
  const { slots, loading, error, deleteSlot, createSlots } = useAvailability(profile?.id ?? null);
  const toast = useToast();
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

  async function handleDelete(id: number) {
    setDeletingId(id);
    try {
      await deleteSlot(id);
      toast.success("Slot removed.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't remove slot.");
    } finally {
      setDeletingId(null);
    }
  }

  // Still resolving the doctor's profile — block on this first
  if (profileLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <p className="text-sm text-ink/40">Loading availability…</p>
      </div>
    );
  }

  // No profile yet — can't manage slots without one
  if (!profile) {
    return (
      <div className="flex items-center justify-center py-32 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm bg-white p-8 rounded-2xl border border-ink/10 shadow-sm"
        >
          <p className="font-display text-xl font-bold text-ink mb-2">Profile required</p>
          <p className="text-sm text-ink/60 mb-6 font-light">
            Set up your doctor profile before adding availability.
          </p>
          <Link
            href="/doctor/profile"
            className="inline-block rounded-xl bg-teal hover:bg-teal-dark text-white text-sm font-semibold px-6 py-3 transition shadow-sm hover:shadow"
          >
            Go to profile
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
          className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="font-display text-3xl sm:text-4xl text-ink mb-1.5 font-bold tracking-tight">
              Your availability
            </h1>
            <p className="text-ink/60 text-sm sm:text-base">
              Add open slots for patients to book consultations.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-teal hover:bg-teal-dark text-white text-sm font-semibold px-5 py-3 transition shadow-sm hover:shadow shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add slots</span>
          </motion.button>
        </motion.div>

        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 bg-white rounded-2xl border border-ink/10 animate-pulse shadow-xs" />
            ))}
          </div>
        )}

        {!loading && error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border border-rust/20 py-16 text-center shadow-xs"
          >
            <p className="text-sm text-rust font-medium">{error}</p>
          </motion.div>
        )}

        {!loading && !error && Object.keys(grouped).length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border border-ink/10 py-16 text-center shadow-xs"
          >
            <CalendarIcon className="w-8 h-8 text-ink/15 mx-auto mb-3" />
            <p className="text-sm text-ink/40 font-light">No slots configured yet. Click &quot;Add slots&quot; above.</p>
          </motion.div>
        )}

        {!loading && !error && Object.keys(grouped).length > 0 && (
          <div className="space-y-8">
            {Object.entries(grouped).map(([day, daySlots]) => (
              <motion.div
                key={day}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="bg-white rounded-2xl border border-ink/10 p-6 shadow-xs"
              >
                <p className="text-sm font-bold text-ink mb-4 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-teal" />
                  <span>{day}</span>
                </p>
                <motion.div layout className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <AnimatePresence mode="popLayout">
                    {daySlots.map((slot) => (
                      <motion.div
                        key={slot.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
                        className={`flex items-center justify-between rounded-xl border px-4 py-3 transition-colors ${
                          slot.isBooked ? "bg-teal-light/50 border-teal/30" : "bg-canvas/50 border-ink/10"
                        }`}
                      >
                        <div>
                          <p className="text-sm font-semibold text-ink">
                            {new Date(slot.startTime).toLocaleTimeString(undefined, {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </p>
                          {slot.isBooked && (
                            <p className="text-[11px] text-teal-dark font-semibold mt-0.5">Booked</p>
                          )}
                        </div>
                        {!slot.isBooked && (
                          <motion.button
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.85 }}
                            onClick={() => handleDelete(slot.id)}
                            disabled={deletingId === slot.id}
                            className="w-7 h-7 rounded-full flex items-center justify-center text-ink/30 hover:text-rust hover:bg-rust/10 transition disabled:opacity-40"
                            title="Remove slot"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </motion.button>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showAddModal && (
          <AddSlotsModal
            onClose={() => setShowAddModal(false)}
            onCreate={async (payload) => {
              const created = await createSlots(payload);
              toast.success(
                created.length === 1 ? "1 slot added." : `${created.length} slots added.`
              );
              return created;
            }}
          />
        )}
      </AnimatePresence>
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
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Couldn't add slots."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-ink/50 backdrop-blur-xs"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl relative z-10 border border-ink/10"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl font-bold text-ink">Add availability</h2>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-ink/40 hover:bg-ink/5 transition"
          >
            <X className="w-4 h-4" />
          </motion.button>
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
              className="w-full rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:ring-2 focus:ring-teal focus:border-teal transition shadow-2xs"
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
                className="w-full rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:ring-2 focus:ring-teal focus:border-teal transition shadow-2xs"
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
                className="w-full rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:ring-2 focus:ring-teal focus:border-teal transition shadow-2xs"
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
              className="w-full rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:ring-2 focus:ring-teal focus:border-teal transition shadow-2xs"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes</option>
            </select>
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                role="alert"
                className="text-sm text-rust bg-rust/5 border border-rust/20 rounded-xl px-3.5 py-2.5"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className="flex gap-2.5 mt-6">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-ink/15 text-ink text-sm font-medium py-2.5 hover:bg-ink/5 transition"
          >
            Cancel
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 rounded-xl bg-teal hover:bg-teal-dark disabled:opacity-50 text-white text-sm font-semibold py-2.5 transition shadow-sm hover:shadow"
          >
            {submitting ? "Adding…" : "Add slots"}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}