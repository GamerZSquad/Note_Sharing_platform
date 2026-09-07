import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/http";
import { reportSchema } from "@/lib/validations";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) return jsonError("Sign in to report notes", 401);
  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = reportSchema.safeParse(body);
  if (!parsed.success) return jsonError("Select a report reason");

  const note = await prisma.note.findUnique({ where: { id } });
  if (!note || note.status !== "PUBLISHED") return jsonError("Note not found", 404);

  const existing = await prisma.report.findFirst({
    where: { noteId: id, userId: session.user.id, status: "OPEN" },
  });
  if (existing) return jsonError("You already have an open report for this note");

  const report = await prisma.report.create({
    data: {
      noteId: id,
      userId: session.user.id,
      reason: parsed.data.reason,
      details: parsed.data.details,
    },
  });

  return jsonOk(report, 201);
}
