"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Stethoscope, Calendar, Clock } from "lucide-react";
import Link from "next/link";
import { useDoctors } from "@/hooks/useDoctors";
import { apiFetch, ApiError } from "@/lib/api";
import type { DoctorDto, AvailabilityDto } from "@/lib/types";

export default function DoctorProfilePage() {
  const { doctorId } = useParams<{ doctorId: string }>();
  const router = useRouter();
  const { fetchDoctorSlots } = useDoctors();

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
      setTimeout(() => router.push("/appointments"), 1200);
    } catch (err) {
      setBookingError(err instanceof ApiError ? err.message : "Couldn't book this slot.");
    } finally {
      setBooking(false);
    }
  }

  if (loading) return <PageState message="Loading…" />;
  if (error || !doctor) return <PageState message={error ?? "Doctor not found."} isError />;

  const initials = doctor.fullName.replace("Dr. ", "").split(" ").map((n) => n[0]).join("");

  const days = Array.from(new Set(slots.map((s) => dateKey(s.startTime)))).sort();
  const daySlots = slots.filter((s) => dateKey(s.startTime) === activeDay);
  const morning = daySlots.filter((s) => hour(s.startTime) < 12);
  const afternoon = daySlots.filter((s) => hour(s.startTime) >= 12);
  const selectedSlot = slots.find((s) => s.id === selectedSlotId);

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
        <div>
          <div className="flex items-start gap-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-teal-light text-teal-dark font-display text-xl flex items-center justify-center shrink-0">
              {initials}
            </div>
            <div>
              <h1 className="font-display text-2xl text-ink mb-1">{doctor.fullName}</h1>
              <div className="flex items-center gap-1.5 text-sm text-teal font-medium mb-2.5">
                <Stethoscope className="w-4 h-4" />
                {doctor.specialization}
                {doctor.qualifications && (
                  <span className="text-ink/30 font-normal">· {doctor.qualifications}</span>
                )}
              </div>
              <p className="text-sm text-ink/60 leading-relaxed">{doctor.bio}</p>
            </div>
          </div>

          {days.length === 0 ? (
            <div className="bg-white rounded-lg border border-ink/10 py-10 text-center">
              <p className="text-sm text-ink/40">No open slots right now. Check back soon.</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className="flex items-center gap-1.5 text-sm font-medium text-ink mb-3">
                  <Calendar className="w-4 h-4 text-ink/40" />
                  Select a day
                </div>
                <div className="flex flex-wrap gap-2">
                  {days.map((d) => (
                    <button
                      key={d}
                      onClick={() => {
                        setActiveDay(d);
                        setSelectedSlotId(null);
                      }}
                      className={`rounded-lg px-4 py-2.5 text-sm font-medium border transition ${
                        activeDay === d
                          ? "bg-teal text-white border-teal"
                          : "bg-white text-ink border-ink/10 hover:border-teal/40"
                      }`}
                    >
                      {formatDayLabel(d)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-sm font-medium text-ink mb-3">
                  <Clock className="w-4 h-4 text-ink/40" />
                  Available times
                </div>
                <div className="space-y-5">
                  {morning.length > 0 && (
                    <SlotGroup label="Morning" slots={morning} selectedSlotId={selectedSlotId} onSelect={setSelectedSlotId} />
                  )}
                  {afternoon.length > 0 && (
                    <SlotGroup label="Afternoon" slots={afternoon} selectedSlotId={selectedSlotId} onSelect={setSelectedSlotId} />
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <aside className="lg:sticky lg:top-10 h-fit">
          <div className="bg-white rounded-xl border border-ink/10 p-6">
            <h2 className="font-display text-lg text-ink mb-4">Your appointment</h2>

            <div className="space-y-3 mb-5">
              <SummaryRow label="Doctor" value={doctor.fullName} />
              <SummaryRow label="Date" value={selectedSlot ? formatDayLabel(dateKey(selectedSlot.startTime)) : "—"} />
              <SummaryRow label="Time" value={selectedSlot ? formatTime(selectedSlot.startTime) : "—"} />
              <SummaryRow label="Fee" value={`$${doctor.consultationFee}`} />
            </div>

            <label htmlFor="reason" className="block text-sm font-medium text-ink mb-1.5">
              Reason for visit <span className="text-ink/30 font-normal">(optional)</span>
            </label>
            <textarea
              id="reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Briefly describe what you'd like to discuss"
              className="w-full rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/30 outline-none focus:ring-2 focus:ring-teal focus:border-teal transition resize-none mb-4"
            />

            {bookingError && (
              <p role="alert" className="text-sm text-rust bg-rust/5 border border-rust/20 rounded-lg px-3.5 py-2.5 mb-4">
                {bookingError}
              </p>
            )}
            {bookingSuccess && (
              <p className="text-sm text-teal-dark bg-teal-light border border-teal/20 rounded-lg px-3.5 py-2.5 mb-4">
                Booked! Redirecting…
              </p>
            )}

            <button
              onClick={handleBook}
              disabled={!selectedSlotId || booking || bookingSuccess}
              className="w-full rounded-lg bg-teal hover:bg-teal-dark disabled:bg-ink/10 disabled:text-ink/30 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 transition"
            >
              {booking ? "Booking…" : selectedSlotId ? "Confirm booking" : "Select a time slot"}
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
      <p className="text-xs font-medium text-ink/40 mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {slots.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
              selectedSlotId === s.id
                ? "bg-teal text-white border-teal"
                : "bg-white text-ink border-ink/10 hover:border-teal/40"
            }`}
          >
            {formatTime(s.startTime)}
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

function PageState({ message, isError }: { message: string; isError?: boolean }) {
  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center">
      <p className={`text-sm ${isError ? "text-rust" : "text-ink/40"}`}>{message}</p>
    </div>
  );
}

function dateKey(iso: string): string {
  return iso.split("T")[0];
}

function hour(iso: string): number {
  return new Date(iso).getHours();
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function formatDayLabel(dateKeyStr: string): string {
  const date = new Date(`${dateKeyStr}T00:00:00`);
  return date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}