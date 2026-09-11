import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/http";
import { requireActiveUser } from "@/lib/session";
import { openStoredFile } from "@/lib/storage";

export async function GET(
  _request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const gate = await requireActiveUser("Sign in to preview notes");
  if (!gate.ok) return gate.response;

  const { path: segments } = await context.params;
  const relative = segments.join("/");
  const noteId = segments[0];
  const note = await prisma.note.findFirst({
    where: { id: noteId, status: "PUBLISHED" },
  });
  if (!note) return jsonError("File not found", 404);

  // Only serve the exact stored file path for this note
  if (relative !== note.fileUrl) {
    return jsonError("File not found", 404);
  }

  const file = await openStoredFile(relative);
  if (!file) return jsonError("File not found", 404);

  return new Response(file.stream, {
    headers: {
      "Content-Type":
        file.contentType ??
        (note.fileType === "pdf" ? "application/pdf" : "application/octet-stream"),
      "Content-Disposition": "inline",
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
