import { describe, expect, it, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  findUnique: vi.fn(),
  update: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    searchEvent: {
      findUnique: mocks.findUnique,
      update: mocks.update,
    },
  },
}));

import { recordSearchClick } from "@/lib/search/click";

describe("recordSearchClick", () => {
  beforeEach(() => {
    mocks.findUnique.mockReset();
    mocks.update.mockReset();
  });

  it("rejects unknown search events", async () => {
    mocks.findUnique.mockResolvedValue(null);
    const result = await recordSearchClick({
      searchId: "missing",
      clickType: "community",
      userId: "user-1",
    });
    expect(result).toEqual({
      ok: false,
      status: 404,
      error: "Search event not found",
    });
  });

  it("rejects clicks for another user's search event", async () => {
    mocks.findUnique.mockResolvedValue({
      id: "s1",
      userId: "owner",
      createdAt: new Date(),
    });
    const result = await recordSearchClick({
      searchId: "s1",
      clickType: "external",
      userId: "intruder",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.status).toBe(403);
  });

  it("records an authenticated click for a valid event", async () => {
    mocks.findUnique.mockResolvedValue({
      id: "s1",
      userId: "user-1",
      createdAt: new Date(),
    });
    mocks.update.mockResolvedValue({});
    const result = await recordSearchClick({
      searchId: "s1",
      clickType: "community",
      userId: "user-1",
    });
    expect(result).toEqual({ ok: true });
    expect(mocks.update).toHaveBeenCalled();
  });
});
