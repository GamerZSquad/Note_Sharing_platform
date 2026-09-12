import { randomBytes } from "crypto";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";
import { registerSchema } from "@/lib/validations";
import { sendVerificationEmail, appUrl } from "@/lib/email";
import { jsonError, jsonOk } from "@/lib/http";
import { clientKey, rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const limited = rateLimit(clientKey(request, "register"), 8, 10 * 60_000);
  if (!limited.ok) {
    return jsonError("Too many registration attempts. Try again later.", 429);
  }

  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return jsonError("An account with this email already exists", 409);
  }

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email,
      passwordHash: await hash(parsed.data.password, 12),
      department: parsed.data.department,
      semester: parsed.data.semester,
      role: "STUDENT",
      status: "PENDING_VERIFICATION",
    },
  });

  const token = randomBytes(32).toString("hex");
  await prisma.verificationToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  const verifyUrl = appUrl(`/verify-email?token=${token}`);
  const delivered = await sendVerificationEmail({
    to: user.email,
    name: user.name,
    verifyUrl,
  });

  return jsonOk(
    {
      message: delivered
        ? "Account created. Check your email to verify your account."
        : "Account created, but the verification email could not be sent. Please contact support to activate your account.",
      verifyUrl: process.env.NODE_ENV === "production" ? undefined : verifyUrl,
    },
    201,
  );
}
