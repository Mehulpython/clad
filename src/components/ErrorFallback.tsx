"use client";

import { AlertCircle } from "lucide-react";

interface ErrorFallbackProps {
  error: Error;
  reset?: () => void;
  message?: string;
}

export default function ErrorFallback({
  error,
  reset,
  message = "Something went wrong",
}: ErrorFallbackProps) {
  return (
    <div className="flex min-h-[400px] items-center justify-center px-4">
      <div className="card-static max-w-md w-full text-center p-8 animate-fade">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-rose-50">
          <AlertCircle
            className="h-8 w-8 text-[var(--color-primary)]"
            strokeWidth={1.8}
          />
        </div>

        <h2 className="mb-2 text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
          Oops!
        </h2>

        <p className="mb-1 text-[15px] text-[var(--color-muted-foreground)]">
          {message}
        </p>

        {error?.message && (
          <p className="mb-6 mt-3 rounded-lg bg-[var(--color-muted)] px-4 py-2.5 text-left text-xs font-mono text-[var(--color-muted-foreground)] break-all">
            {error.message}
          </p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          {reset && (
            <button onClick={reset} className="btn-primary w-full sm:w-auto">
              Try Again
            </button>
          )}
          <a href="/wardrobe" className="btn-secondary w-full sm:w-auto">
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}
