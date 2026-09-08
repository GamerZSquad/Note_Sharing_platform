import { prisma } from "@/lib/db";

function startOfDay(daysAgo: number) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - daysAgo);
  return date;
}

export async function getAdminAnalytics() {
  const since = startOfDay(13);
  const [
    totalUsers,
    totalNotes,
    downloadAgg,
    totalSearches,
    successfulSearches,
    searches,
    uploads,
    popularSubjects,
    topQueries,
    topNotes,
    internalClicks,
    externalClicks,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.note.count({ where: { status: "PUBLISHED" } }),
    prisma.note.aggregate({ _sum: { downloads: true } }),
    prisma.searchEvent.count(),
    prisma.searchEvent.count({ where: { clicked: true } }),
    prisma.searchEvent.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    }),
    prisma.note.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    }),
    prisma.note.groupBy({
      by: ["subjectId"],
      _count: { _all: true },
      _sum: { downloads: true },
      orderBy: { _count: { subjectId: "desc" } },
      take: 8,
    }),
    prisma.searchEvent.groupBy({
      by: ["query"],
      _count: { _all: true },
      orderBy: { _count: { query: "desc" } },
      take: 8,
    }),
    prisma.note.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { downloads: "desc" },
      take: 8,
      select: { id: true, title: true, downloads: true },
    }),
    prisma.searchEvent.count({
      where: { clicked: true, clickType: "community" },
    }),
    prisma.searchEvent.count({
      where: { clicked: true, clickType: "external" },
    }),
  ]);

  const subjects = await prisma.subject.findMany({
    where: { id: { in: popularSubjects.map((row) => row.subjectId) } },
  });
  const subjectMap = new Map(subjects.map((s) => [s.id, s.name]));

  const dayKey = (date: Date) => date.toISOString().slice(0, 10);
  const days = Array.from({ length: 14 }, (_, i) => {
    const date = startOfDay(13 - i);
    return dayKey(date);
  });
  const searchByDay = Object.fromEntries(days.map((d) => [d, 0]));
  const uploadByDay = Object.fromEntries(days.map((d) => [d, 0]));
  for (const event of searches) searchByDay[dayKey(event.createdAt)] += 1;
  for (const note of uploads) uploadByDay[dayKey(note.createdAt)] += 1;

  const successRate =
    totalSearches === 0
      ? 0
      : Number(((successfulSearches / totalSearches) * 100).toFixed(1));

  return {
    totals: {
      users: totalUsers,
      notes: totalNotes,
      downloads: downloadAgg._sum.downloads ?? 0,
      searches: totalSearches,
      successRate,
      successfulSearches,
    },
    charts: {
      searches: days.map((day) => ({ day, count: searchByDay[day] })),
      uploads: days.map((day) => ({ day, count: uploadByDay[day] })),
    },
    popularSubjects: popularSubjects.map((row) => ({
      name: subjectMap.get(row.subjectId) ?? "Unknown",
      notes: row._count._all,
      downloads: row._sum.downloads ?? 0,
    })),
    topQueries: topQueries.map((row) => ({
      query: row.query,
      count: row._count._all,
    })),
    topNotes,
    resultMix: { community: internalClicks, web: externalClicks },
  };
}

export type AdminAnalytics = Awaited<ReturnType<typeof getAdminAnalytics>>;
