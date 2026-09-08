import { z } from "zod";
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE, REPORT_REASONS, RESOURCE_TYPES } from "@/lib/constants";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().trim().email("Enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72)
    .regex(/[A-Za-z]/, "Password must include a letter")
    .regex(/[0-9]/, "Password must include a number"),
  department: z.string().trim().optional(),
  semester: z.coerce.number().int().min(1).max(8).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password: z
    .string()
    .min(8)
    .max(72)
    .regex(/[A-Za-z]/)
    .regex(/[0-9]/),
});

export const noteUploadSchema = z.object({
  title: z.string().trim().min(4).max(160),
  description: z.string().trim().min(10).max(2000),
  subjectId: z.string().min(1, "Subject is required"),
  unit: z.string().trim().max(40).optional(),
  tags: z.string().trim().max(200).optional(),
  resourceType: z.enum(RESOURCE_TYPES).default("NOTES"),
});

export const ratingSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  helpful: z.boolean().optional(),
});

export const reportSchema = z.object({
  reason: z.enum(REPORT_REASONS),
  details: z.string().trim().max(500).optional(),
});

export const profileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  department: z.string().trim().max(80).optional(),
  semester: z.coerce.number().int().min(1).max(8).optional().nullable(),
  bio: z.string().trim().max(400).optional(),
});

export const searchQuerySchema = z.object({
  q: z.string().trim().min(1).max(200),
  department: z.string().optional(),
  semester: z.coerce.number().int().optional(),
  subject: z.string().optional(),
  unit: z.string().optional(),
  type: z.string().optional(),
  source: z.string().optional(),
  sort: z.enum(["relevant", "downloads", "rating", "newest"]).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(10),
});

export type UploadFileInput = {
  type: string;
  size: number;
  name: string;
};

export function validateUploadFile(file: UploadFileInput): {
  ok: true;
  extension: string;
} | { ok: false; error: string } {
  if (!file.name || file.size <= 0) {
    return { ok: false, error: "A file is required" };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { ok: false, error: "File must be 15MB or smaller" };
  }
  const extension = ALLOWED_MIME_TYPES[file.type];
  if (!extension) {
    const fallback = file.name.split(".").pop()?.toLowerCase();
    const allowedExt = new Set(Object.values(ALLOWED_MIME_TYPES));
    if (!fallback || !allowedExt.has(fallback)) {
      return {
        ok: false,
        error: "Only PDF, DOC, DOCX, PPT, PPTX, and TXT files are allowed",
      };
    }
    return { ok: true, extension: fallback };
  }
  return { ok: true, extension };
}
