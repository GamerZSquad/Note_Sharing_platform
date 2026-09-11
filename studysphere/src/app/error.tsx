"use client";

import { useEffect } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app-error]", error.digest ?? error.name);
  }, [error]);

  return (
    <section className="mx-auto max-w-xl px-4 py-24 text-center">
      <div className="mb-8 flex justify-center">
        <BrandLogo size="md" showWordmark align="center" />
      </div>
      <h1 className="font-serif text-4xl">Something went wrong</h1>
      <p className="mt-3 text-muted">
        StudySphere hit an unexpected problem loading this page. You can try again, or head back
        to explore.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-forest px-5 py-2.5 text-sm text-white hover:bg-forest-dark"
        >
          Try again
        </button>
        <Link
          href="/explore"
          className="rounded-full border border-line bg-paper px-5 py-2.5 text-sm text-ink hover:border-forest"
        >
          Back to explore
        </Link>
      </div>
    </section>
  );
}
