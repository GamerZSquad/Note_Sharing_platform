import { prisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/http";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : "";
  if (!token) return jsonError("Verification token is required");

  const record = await prisma.verificationToken.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!record || record.expiresAt < new Date()) {
    return jsonError("This verification link is invalid or has expired");
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { emailVerified: new Date(), status: "ACTIVE" },
    }),
    prisma.verificationToken.deleteMany({ where: { userId: record.userId } }),
  ]);

  return jsonOk({ message: "Email verified. You can now sign in." });
}
