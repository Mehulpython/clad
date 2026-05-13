"use client";

import ErrorFallback from "@/components/ErrorFallback";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  if (process.env.NODE_ENV === "development") {
    console.error("🔥 Global Error Boundary caught:", error);
  }

  return (
    <html lang="en">
      <body style={{ background: "var(--color-bg)", margin: 0 }}>
        <ErrorFallback
          error={error}
          reset={reset}
          message="Something went wrong"
        />
      </body>
    </html>
  );
}
