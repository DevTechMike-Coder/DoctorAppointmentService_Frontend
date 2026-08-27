/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { Camera, Stethoscope, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useDoctorProfile } from "@/hooks/useDoctorProfile";
import { useToast } from "@/components/Toast";
import { ApiError } from "@/lib/api";

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
  const { profile, loading, error, saveProfile } = useDoctorProfile();
  const toast = useToast();

  const [fullName, setFullName] = useState("");
  const [specialization, setSpecialization] = useState(SPECIALTIES[0]);
  const [qualifications, setQualifications] = useState("");
  const [bio, setBio] = useState("");
  const [consultationFee, setConsultationFee] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Hydrate form once the real profile loads
  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName ?? "");
      setSpecialization(profile.specialization ?? SPECIALTIES[0]);
      setQualifications(profile.qualifications ?? "");
      setBio(profile.bio ?? "");
      setConsultationFee(profile.consultationFee?.toString() ?? "");
    }
  }, [profile]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    try {
      await saveProfile({
        fullName,
        specialization,
        qualifications,
        bio,
        consultationFee: Number(consultationFee),
      });
      setSaved(true);
      toast.success("Profile saved.");
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Couldn't save your profile.";
      setSaveError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  const initials = fullName.replace("Dr. ", "").split(" ").map((n) => n[0]).join("") || "DR";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <p className="text-sm text-ink/40">Loading profile…</p>
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
            Your profile
          </h1>
          <p className="text-ink/60 text-sm sm:text-base">
            {profile
              ? "This is what patients see when deciding to book a consultation with you."
              : "Set up your profile so patients can discover and book with you."}
          </p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border border-rust/20 p-5 mb-6 shadow-xs"
          >
            <p className="text-sm text-rust font-medium">{error}</p>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-[260px_1fr] gap-8">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-2xl border border-ink/10 p-6 text-center shadow-xs lg:sticky lg:top-24"
            >
              <div className="relative w-20 h-20 mx-auto mb-4">
                <div className="w-20 h-20 rounded-2xl bg-teal-light text-teal-dark font-display font-bold text-2xl flex items-center justify-center shadow-xs">
                  {initials}
                </div>
                <button
                  type="button"
                  className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white border border-ink/10 flex items-center justify-center text-ink/50 hover:text-teal hover:shadow-xs transition"
                  title="Change photo"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <h3 className="font-display text-lg font-bold text-ink mb-1 truncate">
                {fullName || "Your name"}
              </h3>
              <div className="inline-flex items-center gap-1 text-xs text-teal font-semibold mb-3">
                <Stethoscope className="w-3.5 h-3.5" />
                <span>{specialization || "Specialty"}</span>
              </div>
              <div className="pt-3 border-t border-ink/5 text-xs text-ink/45 leading-relaxed font-light">
                Live preview of your public patient card
              </div>
            </motion.div>
          </div>

          <motion.form
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl border border-ink/10 p-8 shadow-xs space-y-6"
          >
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-ink mb-1.5">
                Full name
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:ring-2 focus:ring-teal focus:border-teal transition shadow-2xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="specialization" className="block text-sm font-medium text-ink mb-1.5">
                  Specialty
                </label>
                <select
                  id="specialization"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:ring-2 focus:ring-teal focus:border-teal transition shadow-2xs"
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
                  className="w-full rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/30 outline-none focus:ring-2 focus:ring-teal focus:border-teal transition shadow-2xs"
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
                placeholder="Tell patients about your clinical experience and approach to care..."
                className="w-full rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/30 outline-none focus:ring-2 focus:ring-teal focus:border-teal transition resize-none shadow-2xs"
              />
              <p className="text-xs text-ink/40 mt-1.5">{bio.length}/400 characters</p>
            </div>

            <div>
              <label htmlFor="fee" className="block text-sm font-medium text-ink mb-1.5">
                Consultation fee
              </label>
              <div className="relative max-w-[160px]">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-ink/40 font-medium">$</span>
                <input
                  id="fee"
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={consultationFee}
                  onChange={(e) => setConsultationFee(e.target.value)}
                  className="w-full rounded-xl border border-ink/15 bg-white pl-7 pr-3.5 py-2.5 text-sm text-ink outline-none focus:ring-2 focus:ring-teal focus:border-teal transition shadow-2xs font-medium"
                />
              </div>
            </div>

            <AnimatePresence>
              {saveError && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  role="alert"
                  className="flex items-center gap-2 text-sm text-rust bg-rust/5 border border-rust/20 rounded-xl px-3.5 py-2.5"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{saveError}</span>
                </motion.div>
              )}
              {saved && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex items-center gap-2 text-sm text-teal-dark bg-teal-light border border-teal/20 rounded-xl px-3.5 py-2.5 font-medium"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Profile changes saved successfully.</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-end pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={saving}
                className="rounded-xl bg-teal hover:bg-teal-dark disabled:opacity-50 text-white text-sm font-semibold px-7 py-3 transition shadow-sm hover:shadow"
              >
                {saving ? "Saving…" : "Save changes"}
              </motion.button>
            </div>
          </motion.form>
        </div>
      </div>
    </div>
  );
}