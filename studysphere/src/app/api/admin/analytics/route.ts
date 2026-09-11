import { getAdminAnalytics } from "@/lib/analytics";
import { jsonOk } from "@/lib/http";
import { requireAdminUser } from "@/lib/session";

export async function GET() {
  const gate = await requireAdminUser();
  if (!gate.ok) return gate.response;
  return jsonOk(await getAdminAnalytics());
}
