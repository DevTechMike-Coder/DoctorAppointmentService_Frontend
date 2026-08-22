"use client";

import { useState } from "react";
import { Search, Stethoscope } from "lucide-react";

const PLACEHOLDER_DOCTORS = [
  {
    id: 1,
    fullName: "Dr. Amara Chen",
    specialization: "Cardiology",
    qualifications: "MD, FACC",
    bio: "15 years treating complex cardiac conditions with a focus on preventive care.",
    consultationFee: 120,
  },
  {
    id: 2,
    fullName: "Dr. Femi Okonkwo",
    specialization: "Dermatology",
    qualifications: "MD",
    bio: "Specializes in adult and pediatric skin conditions, acne, and eczema.",
    consultationFee: 90,
  },
  {
    id: 3,
    fullName: "Dr. Priya Nair",
    specialization: "Pediatrics",
    qualifications: "MD, FAAP",
    bio: "Gentle, thorough care for infants through teens. Parents welcome to ask anything.",
    consultationFee: 80,
  },
  {
    id: 4,
    fullName: "Dr. Marcus Webb",
    specialization: "Orthopedics",
    qualifications: "MD, MS",
    bio: "Sports injuries, joint pain, and post-surgical rehabilitation planning.",
    consultationFee: 110,
  },
  {
    id: 5,
    fullName: "Dr. Lena Kovacs",
    specialization: "General Practice",
    qualifications: "MBBS",
    bio: "Your first stop for check-ups, referrals, and everyday health concerns.",
    consultationFee: 60,
  },
  {
    id: 6,
    fullName: "Dr. Tunde Bakare",
    specialization: "Psychiatry",
    qualifications: "MD",
    bio: "Focused, judgment-free care for anxiety, mood, and sleep concerns.",
    consultationFee: 130,
  },
];

const SPECIALTIES = ["All", "Cardiology", "Dermatology", "Pediatrics", "Orthopedics", "General Practice", "Psychiatry"];

export default function DoctorsPage() {
  const [query, setQuery] = useState("");
  const [activeSpecialty, setActiveSpecialty] = useState("All");

  return (
    <div className="min-h-screen bg-canvas">
      {/* Top bar */}
      <header className="border-b border-ink/10 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-display text-xl text-ink">MedBook</span>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-teal-light flex items-center justify-center text-teal-dark text-xs font-medium">
              JD
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="font-display text-3xl text-ink mb-1.5">Find a doctor</h1>
          <p className="text-ink/60 text-sm">
            Browse by specialty and pick a time that works for you.
          </p>
        </div>

        {/* Search */}
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

        {/* Specialty filter chips */}
        <div className="flex flex-wrap gap-2 mb-8">
          {SPECIALTIES.map((s) => (
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

        {/* Doctor grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PLACEHOLDER_DOCTORS.map((doc) => (
            <DoctorCard key={doc.id} doctor={doc} />
          ))}
        </div>
      </div>
    </div>
  );
}

function DoctorCard({
  doctor,
}: {
  doctor: (typeof PLACEHOLDER_DOCTORS)[number];
}) {
  const initials = doctor.fullName
    .replace("Dr. ", "")
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <button className="text-left bg-white rounded-xl border border-ink/10 p-5 hover:border-teal/40 hover:shadow-sm transition group">
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
        <span className="text-ink/30 font-normal">· {doctor.qualifications}</span>
      </div>

      <p className="text-sm text-ink/55 leading-relaxed line-clamp-2">
        {doctor.bio}
      </p>
    </button>
  );
}