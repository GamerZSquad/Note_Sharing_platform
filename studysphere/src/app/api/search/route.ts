import { auth } from "@/auth";
import { jsonError, jsonOk } from "@/lib/http";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { unifiedSearch } from "@/lib/search/unified";
import { searchQuerySchema } from "@/lib/validations";

export async function GET(request: Request) {
  const limited = rateLimit(clientKey(request, "search"), 40);
  if (!limited.ok) return jsonError("Too many searches. Slow down.", 429);

  const { searchParams } = new URL(request.url);
  const parsed = searchQuerySchema.safeParse({
    q: searchParams.get("q") ?? "",
    department: searchParams.get("department") || undefined,
    semester: searchParams.get("semester") || undefined,
    subject: searchParams.get("subject") || undefined,
    unit: searchParams.get("unit") || undefined,
    type: searchParams.get("type") || undefined,
    source: searchParams.get("source") || undefined,
    sort: searchParams.get("sort") || undefined,
    page: searchParams.get("page") || undefined,
    pageSize: searchParams.get("pageSize") || undefined,
  });
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Enter a search query";
    return jsonError(message);
  }

  const session = await auth();
  const result = await unifiedSearch(parsed.data.q, parsed.data, session?.user?.id);
  return jsonOk(result);
}
