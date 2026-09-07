import { prisma } from "@/lib/db";
import { jsonOk } from "@/lib/http";

export async function GET() {
  const subjects = await prisma.subject.findMany({
    orderBy: [{ department: "asc" }, { semester: "asc" }, { name: "asc" }],
  });
  return jsonOk(subjects);
}
