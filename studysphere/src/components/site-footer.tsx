import { BrandLogo } from "@/components/brand-logo";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-paper">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3 sm:items-center">
          <BrandLogo size="sm" showWordmark={false} href="/" />
          <p>
            <span className="font-serif text-ink">StudySphere</span> is a discovery layer for
            academic notes and trusted educational sources.
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="/explore">Explore</Link>
          <Link href="/search">Search</Link>
          <Link href="/upload">Upload</Link>
        </div>
      </div>
    </footer>
  );
}
