/**
 * Who may read note metadata (title, description, fileUrl path, etc.).
 * File bytes stay behind the separate auth-gated /api/files route.
 */
export function canReadNoteMetadata(options: {
  status: string;
  uploaderId: string;
  viewerId?: string | null;
  viewerRole?: string | null;
}): boolean {
  if (options.status === "REMOVED") return false;
  if (options.status === "PUBLISHED") return true;
  if (options.status === "PENDING") {
    if (!options.viewerId) return false;
    if (options.viewerRole === "ADMIN") return true;
    return options.viewerId === options.uploaderId;
  }
  return false;
}
