"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Stethoscope, Calendar, Clock, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { useDoctors } from "@/hooks/useDoctors";
import { useToast } from "@/components/Toast";
import { apiFetch, ApiError } from "@/lib/api";
import { dateKey, formatTime, formatDayLabel } from "@/lib/datetime";
import type { DoctorDto, AvailabilityDto } from "@/lib/types";

export default function DoctorProfilePage() {
  const { doctorId } = useParams<{ doctorId: string }>();
  const router = useRouter();
  const { fetchDoctorSlots } = useDoctors();
  const toast = useToast();

  const [doctor, setDoctor] = useState<DoctorDto | null>(null);
  const [slots, setSlots] = useState<AvailabilityDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeDay, setActiveDay] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [reason, setReason] = useState("");
  const [booking, setBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [doctorData, slotsData] = await Promise.all([
          apiFetch<DoctorDto>(`/doctors/${doctorId}`),
          fetchDoctorSlots(Number(doctorId)),
        ]);
        setDoctor(doctorData);
        const openSlots = slotsData.filter((s) => !s.isBooked);
        setSlots(openSlots);
        if (openSlots.length > 0) {
          setActiveDay(dateKey(openSlots[0].startTime));
        }
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Couldn't load this doctor.");
      } finally {
        setLoading(false);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId]);

  async function handleBook() {
    if (!selectedSlotId) return;
    setBooking(true);
    setBookingError(null);
    try {
      await apiFetch("/appointments", {
        method: "POST",
        body: JSON.stringify({ slotId: selectedSlotId, reason: reason || undefined }),
      });
      setBookingSuccess(true);
      toast.success("Appointment booked!");
      setTimeout(() => router.push("/appointments"), 1200);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Couldn't book this slot.";
      setBookingError(message);
      toast.error(message);
    } finally {
      setBooking(false);
    }
  }

  if (loading) return <PageState message="Loading doctor profile…" />;
  if (error || !doctor) return <PageState message={error ?? "Doctor not found."} isError />;

  const initials = doctor.fullName.replace("Dr. ", "").split(" ").map((n) => n[0]).join("");

  const days = Array.from(new Set(slots.map((s) => dateKey(s.startTime)))).sort();
  const daySlots = slots.filter((s) => dateKey(s.startTime) === activeDay);
  const morning = daySlots.filter((s) => hour(s.startTime) < 12);
  const afternoon = daySlots.filter((s) => hour(s.startTime) >= 12);
  const selectedSlot = slots.find((s) => s.id === selectedSlotId);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <div className="max-w-5xl mx-auto px-6 pt-6">
        <Link
          href="/doctors"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink/60 hover:text-ink transition group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to doctors
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 grid lg:grid-cols-[1fr_380px] gap-10">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-start gap-5 mb-8 p-6 bg-white rounded-2xl border border-ink/10 shadow-xs"
          >
            <div className="w-18 h-18 rounded-2xl bg-teal-light text-teal-dark font-display text-2xl font-bold flex items-center justify-center shrink-0">
              {initials}
            </div>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink mb-1">
                {doctor.fullName}
              </h1>
              <div className="flex items-center gap-1.5 text-sm text-teal font-medium mb-2.5">
                <Stethoscope className="w-4 h-4" />
                {doctor.specialization}
                {doctor.qualifications && (
                  <span className="text-ink/40 font-normal">· {doctor.qualifications}</span>
                )}
              </div>
              <p className="text-sm text-ink/65 leading-relaxed font-light">{doctor.bio}</p>
            </div>
          </motion.div>

          {days.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl border border-ink/10 py-12 text-center shadow-xs"
            >
              <Calendar className="w-8 h-8 text-ink/20 mx-auto mb-3" />
              <p className="text-sm text-ink/50">No open slots right now. Check back soon.</p>
            </motion.div>
          ) : (
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="bg-white rounded-2xl border border-ink/10 p-6 shadow-xs"
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-ink mb-4">
                  <Calendar className="w-4 h-4 text-teal" />
                  <span>Select a day</span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {days.map((d) => {
                    const active = activeDay === d;
                    return (
                      <button
                        key={d}
                        onClick={() => {
                          setActiveDay(d);
                          setSelectedSlotId(null);
                        }}
                        className={`relative rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                          active ? "text-white font-semibold" : "text-ink bg-canvas border border-ink/10 hover:border-teal/40"
                        }`}
                      >
                        {active && (
                          <motion.span
                            layoutId="activeDayPill"
                            className="absolute inset-0 bg-teal rounded-xl -z-10 shadow-xs"
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          />
                        )}
                        <span className="relative z-10">{formatDayLabel(d)}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="bg-white rounded-2xl border border-ink/10 p-6 shadow-xs"
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-ink mb-5">
                  <Clock className="w-4 h-4 text-teal" />
                  <span>Available times</span>
                </div>
                <div className="space-y-6">
                  {morning.length > 0 && (
                    <SlotGroup label="Morning" slots={morning} selectedSlotId={selectedSlotId} onSelect={setSelectedSlotId} />
                  )}
                  {afternoon.length > 0 && (
                    <SlotGroup label="Afternoon" slots={afternoon} selectedSlotId={selectedSlotId} onSelect={setSelectedSlotId} />
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 h-fit">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-white rounded-2xl border border-ink/10 p-6 shadow-sm"
          >
            <h2 className="font-display text-xl font-bold text-ink mb-4">Your appointment</h2>

            <div className="space-y-3 mb-6 bg-canvas/60 p-4 rounded-xl border border-ink/5">
              <SummaryRow label="Doctor" value={doctor.fullName} />
              <SummaryRow label="Date" value={selectedSlot ? formatDayLabel(dateKey(selectedSlot.startTime)) : "—"} />
              <SummaryRow label="Time" value={selectedSlot ? formatTime(selectedSlot.startTime) : "—"} />
              <SummaryRow label="Fee" value={`$${doctor.consultationFee}`} />
            </div>

            <label htmlFor="reason" className="block text-sm font-medium text-ink mb-1.5">
              Reason for visit <span className="text-ink/40 font-normal">(optional)</span>
            </label>
            <textarea
              id="reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Briefly describe symptoms or questions"
              className="w-full rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/30 outline-none focus:ring-2 focus:ring-teal focus:border-teal transition resize-none mb-4 shadow-2xs"
            />

            <AnimatePresence>
              {bookingError && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  role="alert"
                  className="text-sm text-rust bg-rust/5 border border-rust/20 rounded-xl px-3.5 py-2.5 mb-4"
                >
                  {bookingError}
                </motion.p>
              )}
              {bookingSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex items-center gap-2 text-sm text-teal-dark bg-teal-light border border-teal/20 rounded-xl px-3.5 py-2.5 mb-4 font-medium"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Booked! Redirecting to appointments…</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={selectedSlotId && !booking && !bookingSuccess ? { scale: 1.02 } : {}}
              whileTap={selectedSlotId && !booking && !bookingSuccess ? { scale: 0.98 } : {}}
              onClick={handleBook}
              disabled={!selectedSlotId || booking || bookingSuccess}
              className="w-full rounded-xl bg-teal hover:bg-teal-dark disabled:bg-ink/10 disabled:text-ink/35 disabled:cursor-not-allowed text-white text-sm font-semibold py-3 transition shadow-sm hover:shadow"
            >
              {booking ? "Booking…" : selectedSlotId ? "Confirm booking" : "Select a time slot"}
            </motion.button>
          </motion.div>
        </aside>
      </div>
    </motion.div>
  );
}

function SlotGroup({
  label,
  slots,
  selectedSlotId,
  onSelect,
}: {
  label: string;
  slots: AvailabilityDto[];
  selectedSlotId: number | null;
  onSelect: (slotId: number) => void;
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-ink/45 uppercase tracking-wider mb-2.5">{label}</p>
      <div className="flex flex-wrap gap-2.5">
        {slots.map((s) => {
          const isSelected = selectedSlotId === s.id;
          return (
            <motion.button
              key={s.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(s.id)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                isSelected
                  ? "bg-teal text-white border-teal shadow-xs font-semibold"
                  : "bg-white text-ink border-ink/15 hover:border-teal/50 hover:bg-teal-light/20"
              }`}
            >
              {formatTime(s.startTime)}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-ink/50">{label}</span>
      <span className="text-ink font-semibold">{value}</span>
    </div>
  );
}

function PageState({ message, isError }: { message: string; isError?: boolean }) {
  return (
    <div className="flex items-center justify-center py-32">
      <p className={`text-sm font-medium ${isError ? "text-rust" : "text-ink/40"}`}>{message}</p>
    </div>
  );
}

function hour(iso: string): number {
  return new Date(iso).getHours();
}