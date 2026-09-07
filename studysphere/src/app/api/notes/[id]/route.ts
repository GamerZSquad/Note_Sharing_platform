import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/http";
import { canManageNote } from "@/lib/permissions";
import { deleteStoredFile } from "@/lib/storage";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const note = await prisma.note.findUnique({
    where: { id },
    include: {
      subject: true,
      uploader: { select: { id: true, name: true, department: true } },
      tags: { include: { tag: true } },
      ratings: true,
    },
  });
  if (!note || note.status === "REMOVED") return jsonError("Note not found", 404);

  const ratings = note.ratings.map((r) => r.rating);
  const avgRating =
    ratings.length === 0
      ? 0
      : ratings.reduce((sum, value) => sum + value, 0) / ratings.length;

  return jsonOk({
    ...note,
    tags: note.tags.map((entry) => entry.tag.name),
    avgRating: Number(avgRating.toFixed(1)),
    ratingCount: ratings.length,
    helpfulCount: note.ratings.filter((r) => r.helpful).length,
  });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) return jsonError("Unauthorized", 401);
  const { id } = await context.params;
  const note = await prisma.note.findUnique({ where: { id } });
  if (!note) return jsonError("Note not found", 404);
  if (
    !canManageNote({
      role: session.user.role,
      userId: session.user.id,
      uploaderId: note.uploaderId,
    })
  ) {
    return jsonError("You cannot delete this note", 403);
  }

  await prisma.note.update({
    where: { id },
    data: { status: "REMOVED" },
  });
  await deleteStoredFile(note.fileUrl);
  return jsonOk({ message: "Note removed" });
}
