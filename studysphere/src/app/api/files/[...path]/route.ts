import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/http";
import { resolveStoredFile } from "@/lib/storage";
import { createReadStream } from "fs";
import { stat } from "fs/promises";
import { Readable } from "stream";

export async function GET(
  _request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await context.params;
  const relative = segments.join("/");
  const noteId = segments[0];
  const note = await prisma.note.findFirst({
    where: { id: noteId, status: "PUBLISHED" },
  });
  if (!note) return jsonError("File not found", 404);

  const absolute = resolveStoredFile(relative);
  if (!absolute) return jsonError("Invalid path", 400);

  try {
    await stat(absolute);
  } catch {
    return jsonError("File not found", 404);
  }

  const nodeStream = createReadStream(absolute);
  const webStream = Readable.toWeb(nodeStream) as unknown as BodyInit;
  return new Response(webStream, {
    headers: {
      "Content-Type":
        note.fileType === "pdf" ? "application/pdf" : "application/octet-stream",
      "Content-Disposition": "inline",
      "Cache-Control": "private, max-age=3600",
    },
  });
}
