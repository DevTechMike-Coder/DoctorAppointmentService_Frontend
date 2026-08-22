import Link from "next/link";
import { CalendarX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-canvas via-white to-teal-light/50 flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 rounded-full bg-white text-teal-dark ring-1 ring-teal/20 flex items-center justify-center mx-auto mb-6">
          <CalendarX className="w-6 h-6" />
        </div>
        <h1 className="font-display text-3xl text-ink mb-2">Page not found</h1>
        <p className="text-sm text-ink/65 leading-relaxed mb-8">
          The page you&apos;re looking for doesn&apos;t exist, or the appointment slot may
          no longer be there.
        </p>
        <Link
          href="/"
          className="inline-flex rounded-lg bg-teal-dark hover:bg-teal text-white text-sm font-medium px-6 py-2.5 transition"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
