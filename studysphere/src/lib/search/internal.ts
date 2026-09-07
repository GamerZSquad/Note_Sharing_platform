import { prisma } from "@/lib/db";
import { containsTerm, scoreCommunityNote, tokenize } from "@/lib/search/ranking";
import type { SortOption } from "@/lib/constants";

export type SearchFilters = {
  department?: string;
  semester?: number;
  subject?: string;
  unit?: string;
  type?: string;
  source?: string;
  sort?: SortOption;
};

export type RankedNote = {
  id: string;
  title: string;
  description: string;
  fileType: string;
  resourceType: string;
  unit: string | null;
  downloads: number;
  createdAt: Date;
  relevance: number;
  avgRating: number;
  ratingCount: number;
  subject: { id: string; name: string; department: string; semester: number | null };
  uploader: { id: string; name: string };
  tags: string[];
};

function matchesQuery(
  query: string,
  fields: Array<string | null | undefined>,
): boolean {
  const haystack = fields.filter(Boolean).join(" ");
  if (haystack.toLowerCase().includes(query.toLowerCase().trim())) return true;
  return tokenize(query).some((token) => containsTerm(haystack, token));
}

export async function searchCommunityNotes(
  query: string,
  filters: SearchFilters = {},
): Promise<RankedNote[]> {
  const notes = await prisma.note.findMany({
    where: {
      status: "PUBLISHED",
      ...(filters.department
        ? { subject: { department: filters.department } }
        : {}),
      ...(filters.semester ? { subject: { semester: filters.semester } } : {}),
      ...(filters.subject
        ? {
            subject: {
              name: { contains: filters.subject },
            },
          }
        : {}),
      ...(filters.unit ? { unit: filters.unit } : {}),
      ...(filters.type ? { resourceType: filters.type } : {}),
    },
    include: {
      subject: true,
      uploader: { select: { id: true, name: true } },
      tags: { include: { tag: true } },
      ratings: true,
    },
  });

  const ranked = notes
    .map((note) => {
      const tags = note.tags.map((entry) => entry.tag.name);
      const ratings = note.ratings.map((r) => r.rating);
      const avgRating =
        ratings.length === 0
          ? 0
          : ratings.reduce((sum, value) => sum + value, 0) / ratings.length;

      const relevance = scoreCommunityNote(
        {
          title: note.title,
          description: note.description,
          subjectName: note.subject.name,
          department: note.subject.department,
          tags,
          avgRating,
          ratingCount: ratings.length,
          downloads: note.downloads,
          createdAt: note.createdAt,
        },
        query,
      );

      const candidate = matchesQuery(query, [
        note.title,
        note.description,
        note.subject.name,
        note.subject.department,
        note.unit,
        ...tags,
      ]);

      return {
        id: note.id,
        title: note.title,
        description: note.description,
        fileType: note.fileType,
        resourceType: note.resourceType,
        unit: note.unit,
        downloads: note.downloads,
        createdAt: note.createdAt,
        relevance,
        avgRating: Number(avgRating.toFixed(1)),
        ratingCount: ratings.length,
        subject: note.subject,
        uploader: note.uploader,
        tags,
        candidate,
      };
    })
    .filter((note) => note.candidate)
    .map(({ candidate: _candidate, ...note }) => note);

  const sort = filters.sort ?? "relevant";
  ranked.sort((a, b) => {
    if (sort === "downloads") return b.downloads - a.downloads;
    if (sort === "rating") return b.avgRating - a.avgRating;
    if (sort === "newest") return b.createdAt.getTime() - a.createdAt.getTime();
    return b.relevance - a.relevance;
  });

  return ranked;
}
