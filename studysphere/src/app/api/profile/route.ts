import { prisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/http";
import { requireActiveUser } from "@/lib/session";
import { profileSchema } from "@/lib/validations";

export async function PATCH(request: Request) {
  const gate = await requireActiveUser("Unauthorized");
  if (!gate.ok) return gate.response;
  const body = await request.json().catch(() => null);
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid profile details");

  const user = await prisma.user.update({
    where: { id: gate.user.id },
    data: {
      name: parsed.data.name,
      department: parsed.data.department,
      semester: parsed.data.semester ?? null,
      bio: parsed.data.bio,
    },
    select: {
      id: true,
      name: true,
      email: true,
      department: true,
      semester: true,
      bio: true,
    },
  });

  return jsonOk(user);
}
