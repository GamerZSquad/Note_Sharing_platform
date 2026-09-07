import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/http";
import { isAdmin } from "@/lib/permissions";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().trim().min(2),
  department: z.string().trim().min(2),
  semester: z.coerce.number().int().min(1).max(8).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) return jsonError("Forbidden", 403);
  const subjects = await prisma.subject.findMany({
    include: { _count: { select: { notes: true } } },
    orderBy: [{ department: "asc" }, { name: "asc" }],
  });
  return jsonOk(subjects);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) return jsonError("Forbidden", 403);
  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("Invalid subject");
  const subject = await prisma.subject.create({ data: parsed.data });
  return jsonOk(subject, 201);
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) return jsonError("Forbidden", 403);
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return jsonError("id is required");
  await prisma.subject.delete({ where: { id } });
  return jsonOk({ deleted: true });
}
