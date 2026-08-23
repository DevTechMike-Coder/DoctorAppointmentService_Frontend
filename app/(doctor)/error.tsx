"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-32 px-6 text-center">
      <p className="font-display text-xl text-ink mb-2">Something went wrong</p>
      <p className="text-sm text-ink/50 mb-6 max-w-sm">
        {error.message || "An unexpected error occurred."}
      </p>
      <button
        onClick={reset}
        className="rounded-lg bg-teal hover:bg-teal-dark text-white text-sm font-medium px-5 py-2.5 transition"
      >
        Try again
      </button>
    </div>
  );
}
