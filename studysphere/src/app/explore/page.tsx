import { prisma } from "@/lib/db";
import { NoteCard } from "@/components/note-card";
import { SearchForm } from "@/components/search-form";
import { average } from "@/lib/utils";

export default async function ExplorePage() {
  const [notes, subjects] = await Promise.all([
    prisma.note.findMany({
      where: { status: "PUBLISHED" },
      include: {
        subject: true,
        uploader: { select: { name: true } },
        tags: { include: { tag: true } },
        ratings: true,
      },
      orderBy: { downloads: "desc" },
      take: 24,
    }),
    prisma.subject.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-serif text-4xl">Explore</h1>
          <p className="mt-2 text-muted">Browse community notes by popularity, or search across notes and the web.</p>
        </div>
        <div className="w-full md:max-w-md">
          <SearchForm />
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        {subjects.map((subject) => (
          <a
            key={subject.id}
            href={`/search?q=${encodeURIComponent(subject.name)}`}
            className="rounded-full border border-line bg-paper px-3 py-1 text-sm"
          >
            {subject.name}
          </a>
        ))}
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {notes.map((note) => (
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
              uploader: note.uploader,
            }}
          />
        ))}
      </div>
    </section>
  );
}
