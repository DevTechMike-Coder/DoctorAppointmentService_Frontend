import Link from "next/link";
import { Calendar, Stethoscope, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-canvas">
      {/* Nav */}
      <header className="border-b border-ink/10 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-display text-xl text-ink">MedBook</span>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-ink/70 hover:text-ink transition px-3 py-2"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="text-sm font-medium bg-teal hover:bg-teal-dark text-white px-4 py-2 rounded-lg transition"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-ink text-canvas">
        <SlotPattern />
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-28 text-center">
          <h1 className="font-display text-4xl sm:text-5xl leading-tight max-w-2xl mx-auto mb-5">
            Book a doctor in a few taps, not a few calls.
          </h1>
          <p className="text-canvas/70 text-base max-w-lg mx-auto mb-9 leading-relaxed">
            Browse real availability, pick a time that works, and get confirmed —
            no hold music, no back-and-forth.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/register"
              className="rounded-lg bg-teal hover:bg-teal-dark text-white text-sm font-medium px-6 py-3 transition"
            >
              Find a doctor
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-canvas/20 text-canvas text-sm font-medium px-6 py-3 hover:bg-canvas/5 transition"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid sm:grid-cols-3 gap-8">
          <Feature
            icon={<Calendar className="w-5 h-5" />}
            title="Real-time slots"
            description="See exactly when a doctor is free — no guessing, no double-booked appointments."
          />
          <Feature
            icon={<Stethoscope className="w-5 h-5" />}
            title="Every specialty"
            description="From general practice to cardiology, find the right doctor for what you need."
          />
          <Feature
            icon={<ShieldCheck className="w-5 h-5" />}
            title="Your data, protected"
            description="Every booking and record is handled with the same care as your visit."
          />
        </div>
      </section>

      {/* For doctors */}
      <section className="border-t border-ink/10 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-20 flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="max-w-md text-center sm:text-left">
            <h2 className="font-display text-2xl text-ink mb-2">Are you a doctor?</h2>
            <p className="text-sm text-ink/60 leading-relaxed">
              Set your availability once and let patients book directly — no phone
              tag, no scheduling back-and-forth.
            </p>
          </div>
          <Link
            href="/register"
            className="rounded-lg bg-teal hover:bg-teal-dark text-white text-sm font-medium px-6 py-3 transition shrink-0"
          >
            Join as a doctor
          </Link>
        </div>
      </section>

      <footer className="border-t border-ink/10">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-xs text-ink/40">
          MedBook
        </div>
      </footer>
    </div>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center sm:text-left">
      <div className="w-10 h-10 rounded-lg bg-teal-light text-teal-dark flex items-center justify-center mb-4 mx-auto sm:mx-0">
        {icon}
      </div>
      <h3 className="font-display text-lg text-ink mb-1.5">{title}</h3>
      <p className="text-sm text-ink/55 leading-relaxed">{description}</p>
    </div>
  );
}

function SlotPattern() {
  const dots = Array.from({ length: 64 });
  return (
    <div className="absolute inset-0 opacity-[0.06] grid grid-cols-10 gap-6 p-10 pointer-events-none">
      {dots.map((_, i) => (
        <div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-canvas"
          style={{ opacity: i % 7 === 0 ? 1 : 0.4 }}
        />
      ))}
    </div>
  );
}