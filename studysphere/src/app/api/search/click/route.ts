import { prisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/http";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const searchId = typeof body?.searchId === "string" ? body.searchId : "";
  const clickType = typeof body?.clickType === "string" ? body.clickType : "unknown";
  if (!searchId) return jsonError("searchId is required");

  await prisma.searchEvent.update({
    where: { id: searchId },
    data: { clicked: true, clickType },
  }).catch(() => null);

  return jsonOk({ recorded: true });
}
