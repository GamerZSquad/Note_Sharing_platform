import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/http";
import { profileSchema } from "@/lib/validations";

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user) return jsonError("Unauthorized", 401);
  const body = await request.json().catch(() => null);
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid profile details");

  const user = await prisma.user.update({
    where: { id: session.user.id },
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
