import { ALLOWED_MIME_TYPES } from "@/lib/constants";
import { noteUploadSchema } from "@/lib/validations";
import { z } from "zod";

export function parseTags(raw?: string): string[] {
  if (!raw) return [];
  return raw
    .split(/[,#]/)
    .map((tag) => tag.trim().toLowerCase())
    .filter((tag) => tag.length >= 2)
    .slice(0, 8);
}

export const notePrepareSchema = noteUploadSchema.extend({
  fileName: z.string().trim().min(1).max(180),
  fileType: z.string().trim().min(1).max(120),
  fileSize: z.coerce.number().int().positive(),
});

export const ALLOWED_UPLOAD_CONTENT_TYPES = Object.keys(ALLOWED_MIME_TYPES);
