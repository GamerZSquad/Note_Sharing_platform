import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { ALLOWED_UPLOAD_CONTENT_TYPES } from "@/lib/notes-upload";
import { isBlobStorageEnabled } from "@/lib/storage";
import { MAX_FILE_SIZE } from "@/lib/constants";
import { NextResponse } from "next/server";

/**
 * Issues scoped private Blob client tokens and handles upload-completed webhooks.
 * Token issuance requires an authenticated owner of a PENDING note whose reserved
 * pathname matches the upload target exactly.
 */
export async function POST(request: Request): Promise<NextResponse> {
  if (!isBlobStorageEnabled()) {
    return NextResponse.json({ error: "Blob storage is not configured" }, { status: 400 });
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const session = await auth();
        if (!session?.user) throw new Error("Not authenticated");
        if (session.user.status === "SUSPENDED") throw new Error("Account suspended");

        const noteId = clientPayload?.trim();
        if (!noteId) throw new Error("Missing note id");

        const note = await prisma.note.findFirst({
          where: {
            id: noteId,
            uploaderId: session.user.id,
            status: "PENDING",
          },
        });
        if (!note) throw new Error("Upload reservation not found");
        if (pathname !== note.fileUrl) {
          throw new Error("Pathname does not match reserved upload target");
        }

        return {
          allowedContentTypes: ALLOWED_UPLOAD_CONTENT_TYPES,
          maximumSizeInBytes: MAX_FILE_SIZE,
          addRandomSuffix: false,
          allowOverwrite: false,
          tokenPayload: JSON.stringify({
            noteId: note.id,
            userId: session.user.id,
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        if (!tokenPayload) return;
        const payload = JSON.parse(tokenPayload) as { noteId?: string; userId?: string };
        if (!payload.noteId || !payload.userId) return;

        const note = await prisma.note.findFirst({
          where: {
            id: payload.noteId,
            uploaderId: payload.userId,
            status: "PENDING",
          },
        });
        if (!note) return;
        if (blob.pathname !== note.fileUrl) return;

        await prisma.note.update({
          where: { id: note.id },
          data: { status: "PUBLISHED" },
        });
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload token failed" },
      { status: 400 },
    );
  }
}
