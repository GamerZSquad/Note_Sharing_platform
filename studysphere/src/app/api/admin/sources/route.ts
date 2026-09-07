import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/http";
import { isAdmin } from "@/lib/permissions";
import { z } from "zod";

const createSchema = z.object({
  domain: z.string().trim().min(3),
  label: z.string().trim().min(2),
  boost: z.coerce.number().min(1).max(2).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) return jsonError("Forbidden", 403);
  const domains = await prisma.trustedDomain.findMany({ orderBy: { domain: "asc" } });
  return jsonOk(domains);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) return jsonError("Forbidden", 403);
  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("Invalid domain");
  const domain = parsed.data.domain.toLowerCase().replace(/^www\./, "");
  const created = await prisma.trustedDomain.create({
    data: {
      domain,
      label: parsed.data.label,
      boost: parsed.data.boost ?? 1.25,
    },
  });
  return jsonOk(created, 201);
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) return jsonError("Forbidden", 403);
  const body = await request.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id : "";
  if (!id) return jsonError("id is required");
  const updated = await prisma.trustedDomain.update({
    where: { id },
    data: { enabled: Boolean(body.enabled) },
  });
  return jsonOk(updated);
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) return jsonError("Forbidden", 403);
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return jsonError("id is required");
  await prisma.trustedDomain.delete({ where: { id } });
  return jsonOk({ deleted: true });
}
