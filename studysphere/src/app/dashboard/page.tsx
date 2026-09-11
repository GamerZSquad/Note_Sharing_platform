import Link from "next/link";
import { prisma } from "@/lib/db";
import { NoteCard } from "@/components/note-card";
import { requireActivePageUser } from "@/lib/session";
import { average } from "@/lib/utils";

export default async function DashboardPage() {
  const user = await requireActivePageUser("/dashboard");

  const [notes, bookmarks, ratings] = await Promise.all([
    prisma.note.findMany({
      where: { uploaderId: user.id, status: { not: "REMOVED" } },
      include: {
        subject: true,
        ratings: true,
        tags: { include: { tag: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.bookmark.count({ where: { userId: user.id } }),
    prisma.rating.count({ where: { note: { uploaderId: user.id }, helpful: true } }),
  ]);

  const downloads = notes.reduce((sum, note) => sum + note.downloads, 0);

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-serif text-4xl">Welcome back, {user.name?.split(" ")[0]}</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-4">
        {[
          ["Notes uploaded", notes.length],
          ["Downloads", downloads],
          ["Bookmarks", bookmarks],
          ["Helpful votes", ratings],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-2xl border border-line bg-paper p-5">
            <p className="font-serif text-3xl">{value}</p>
            <p className="text-sm text-muted">{label}</p>
          </div>
        ))}
      </div>
      <div className="mt-10 flex items-center justify-between">
        <h2 className="font-serif text-2xl">Your recent notes</h2>
        <Link href="/upload" className="text-sm text-forest">
          Upload another
        </Link>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {notes.length === 0 && <p className="text-muted">You have not uploaded notes yet.</p>}
        {notes.slice(0, 6).map((note) => (
          <NoteCard
            key={note.id}
            note={{
              id: note.id,
              title: note.title,
              description: note.description,
              avgRating: average(note.ratings.map((r) => r.rating)),
              ratingCount: note.ratings.length,
              downloads: note.downloads,
              resourceType: note.resourceType,
              tags: note.tags.map((entry) => entry.tag.name),
              subject: note.subject,
            }}
          />
        ))}
      </div>
    </section>
  );
}
