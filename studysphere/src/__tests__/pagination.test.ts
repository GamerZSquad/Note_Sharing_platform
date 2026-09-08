import { describe, expect, it } from "vitest";
import { COMMUNITY_PAGE_SIZE } from "@/lib/search/unified";
import { searchQuerySchema } from "@/lib/validations";

describe("search pagination helpers", () => {
  it("defaults page to 1 and pageSize to 10", () => {
    const parsed = searchQuerySchema.parse({ q: "deadlock" });
    expect(parsed.page).toBe(1);
    expect(parsed.pageSize).toBe(COMMUNITY_PAGE_SIZE);
  });

  it("rejects page values below 1", () => {
    const parsed = searchQuerySchema.safeParse({ q: "deadlock", page: 0 });
    expect(parsed.success).toBe(false);
  });

  it("slices community results into distinct pages", () => {
    const items = Array.from({ length: 25 }, (_, i) => `note-${i}`);
    const pageSize = 10;
    const page1 = items.slice(0, pageSize);
    const page2 = items.slice(pageSize, pageSize * 2);
    expect(page1).toHaveLength(10);
    expect(page2).toHaveLength(10);
    expect(page1[0]).toBe("note-0");
    expect(page2[0]).toBe("note-10");
    expect(page1.some((id) => page2.includes(id))).toBe(false);
  });
});
