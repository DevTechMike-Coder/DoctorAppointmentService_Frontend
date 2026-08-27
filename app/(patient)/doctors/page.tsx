"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Stethoscope, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useDoctors } from "@/hooks/useDoctors";
import type { DoctorDto } from "@/lib/types";

export default function DoctorsPage() {
  const router = useRouter();
  const { doctors, loading, error } = useDoctors();
  const [query, setQuery] = useState("");
  const [activeSpecialty, setActiveSpecialty] = useState("All");

  const specialties = ["All", ...Array.from(new Set(doctors.map((d) => d.specialization)))];

  const filtered = doctors.filter((d) => {
    const matchesQuery =
      query.trim() === "" ||
      d.fullName.toLowerCase().includes(query.toLowerCase()) ||
      d.specialization.toLowerCase().includes(query.toLowerCase());
    const matchesSpecialty = activeSpecialty === "All" || d.specialization === activeSpecialty;
    return matchesQuery && matchesSpecialty;
  });

  return (
    <div>
      <div className="max-w-6xl mx-auto px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl sm:text-4xl text-ink mb-1.5 font-bold tracking-tight">
            Find a doctor
          </h1>
          <p className="text-ink/60 text-sm sm:text-base">
            Browse verified medical specialists and pick a time that works for you.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="relative mb-6"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/35" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by doctor name or specialty..."
            className="w-full rounded-2xl border border-ink/15 bg-white pl-11 pr-4 py-3.5 text-sm text-ink placeholder:text-ink/35 outline-none focus:ring-2 focus:ring-teal focus:border-teal transition shadow-xs"
          />
        </motion.div>

        {specialties.length > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="flex flex-wrap gap-2 mb-8"
          >
            {specialties.map((s) => {
              const active = activeSpecialty === s;
              return (
                <button
                  key={s}
                  onClick={() => setActiveSpecialty(s)}
                  className={`relative px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    active ? "text-white font-semibold" : "text-ink/65 hover:text-ink bg-white border border-ink/10"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="activeSpecialtyPill"
                      className="absolute inset-0 bg-teal rounded-full -z-10 shadow-xs"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  {s}
                </button>
              );
            })}
          </motion.div>
        )}

        {loading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-ink/10 p-6 animate-pulse shadow-xs">
                <div className="w-12 h-12 rounded-full bg-ink/5 mb-4" />
                <div className="h-5 bg-ink/5 rounded w-2/3 mb-2" />
                <div className="h-4 bg-ink/5 rounded w-1/2 mb-3" />
                <div className="h-3.5 bg-ink/5 rounded w-full mb-2" />
                <div className="h-3.5 bg-ink/5 rounded w-4/5" />
              </div>
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

        {!loading && !error && filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border border-ink/10 py-16 text-center shadow-xs"
          >
            <p className="text-sm text-ink/40">No doctors match your search criteria.</p>
          </motion.div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <motion.div
            layout
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            <AnimatePresence>
              {filtered.map((doc, idx) => (
                <DoctorCard
                  key={doc.id}
                  doctor={doc}
                  index={idx}
                  onClick={() => router.push(`/doctors/${doc.id}`)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function DoctorCard({
  doctor,
  index,
  onClick,
}: {
  doctor: DoctorDto;
  index: number;
  onClick: () => void;
}) {
  const initials = doctor.fullName.replace("Dr. ", "").split(" ").map((n) => n[0]).join("");

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.3) }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
    >
      <button
        onClick={onClick}
        className="w-full text-left bg-white rounded-2xl border border-ink/10 p-6 hover:border-teal/50 hover:shadow-md transition-all group flex flex-col justify-between h-full"
      >
        <div>
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-light text-teal-dark font-display font-semibold text-base flex items-center justify-center group-hover:scale-105 transition duration-200">
              {initials}
            </div>
            <span className="text-xs font-semibold text-ink/60 bg-ink/5 px-2.5 py-1 rounded-full">
              ${doctor.consultationFee}
            </span>
          </div>

          <h3 className="font-display text-xl text-ink font-semibold mb-1 group-hover:text-teal transition-colors">
            {doctor.fullName}
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-teal font-medium mb-3">
            <Stethoscope className="w-3.5 h-3.5 shrink-0" />
            <span>{doctor.specialization}</span>
            {doctor.qualifications && (
              <span className="text-ink/30 font-normal truncate">· {doctor.qualifications}</span>
            )}
          </div>

          <p className="text-sm text-ink/60 leading-relaxed line-clamp-2 font-light">
            {doctor.bio}
          </p>
        </div>

        <div className="mt-5 pt-4 border-t border-ink/5 flex items-center justify-between text-xs text-teal font-medium">
          <span>Book appointment</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </div>
      </button>
    </motion.div>
  );
}