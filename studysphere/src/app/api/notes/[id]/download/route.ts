import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/http";
import { resolveStoredFile } from "@/lib/storage";
import { createReadStream } from "fs";
import { stat } from "fs/promises";
import { Readable } from "stream";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) return jsonError("Sign in to download notes", 401);

  const { id } = await context.params;
  const note = await prisma.note.findUnique({ where: { id } });
  if (!note || note.status !== "PUBLISHED") return jsonError("Note not found", 404);

  const absolute = resolveStoredFile(note.fileUrl);
  if (!absolute) return jsonError("File missing", 404);

  try {
    await stat(absolute);
  } catch {
    return jsonError("File missing", 404);
  }

  await prisma.note.update({
    where: { id },
    data: { downloads: { increment: 1 } },
  });

  const nodeStream = createReadStream(absolute);
  const webStream = Readable.toWeb(nodeStream) as unknown as BodyInit;
  const filename = note.title.replace(/[^\w\- ]+/g, "") || "note";

  return new Response(webStream, {
    headers: {
      "Content-Type":
        note.fileType === "pdf"
          ? "application/pdf"
          : "application/octet-stream",
      "Content-Disposition": `attachment; filename="${filename}.${note.fileType}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
