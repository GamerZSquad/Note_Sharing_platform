import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/http";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { saveNoteFile } from "@/lib/storage";
import { noteUploadSchema, validateUploadFile } from "@/lib/validations";
import { randomUUID } from "crypto";

function parseTags(raw?: string): string[] {
  if (!raw) return [];
  return raw
    .split(/[,#]/)
    .map((tag) => tag.trim().toLowerCase())
    .filter((tag) => tag.length >= 2)
    .slice(0, 8);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const subjectId = searchParams.get("subjectId") ?? undefined;
  const uploaderId = searchParams.get("uploaderId") ?? undefined;
  const take = Math.min(Number(searchParams.get("take") ?? 24), 50);

  const notes = await prisma.note.findMany({
    where: {
      status: "PUBLISHED",
      ...(subjectId ? { subjectId } : {}),
      ...(uploaderId ? { uploaderId } : {}),
    },
    include: {
      subject: true,
      uploader: { select: { id: true, name: true } },
      tags: { include: { tag: true } },
      ratings: true,
    },
    orderBy: { createdAt: "desc" },
    take,
  });

  return jsonOk(
    notes.map((note) => {
      const ratings = note.ratings.map((r) => r.rating);
      const avgRating =
        ratings.length === 0
          ? 0
          : ratings.reduce((sum, value) => sum + value, 0) / ratings.length;
      return {
        id: note.id,
        title: note.title,
        description: note.description,
        fileType: note.fileType,
        resourceType: note.resourceType,
        unit: note.unit,
        downloads: note.downloads,
        createdAt: note.createdAt,
        avgRating: Number(avgRating.toFixed(1)),
        ratingCount: ratings.length,
        subject: note.subject,
        uploader: note.uploader,
        tags: note.tags.map((entry) => entry.tag.name),
      };
    }),
  );
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return jsonError("Sign in to upload notes", 401);
  if (session.user.status === "SUSPENDED") {
    return jsonError("This account is suspended", 403);
  }

  const limited = rateLimit(clientKey(request, `upload:${session.user.id}`), 10, 60 * 60_000);
  if (!limited.ok) return jsonError("Upload limit reached. Try again later.", 429);

  const form = await request.formData();
  const parsed = noteUploadSchema.safeParse({
    title: form.get("title"),
    description: form.get("description"),
    subjectId: form.get("subjectId"),
    unit: form.get("unit") || undefined,
    tags: form.get("tags") || undefined,
    resourceType: form.get("resourceType") || "NOTES",
  });
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid note details");
  }

  const file = form.get("file");
  if (!(file instanceof File)) return jsonError("A file is required");
  const fileCheck = validateUploadFile({
    type: file.type,
    size: file.size,
    name: file.name,
  });
  if (!fileCheck.ok) return jsonError(fileCheck.error);

  const subject = await prisma.subject.findUnique({
    where: { id: parsed.data.subjectId },
  });
  if (!subject) return jsonError("Subject not found");

  const noteId = randomUUID();
  const buffer = Buffer.from(await file.arrayBuffer());
  const stored = await saveNoteFile({
    noteId,
    originalName: file.name,
    buffer,
    extension: fileCheck.extension,
  });

  const tagNames = parseTags(parsed.data.tags);
  const note = await prisma.note.create({
    data: {
      id: noteId,
      title: parsed.data.title,
      description: parsed.data.description,
      fileUrl: stored.relativePath,
      fileType: fileCheck.extension,
      fileSize: file.size,
      resourceType: parsed.data.resourceType,
      unit: parsed.data.unit,
      uploaderId: session.user.id,
      subjectId: subject.id,
      status: "PUBLISHED",
      tags: {
        create: await Promise.all(
          tagNames.map(async (name) => {
            const tag = await prisma.tag.upsert({
              where: { name },
              update: {},
              create: { name },
            });
            return { tagId: tag.id };
          }),
        ),
      },
    },
    include: { subject: true },
  });

  return jsonOk(note, 201);
}
