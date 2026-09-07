import { randomBytes } from "crypto";
import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";

const uploadRoot = path.resolve(process.env.UPLOAD_DIR ?? "./uploads");

export function getUploadRoot(): string {
  return uploadRoot;
}

export async function saveNoteFile(options: {
  noteId: string;
  originalName: string;
  buffer: Buffer;
  extension: string;
}): Promise<{ relativePath: string; absolutePath: string }> {
  const safeName = options.originalName.replace(/[^\w.\-]+/g, "_").slice(0, 80);
  const filename = `${Date.now()}-${randomBytes(6).toString("hex")}-${safeName || `notes.${options.extension}`}`;
  const dir = path.join(uploadRoot, options.noteId);
  await mkdir(dir, { recursive: true });
  const absolutePath = path.join(dir, filename);
  await writeFile(absolutePath, options.buffer);
  return {
    relativePath: `${options.noteId}/${filename}`,
    absolutePath,
  };
}

export function resolveStoredFile(relativePath: string): string | null {
  const normalized = path.normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, "");
  const absolute = path.resolve(uploadRoot, normalized);
  if (!absolute.startsWith(uploadRoot)) return null;
  return absolute;
}

export async function deleteStoredFile(relativePath: string): Promise<void> {
  const absolute = resolveStoredFile(relativePath);
  if (!absolute) return;
  try {
    await unlink(absolute);
  } catch {
    // File may already be gone
  }
}
