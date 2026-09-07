import Link from "next/link";
import { formatNumber } from "@/lib/utils";
import { RESOURCE_TYPE_LABELS, type ResourceType } from "@/lib/constants";

export type NoteCardData = {
  id: string;
  title: string;
  description: string;
  avgRating: number;
  ratingCount: number;
  downloads: number;
  resourceType: string;
  tags?: string[];
  subject: { name: string; department: string };
  uploader?: { name: string };
};

export function NoteCard({ note, searchId }: { note: NoteCardData; searchId?: string }) {
  const href = searchId
    ? `/notes/${note.id}?sid=${searchId}`
    : `/notes/${note.id}`;

  return (
    <article className="rounded-2xl border border-line bg-paper p-5 shadow-[0_1px_0_rgba(28,25,21,0.04)]">
      <div className="mb-3 flex items-center justify-between gap-3 text-xs uppercase tracking-wide text-muted">
        <span>{note.subject.name}</span>
        <span>
          {RESOURCE_TYPE_LABELS[note.resourceType as ResourceType] ?? note.resourceType}
        </span>
      </div>
      <Link href={href} className="font-serif text-xl leading-snug hover:text-forest">
        {note.title}
      </Link>
      <p className="mt-2 line-clamp-2 text-sm text-muted">{note.description}</p>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted">
        <span>★ {note.avgRating.toFixed(1)}</span>
        <span>{note.ratingCount} ratings</span>
        <span>↓ {formatNumber(note.downloads)}</span>
        {note.uploader && <span>by {note.uploader.name}</span>}
      </div>
      {note.tags && note.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {note.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="rounded-full bg-leaf px-2 py-0.5 text-xs text-forest-dark">
              {tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
