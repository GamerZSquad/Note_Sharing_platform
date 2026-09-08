import { prisma } from "@/lib/db";
import { AdminReportsClient } from "./reports-client";

export default async function AdminReportsPage() {
  const reports = await prisma.report.findMany({
    include: {
      note: { select: { id: true, title: true } },
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return <AdminReportsClient initialReports={reports} />;
}
