import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="card-static max-w-md w-full text-center p-10 animate-fade">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-muted)]">
          <SearchX
            className="h-10 w-10 text-[var(--color-primary)]"
            strokeWidth={1.5}
          />
        </div>

        <h1
          className="mb-3 text-3xl font-bold"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Page Not Found
        </h1>

        <p className="mb-8 text-[15px] leading-relaxed text-[var(--color-muted-foreground)]">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back to your wardrobe.
        </p>

        <Link href="/wardrobe" className="btn-primary inline-flex">
          Back to Wardrobe
        </Link>
      </div>
    </div>
  );
}
