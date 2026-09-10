import { auth } from "@/auth";
import { MAX_FILE_SIZE } from "@/lib/constants";
import { jsonOk } from "@/lib/http";
import { isBlobStorageEnabled } from "@/lib/storage";

/** Tells the upload UI whether to use direct-to-Blob or local FormData. */
export async function GET() {
  await auth();
  return jsonOk({
    strategy: isBlobStorageEnabled() ? ("blob" as const) : ("local" as const),
    maxFileBytes: MAX_FILE_SIZE,
  });
}
