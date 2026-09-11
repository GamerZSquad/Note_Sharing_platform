import { describe, expect, it } from "vitest";
import { canReadNoteMetadata } from "@/lib/note-access";

describe("canReadNoteMetadata", () => {
  const pending = {
    status: "PENDING",
    uploaderId: "owner-1",
  };

  it("allows anonymous viewers to read PUBLISHED notes", () => {
    expect(
      canReadNoteMetadata({
        status: "PUBLISHED",
        uploaderId: "owner-1",
      }),
    ).toBe(true);
  });

  it("blocks anonymous viewers from PENDING notes", () => {
    expect(canReadNoteMetadata(pending)).toBe(false);
  });

  it("allows the authenticated owner to read their PENDING note", () => {
    expect(
      canReadNoteMetadata({
        ...pending,
        viewerId: "owner-1",
        viewerRole: "STUDENT",
      }),
    ).toBe(true);
  });

  it("blocks an authenticated non-owner from another user's PENDING note", () => {
    expect(
      canReadNoteMetadata({
        ...pending,
        viewerId: "other-user",
        viewerRole: "STUDENT",
      }),
    ).toBe(false);
  });

  it("allows admins to read PENDING notes for moderation", () => {
    expect(
      canReadNoteMetadata({
        ...pending,
        viewerId: "admin-1",
        viewerRole: "ADMIN",
      }),
    ).toBe(true);
  });

  it("blocks REMOVED notes for everyone including the owner and admins", () => {
    expect(
      canReadNoteMetadata({
        status: "REMOVED",
        uploaderId: "owner-1",
        viewerId: "owner-1",
        viewerRole: "STUDENT",
      }),
    ).toBe(false);
    expect(
      canReadNoteMetadata({
        status: "REMOVED",
        uploaderId: "owner-1",
        viewerId: "admin-1",
        viewerRole: "ADMIN",
      }),
    ).toBe(false);
  });
});
