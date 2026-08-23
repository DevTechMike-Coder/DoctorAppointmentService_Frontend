"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Stethoscope } from "lucide-react";
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
        <div className="mb-8">
          <h1 className="font-display text-3xl text-ink mb-1.5">Find a doctor</h1>
          <p className="text-ink/60 text-sm">
            Browse by specialty and pick a time that works for you.
          </p>
        </div>

        <div className="relative mb-5">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/30" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or specialty"
            className="w-full rounded-lg border border-ink/15 bg-white pl-10 pr-3.5 py-2.5 text-sm text-ink placeholder:text-ink/30 outline-none focus:ring-2 focus:ring-teal focus:border-teal transition"
          />
        </div>

        {specialties.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {specialties.map((s) => (
              <button
                key={s}
                onClick={() => setActiveSpecialty(s)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition ${
                  activeSpecialty === s
                    ? "bg-teal text-white"
                    : "bg-white text-ink/60 border border-ink/10 hover:border-ink/25"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-ink/10 p-5 animate-pulse">
                <div className="w-11 h-11 rounded-full bg-ink/5 mb-3.5" />
                <div className="h-4 bg-ink/5 rounded w-2/3 mb-2" />
                <div className="h-3 bg-ink/5 rounded w-1/2 mb-3" />
                <div className="h-3 bg-ink/5 rounded w-full" />
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="bg-white rounded-xl border border-rust/20 py-16 text-center">
            <p className="text-sm text-rust">{error}</p>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="bg-white rounded-xl border border-ink/10 py-16 text-center">
            <p className="text-sm text-ink/40">No doctors match your search.</p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((doc) => (
              <DoctorCard key={doc.id} doctor={doc} onClick={() => router.push(`/doctors/${doc.id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DoctorCard({ doctor, onClick }: { doctor: DoctorDto; onClick: () => void }) {
  const initials = doctor.fullName.replace("Dr. ", "").split(" ").map((n) => n[0]).join("");

  return (
    <button
      onClick={onClick}
      className="text-left bg-white rounded-xl border border-ink/10 p-5 hover:border-teal/40 hover:shadow-sm transition group"
    >
      <div className="flex items-start justify-between mb-3.5">
        <div className="w-11 h-11 rounded-full bg-teal-light text-teal-dark font-display text-sm flex items-center justify-center">
          {initials}
        </div>
        <span className="text-xs font-medium text-ink/40 bg-ink/5 px-2 py-1 rounded-full">
          ${doctor.consultationFee}
        </span>
      </div>

      <h3 className="font-display text-lg text-ink mb-0.5 group-hover:text-teal-dark transition">
        {doctor.fullName}
      </h3>

      <div className="flex items-center gap-1.5 text-xs text-teal font-medium mb-2.5">
        <Stethoscope className="w-3.5 h-3.5" />
        {doctor.specialization}
        {doctor.qualifications && (
          <span className="text-ink/30 font-normal">· {doctor.qualifications}</span>
        )}
      </div>

      <p className="text-sm text-ink/55 leading-relaxed line-clamp-2">{doctor.bio}</p>
    </button>
  );
}