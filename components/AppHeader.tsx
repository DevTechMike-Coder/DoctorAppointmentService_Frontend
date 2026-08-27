"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
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
    <header className="border-b border-ink/10 bg-white/85 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
        <div className="flex items-center gap-8 min-w-0">
          <Link
            href={variant === "doctor" ? "/doctor/appointments" : "/doctors"}
            className="font-display text-xl text-ink shrink-0 flex items-center gap-2"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-teal inline-block" />
            MedBook
          </Link>
          <nav className="hidden sm:flex items-center gap-1.5">
            {links.map((link) => {
              const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    active ? "text-teal-dark font-semibold" : "text-ink/60 hover:text-ink"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="activeHeaderPill"
                      className="absolute inset-0 bg-teal-light rounded-lg -z-10"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="relative shrink-0">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setMenuOpen((o) => !o)}
            className="w-9 h-9 rounded-full bg-teal-light flex items-center justify-center text-teal-dark text-xs font-semibold hover:ring-2 hover:ring-teal/30 transition shadow-xs"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            title={user?.fullName || "Account"}
          >
            {initials}
          </motion.button>

          <AnimatePresence>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -8 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-md rounded-2xl border border-ink/10 shadow-xl py-2 z-50 overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-ink/5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-teal/10 flex items-center justify-center text-teal-dark">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink truncate">
                        {user?.fullName || "Signed in"}
                      </p>
                      <p className="text-xs text-ink/45 capitalize">
                        {user?.role?.toLowerCase() ?? ""}
                      </p>
                    </div>
                  </div>

                  {/* Mobile nav links */}
                  <div className="sm:hidden border-b border-ink/5 py-1">
                    {links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-ink/75 hover:bg-teal-light/50 hover:text-teal-dark transition font-medium"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>

                  <div className="pt-1 px-1">
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-rust font-medium rounded-lg hover:bg-rust/10 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

