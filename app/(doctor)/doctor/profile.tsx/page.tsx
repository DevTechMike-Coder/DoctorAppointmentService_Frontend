"use client";

import { useState, useEffect } from "react";
import { Camera, Stethoscope } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import type { DoctorDto } from "@/lib/types";

const SPECIALTIES = [
  "Cardiology",
  "Dermatology",
  "Pediatrics",
  "Orthopedics",
  "General Practice",
  "Psychiatry",
  "Neurology",
  "Oncology",
];

export default function DoctorProfilePage() {
  const [fullName, setFullName] = useState("Dr. Amara Chen");
  const [specialization, setSpecialization] = useState("Cardiology");
  const [qualifications, setQualifications] = useState("MD, FACC");
  const [bio, setBio] = useState(
    "15 years treating complex cardiac conditions with a focus on preventive care."
  );
  const [consultationFee, setConsultationFee] = useState("120");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const doctorData = await apiFetch<DoctorDto>("/doctors/me");
        if (doctorData) {
          setFullName(doctorData.fullName);
          setSpecialization(doctorData.specialization);
          setQualifications(doctorData.qualifications || "");
          setBio(doctorData.bio || "");
          setConsultationFee(String(doctorData.consultationFee));
        }
      } catch {
        // Fallback to initial values
      }
    }
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setError(null);
    try {
      await apiFetch("/doctors/profile", {
        method: "PUT",
        body: JSON.stringify({
          fullName,
          specialization,
          qualifications,
          bio,
          consultationFee: Number(consultationFee),
        }),
      });
      setSaveSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save changes.");
    } finally {
      setSaving(false);
    }
  }

  const initials = fullName.replace("Dr. ", "").split(" ").map((n) => n[0]).join("");

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-ink/10 bg-white">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-display text-xl text-ink">MedBook</span>
          <div className="w-8 h-8 rounded-full bg-teal-light flex items-center justify-center text-teal-dark text-xs font-medium">
            {initials}
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="font-display text-3xl text-ink mb-1.5">Your profile</h1>
          <p className="text-ink/60 text-sm">
            This is what patients see when they&apos;re deciding to book with you.
          </p>
        </div>

        <div className="grid lg:grid-cols-[220px_1fr] gap-8">
          {/* Avatar + preview card */}
          <div>
            <div className="bg-white rounded-xl border border-ink/10 p-5 text-center">
              <div className="relative w-20 h-20 mx-auto mb-4">
                <div className="w-20 h-20 rounded-full bg-teal-light text-teal-dark font-display text-2xl flex items-center justify-center">
                  {initials}
                </div>
                <button
                  type="button"
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border border-ink/10 flex items-center justify-center text-ink/50 hover:text-teal transition"
                  title="Change photo"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>
              <h3 className="font-display text-base text-ink mb-1">{fullName || "Your name"}</h3>
              <div className="inline-flex items-center gap-1 text-xs text-teal font-medium">
                <Stethoscope className="w-3.5 h-3.5" />
                {specialization || "Specialty"}
              </div>
              <p className="text-xs text-ink/40 mt-3 leading-relaxed">
                Live preview of your public listing
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-ink mb-1.5">
                Full name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:ring-2 focus:ring-teal focus:border-teal transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="specialization" className="block text-sm font-medium text-ink mb-1.5">
                  Specialty
                </label>
                <select
                  id="specialization"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:ring-2 focus:ring-teal focus:border-teal transition"
                >
                  {SPECIALTIES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="qualifications" className="block text-sm font-medium text-ink mb-1.5">
                  Qualifications
                </label>
                <input
                  id="qualifications"
                  type="text"
                  value={qualifications}
                  onChange={(e) => setQualifications(e.target.value)}
                  placeholder="MD, FACC"
                  className="w-full rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/30 outline-none focus:ring-2 focus:ring-teal focus:border-teal transition"
                />
              </div>
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-ink mb-1.5">
                Bio
              </label>
              <textarea
                id="bio"
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell patients about your experience and approach to care"
                className="w-full rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/30 outline-none focus:ring-2 focus:ring-teal focus:border-teal transition resize-none"
              />
              <p className="text-xs text-ink/35 mt-1.5">{bio.length}/400 characters</p>
            </div>

            <div>
              <label htmlFor="fee" className="block text-sm font-medium text-ink mb-1.5">
                Consultation fee
              </label>
              <div className="relative max-w-[160px]">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-ink/40">
                  $
                </span>
                <input
                  id="fee"
                  type="number"
                  min="0"
                  step="1"
                  value={consultationFee}
                  onChange={(e) => setConsultationFee(e.target.value)}
                  className="w-full rounded-lg border border-ink/15 bg-white pl-7 pr-3.5 py-2.5 text-sm text-ink outline-none focus:ring-2 focus:ring-teal focus:border-teal transition"
                />
              </div>
            </div>

            {error && (
              <p role="alert" className="text-sm text-rust bg-rust/5 border border-rust/20 rounded-lg px-3.5 py-2.5">
                {error}
              </p>
            )}
            {saveSuccess && (
              <p className="text-sm text-teal-dark bg-teal-light border border-teal/20 rounded-lg px-3.5 py-2.5">
                Changes saved successfully!
              </p>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-teal hover:bg-teal-dark disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-6 py-2.5 transition"
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}