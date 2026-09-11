import { jsonError, jsonOk } from "@/lib/http";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { recordSearchClick } from "@/lib/search/click";
import { requireActiveUser } from "@/lib/session";

export async function POST(request: Request) {
  const gate = await requireActiveUser("Sign in to record search activity");
  if (!gate.ok) return gate.response;

  const limited = rateLimit(
    clientKey(request, `search-click:${gate.user.id}`),
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
    userId: gate.user.id,
  });

  if (!result.ok) return jsonError(result.error, result.status);
  return jsonOk({ recorded: true });
}
