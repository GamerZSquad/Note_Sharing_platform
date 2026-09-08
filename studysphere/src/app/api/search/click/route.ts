import { auth } from "@/auth";
import { jsonError, jsonOk } from "@/lib/http";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { recordSearchClick } from "@/lib/search/click";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return jsonError("Sign in to record search activity", 401);

  const limited = rateLimit(
    clientKey(request, `search-click:${session.user.id}`),
    60,
    60_000,
  );
  if (!limited.ok) return jsonError("Too many click events. Slow down.", 429);

  const body = await request.json().catch(() => null);
  const searchId = typeof body?.searchId === "string" ? body.searchId : "";
  const clickType = typeof body?.clickType === "string" ? body.clickType : "";
  if (!searchId) return jsonError("searchId is required");
  if (!clickType || !["community", "external"].includes(clickType)) {
    return jsonError("clickType must be community or external");
  }

  const result = await recordSearchClick({
    searchId,
    clickType: clickType as "community" | "external",
    userId: session.user.id,
  });

  if (!result.ok) return jsonError(result.error, result.status);
  return jsonOk({ recorded: true });
}
