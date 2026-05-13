"use client";

import ErrorFallback from "@/components/ErrorFallback";

export default function WardrobeError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  if (process.env.NODE_ENV === "development") {
    console.error("🔥 Wardrobe Error Boundary caught:", error);
  }

  return (
    <ErrorFallback
      error={error}
      reset={reset}
      message="We couldn't load your wardrobe"
    />
  );
}
