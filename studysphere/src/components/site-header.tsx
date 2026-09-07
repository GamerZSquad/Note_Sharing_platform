import Link from "next/link";
import { auth, signOut } from "@/auth";

const links = [
  { href: "/explore", label: "Explore" },
  { href: "/search", label: "Search" },
  { href: "/upload", label: "Upload" },
  { href: "/library", label: "Library" },
];

export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="border-b border-line bg-paper/90 backdrop-blur sticky top-0 z-40">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-serif text-xl tracking-tight">StudySphere</span>
          <span className="hidden text-xs uppercase tracking-[0.18em] text-muted sm:inline">
            Search. Share. Study.
          </span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-muted hover:text-ink">
              {link.label}
            </Link>
          ))}
          {session?.user.role === "ADMIN" && (
            <Link href="/admin" className="text-terracotta hover:text-ink">
              Admin
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-2 text-sm">
          {session?.user ? (
            <>
              <Link href="/dashboard" className="hidden text-muted hover:text-ink sm:inline">
                {session.user.name}
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button className="rounded-full border border-line px-3 py-1.5 hover:bg-parchment">
                  Log out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="px-3 py-1.5 text-muted hover:text-ink">
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-forest px-3 py-1.5 text-white hover:bg-forest-dark"
              >
                Join
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
