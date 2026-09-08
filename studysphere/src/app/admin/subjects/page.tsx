import { prisma } from "@/lib/db";
import { AdminSubjectsClient } from "./subjects-client";

export default async function AdminSubjectsPage() {
  const subjects = await prisma.subject.findMany({
    include: { _count: { select: { notes: true } } },
    orderBy: [{ department: "asc" }, { name: "asc" }],
  });

  return <AdminSubjectsClient initialSubjects={subjects} />;
}
