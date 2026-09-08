import { describe, expect, it, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  findFirstNote: vi.fn(),
  findFirstBookmark: vi.fn(),
  createBookmark: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    note: {
      findFirst: mocks.findFirstNote,
    },
    bookmark: {
      findFirst: mocks.findFirstBookmark,
      create: mocks.createBookmark,
    },
  },
}));

import { createNoteBookmark } from "@/lib/bookmarks";

describe("createNoteBookmark", () => {
  beforeEach(() => {
    mocks.findFirstNote.mockReset();
    mocks.findFirstBookmark.mockReset();
    mocks.createBookmark.mockReset();
  });

  it("returns 404 when the note does not exist", async () => {
    mocks.findFirstNote.mockResolvedValue(null);

    const result = await createNoteBookmark({
      userId: "user-1",
      noteId: "missing-note",
    });

    expect(result).toEqual({
      ok: false,
      status: 404,
      error: "Note not found",
    });
    expect(mocks.createBookmark).not.toHaveBeenCalled();
  });

  it("creates a bookmark for an existing published note", async () => {
    mocks.findFirstNote.mockResolvedValue({ id: "note-1" });
    mocks.findFirstBookmark.mockResolvedValue(null);
    mocks.createBookmark.mockResolvedValue({
      id: "bm-1",
      userId: "user-1",
      type: "NOTE",
      noteId: "note-1",
    });

    const result = await createNoteBookmark({
      userId: "user-1",
      noteId: "note-1",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.status).toBe(201);
      expect(result.bookmark.noteId).toBe("note-1");
    }
  });

  it("returns the existing bookmark on duplicate", async () => {
    mocks.findFirstNote.mockResolvedValue({ id: "note-1" });
    mocks.findFirstBookmark.mockResolvedValue({
      id: "bm-existing",
      userId: "user-1",
      type: "NOTE",
      noteId: "note-1",
    });

    const result = await createNoteBookmark({
      userId: "user-1",
      noteId: "note-1",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.status).toBe(200);
      expect(result.bookmark.id).toBe("bm-existing");
    }
    expect(mocks.createBookmark).not.toHaveBeenCalled();
  });
});
