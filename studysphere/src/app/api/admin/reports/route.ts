import { prisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/http";
import { requireAdminUser } from "@/lib/session";
import { z } from "zod";

const patchSchema = z.object({
  id: z.string(),
  status: z.enum(["OPEN", "REJECTED", "ACTIONED"]),
  removeNote: z.boolean().optional(),
  suspendUser: z.boolean().optional(),
});

export async function GET() {
  const gate = await requireAdminUser();
  if (!gate.ok) return gate.response;
  const reports = await prisma.report.findMany({
    include: {
      note: { select: { id: true, title: true, status: true, uploaderId: true } },
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return jsonOk(reports);
}

export async function PATCH(request: Request) {
  const gate = await requireAdminUser();
  if (!gate.ok) return gate.response;
  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("Invalid update");

  const report = await prisma.report.findUnique({
    where: { id: parsed.data.id },
    include: { note: true },
  });
  if (!report) return jsonError("Report not found", 404);

  if (parsed.data.removeNote) {
    await prisma.note.update({
      where: { id: report.noteId },
      data: { status: "REMOVED" },
    });
  }
  if (parsed.data.suspendUser) {
    await prisma.user.update({
      where: { id: report.note.uploaderId },
      data: { status: "SUSPENDED" },
    });
  }

  const updated = await prisma.report.update({
    where: { id: report.id },
    data: { status: parsed.data.status, reviewedAt: new Date() },
  });
  return jsonOk(updated);
}
