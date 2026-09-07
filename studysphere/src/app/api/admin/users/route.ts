import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/http";
import { isAdmin } from "@/lib/permissions";
import { z } from "zod";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) return null;
  return session;
}

const patchSchema = z.object({
  id: z.string(),
  status: z.enum(["ACTIVE", "SUSPENDED"]).optional(),
  role: z.enum(["STUDENT", "ADMIN"]).optional(),
});

export async function GET() {
  if (!(await requireAdmin())) return jsonError("Forbidden", 403);
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      department: true,
      semester: true,
      createdAt: true,
      _count: { select: { notes: true, reports: true } },
    },
  });
  return jsonOk(users);
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) return jsonError("Forbidden", 403);
  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("Invalid update");
  const user = await prisma.user.update({
    where: { id: parsed.data.id },
    data: {
      ...(parsed.data.status ? { status: parsed.data.status } : {}),
      ...(parsed.data.role ? { role: parsed.data.role } : {}),
    },
  });
  return jsonOk(user);
}
