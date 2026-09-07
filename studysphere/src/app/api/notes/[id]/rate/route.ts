import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/http";
import { ratingSchema } from "@/lib/validations";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) return jsonError("Sign in to rate notes", 401);
  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = ratingSchema.safeParse(body);
  if (!parsed.success) return jsonError("Rating must be between 1 and 5");

  const note = await prisma.note.findUnique({ where: { id } });
  if (!note || note.status !== "PUBLISHED") return jsonError("Note not found", 404);
  if (note.uploaderId === session.user.id) {
    return jsonError("You cannot rate your own note");
  }

  const rating = await prisma.rating.upsert({
    where: {
      userId_noteId: { userId: session.user.id, noteId: id },
    },
    update: { rating: parsed.data.rating, helpful: parsed.data.helpful },
    create: {
      userId: session.user.id,
      noteId: id,
      rating: parsed.data.rating,
      helpful: parsed.data.helpful,
    },
  });

  return jsonOk(rating);
}
