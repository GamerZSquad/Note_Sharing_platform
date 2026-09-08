import { auth } from "@/auth";
import { getAdminAnalytics } from "@/lib/analytics";
import { jsonError, jsonOk } from "@/lib/http";
import { isAdmin } from "@/lib/permissions";

export async function GET() {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) return jsonError("Forbidden", 403);
  return jsonOk(await getAdminAnalytics());
}
