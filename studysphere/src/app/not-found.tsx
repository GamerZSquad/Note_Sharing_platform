import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-xl px-4 py-24 text-center">
      <div className="mb-8 flex justify-center">
        <BrandLogo size="md" showWordmark align="center" />
      </div>
      <h1 className="font-serif text-4xl">Page not found</h1>
      <p className="mt-3 text-muted">That note or route does not exist.</p>
      <Link href="/explore" className="mt-6 inline-block text-forest underline">
        Back to explore
      </Link>
    </section>
  );
}
