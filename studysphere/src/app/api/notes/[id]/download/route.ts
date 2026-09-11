import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/http";
import { requireActiveUser } from "@/lib/session";
import { openStoredFile } from "@/lib/storage";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const gate = await requireActiveUser("Sign in to download notes");
  if (!gate.ok) return gate.response;

  const { id } = await context.params;
  const note = await prisma.note.findUnique({ where: { id } });
  if (!note || note.status !== "PUBLISHED") return jsonError("Note not found", 404);

  const file = await openStoredFile(note.fileUrl);
  if (!file) return jsonError("File missing", 404);

  await prisma.note.update({
    where: { id },
    data: { downloads: { increment: 1 } },
  });

  const filename = note.title.replace(/[^\w\- ]+/g, "") || "note";

  return new Response(file.stream, {
    headers: {
      "Content-Type":
        file.contentType ??
        (note.fileType === "pdf"
          ? "application/pdf"
          : "application/octet-stream"),
      "Content-Disposition": `attachment; filename="${filename}.${note.fileType}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
