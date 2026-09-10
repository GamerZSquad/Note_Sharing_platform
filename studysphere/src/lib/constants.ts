export const ROLES = ["STUDENT", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];

export const USER_STATUSES = [
  "PENDING_VERIFICATION",
  "ACTIVE",
  "SUSPENDED",
] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const NOTE_STATUSES = ["PUBLISHED", "PENDING", "REMOVED"] as const;
export type NoteStatus = (typeof NOTE_STATUSES)[number];

export const RESOURCE_TYPES = [
  "NOTES",
  "QUESTION_PAPER",
  "BOOK",
  "TUTORIAL",
  "PDF",
  "ARTICLE",
  "VIDEO",
] as const;
export type ResourceType = (typeof RESOURCE_TYPES)[number];

export const REPORT_REASONS = [
  "COPYRIGHT",
  "WRONG_INFORMATION",
  "SPAM",
  "OFFENSIVE",
  "MALICIOUS_FILE",
  "OTHER",
] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

export const DEPARTMENTS = [
  "Computer Science",
  "Information Technology",
  "Electronics",
  "Electrical",
  "Mechanical",
  "Civil",
  "Mathematics",
  "Physics",
] as const;

export const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

export const SOURCE_TYPES = [
  "community",
  "university",
  "educational",
  "documentation",
  "oer",
] as const;

export const SORT_OPTIONS = [
  "relevant",
  "downloads",
  "rating",
  "newest",
] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

export const MAX_FILE_SIZE = 50 * 1024 * 1024;

export const ALLOWED_MIME_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    "pptx",
  "application/vnd.ms-powerpoint": "ppt",
  "text/plain": "txt",
};

export const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  NOTES: "Notes",
  QUESTION_PAPER: "Question Papers",
  BOOK: "Books",
  TUTORIAL: "Tutorials",
  PDF: "PDFs",
  ARTICLE: "Articles",
  VIDEO: "Videos",
};

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  COPYRIGHT: "Copyright issue",
  WRONG_INFORMATION: "Wrong information",
  SPAM: "Spam",
  OFFENSIVE: "Offensive content",
  MALICIOUS_FILE: "Malicious file",
  OTHER: "Other",
};
