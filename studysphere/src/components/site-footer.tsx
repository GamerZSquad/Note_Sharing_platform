import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-paper">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>StudySphere is a discovery layer for academic notes and trusted educational sources.</p>
        <div className="flex gap-4">
          <Link href="/explore">Explore</Link>
          <Link href="/search">Search</Link>
          <Link href="/upload">Upload</Link>
        </div>
      </div>
    </footer>
  );
}
