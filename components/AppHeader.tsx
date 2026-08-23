"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const PATIENT_LINKS = [
  { href: "/doctors", label: "Find a doctor" },
  { href: "/appointments", label: "My appointments" },
];

const DOCTOR_LINKS = [
  { href: "/doctor/appointments", label: "Appointments" },
  { href: "/doctor/slots", label: "Availability" },
  { href: "/doctor/profile", label: "Profile" },
];

export default function AppHeader({ variant }: { variant: "patient" | "doctor" }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = variant === "doctor" ? DOCTOR_LINKS : PATIENT_LINKS;

  const initials =
    user?.fullName
      ?.replace(/^Dr\.?\s+/i, "")
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0]!.toUpperCase())
      .slice(0, 2)
      .join("") || (variant === "doctor" ? "DR" : "ME");

  return (
    <header className="border-b border-ink/10 bg-white sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
        <div className="flex items-center gap-8 min-w-0">
          <Link
            href={variant === "doctor" ? "/doctor/appointments" : "/doctors"}
            className="font-display text-xl text-ink shrink-0"
          >
            MedBook
          </Link>
          <nav className="hidden sm:flex items-center gap-1">
            {links.map((link) => {
              const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    active ? "bg-teal-light text-teal-dark" : "text-ink/55 hover:text-ink"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="relative shrink-0">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="w-8 h-8 rounded-full bg-teal-light flex items-center justify-center text-teal-dark text-xs font-medium hover:ring-2 hover:ring-teal/30 transition"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            title={user?.fullName || "Account"}
          >
            {initials}
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl border border-ink/10 shadow-lg py-1.5 z-50">
                <div className="px-4 py-2.5 border-b border-ink/5">
                  <p className="text-sm font-medium text-ink truncate">
                    {user?.fullName || "Signed in"}
                  </p>
                  <p className="text-xs text-ink/40 capitalize">
                    {user?.role?.toLowerCase() ?? ""}
                  </p>
                </div>
                {/* Mobile nav links */}
                <div className="sm:hidden border-b border-ink/5 py-1">
                  {links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-ink/70 hover:bg-ink/5 transition"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-ink/70 hover:bg-rust/5 hover:text-rust transition"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
