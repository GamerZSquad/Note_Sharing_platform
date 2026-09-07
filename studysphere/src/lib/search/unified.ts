import { prisma } from "@/lib/db";
import { searchCommunityNotes, type RankedNote, type SearchFilters } from "@/lib/search/internal";
import { searchExternalResources, type NormalizedResource } from "@/lib/search/external";

export type UnifiedSearchResult = {
  query: string;
  searchId: string;
  community: RankedNote[];
  web: NormalizedResource[];
  total: number;
};

export async function unifiedSearch(
  query: string,
  filters: SearchFilters = {},
  userId?: string | null,
): Promise<UnifiedSearchResult> {
  const source = filters.source;
  const runCommunity = !source || source === "community";
  const runWeb = !source || source !== "community";

  const [community, webRaw] = await Promise.all([
    runCommunity ? searchCommunityNotes(query, filters) : Promise.resolve([]),
    runWeb ? searchExternalResources(query) : Promise.resolve([]),
  ]);

  const web =
    source && source !== "community"
      ? webRaw.filter((item) => item.sourceType === source)
      : webRaw;

  const event = await prisma.searchEvent.create({
    data: {
      query,
      resultCount: community.length + web.length,
      userId: userId ?? null,
    },
  });

  return {
    query,
    searchId: event.id,
    community,
    web,
    total: community.length + web.length,
  };
}
