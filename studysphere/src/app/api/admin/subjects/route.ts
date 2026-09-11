import { prisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/http";
import { requireAdminUser } from "@/lib/session";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().trim().min(2),
  department: z.string().trim().min(2),
  semester: z.coerce.number().int().min(1).max(8).optional(),
});

export async function GET() {
  const gate = await requireAdminUser();
  if (!gate.ok) return gate.response;
  const subjects = await prisma.subject.findMany({
    include: { _count: { select: { notes: true } } },
    orderBy: [{ department: "asc" }, { name: "asc" }],
  });
  return jsonOk(subjects);
}

export async function POST(request: Request) {
  const gate = await requireAdminUser();
  if (!gate.ok) return gate.response;
  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("Invalid subject");
  const subject = await prisma.subject.create({ data: parsed.data });
  return jsonOk(subject, 201);
}

export async function DELETE(request: Request) {
  const gate = await requireAdminUser();
  if (!gate.ok) return gate.response;
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return jsonError("id is required");
  await prisma.subject.delete({ where: { id } });
  return jsonOk({ deleted: true });
}
