import { prisma } from "@/lib/db";
import {
  searchCommunityNotes,
  type RankedNote,
  type SearchFilters,
} from "@/lib/search/internal";
import {
  searchExternalResources,
  type NormalizedResource,
} from "@/lib/search/external";

export const COMMUNITY_PAGE_SIZE = 10;

export type UnifiedSearchResult = {
  query: string;
  searchId: string;
  community: RankedNote[];
  web: NormalizedResource[];
  /** Total community + web hits before community paging */
  total: number;
  pagination: {
    page: number;
    pageSize: number;
    communityTotal: number;
    communityTotalPages: number;
    webTotal: number;
    /**
     * Web/external results are capped by the provider layer (~12) and are not
     * slice-paginated. They are returned in full on every page for discovery UX.
     * `page` only pages community notes.
     */
    webPaginated: false;
  };
};

export type UnifiedSearchOptions = SearchFilters & {
  page?: number;
  pageSize?: number;
};

export async function unifiedSearch(
  query: string,
  filters: UnifiedSearchOptions = {},
  userId?: string | null,
): Promise<UnifiedSearchResult> {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, filters.pageSize ?? COMMUNITY_PAGE_SIZE));
  const source = filters.source;
  const runCommunity = !source || source === "community";
  const runWeb = !source || source !== "community";

  const [communityAll, webRaw] = await Promise.all([
    runCommunity ? searchCommunityNotes(query, filters) : Promise.resolve([]),
    runWeb ? searchExternalResources(query) : Promise.resolve([]),
  ]);

  const web =
    source && source !== "community"
      ? webRaw.filter((item) => item.sourceType === source)
      : webRaw;

  const communityTotal = communityAll.length;
  const communityTotalPages = Math.max(1, Math.ceil(communityTotal / pageSize) || 1);
  const safePage = Math.min(page, communityTotalPages);
  const start = (safePage - 1) * pageSize;
  const community = communityAll.slice(start, start + pageSize);

  const event = await prisma.searchEvent.create({
    data: {
      query,
      resultCount: communityTotal + web.length,
      userId: userId ?? null,
    },
  });

  return {
    query,
    searchId: event.id,
    community,
    web,
    total: communityTotal + web.length,
    pagination: {
      page: safePage,
      pageSize,
      communityTotal,
      communityTotalPages,
      webTotal: web.length,
      webPaginated: false,
    },
  };
}
