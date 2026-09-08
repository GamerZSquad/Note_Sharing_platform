import { prisma } from "@/lib/db";

export type CreateNoteBookmarkInput = {
  userId: string;
  noteId: string;
};

export type CreateNoteBookmarkResult =
  | { ok: true; status: 200 | 201; bookmark: { id: string; userId: string; type: string; noteId: string | null } }
  | { ok: false; status: 404; error: string };

/**
 * Creates a note bookmark or returns the existing one.
 * Validates the note exists and is published before insert.
 */
export async function createNoteBookmark(
  input: CreateNoteBookmarkInput,
): Promise<CreateNoteBookmarkResult> {
  const note = await prisma.note.findFirst({
    where: { id: input.noteId, status: "PUBLISHED" },
    select: { id: true },
  });
  if (!note) {
    return { ok: false, status: 404, error: "Note not found" };
  }

  const existing = await prisma.bookmark.findFirst({
    where: { userId: input.userId, noteId: input.noteId },
  });
  if (existing) {
    return { ok: true, status: 200, bookmark: existing };
  }

  const bookmark = await prisma.bookmark.create({
    data: {
      userId: input.userId,
      type: "NOTE",
      noteId: input.noteId,
    },
  });
  return { ok: true, status: 201, bookmark };
}
