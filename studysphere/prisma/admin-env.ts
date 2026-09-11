import { registerSchema } from "../src/lib/validations";

/** Same email + password policy the app enforces on registration. */
const adminCredentialsSchema = registerSchema.pick({ email: true, password: true });

/**
 * Reads the bootstrap admin credentials from the environment.
 *
 * Every code path that can create an ADMIN user goes through here, so there is
 * no hardcoded fallback. Thrown messages never contain the password.
 */
export function readAdminCredentials(): { email: string; password: string; name: string } {
  const missing = [
    process.env.ADMIN_EMAIL ? null : "ADMIN_EMAIL",
    process.env.ADMIN_PASSWORD ? null : "ADMIN_PASSWORD",
  ].filter((name): name is string => name !== null);

  if (missing.length > 0) {
    throw new Error(
      `Refusing to create an admin account: ${missing.join(" and ")} must be set. ` +
        "Provide them in the environment for this run and never commit them.",
    );
  }

  const parsed = adminCredentialsSchema.safeParse({
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  });

  if (!parsed.success) {
    const problems = parsed.error.issues
      .map((issue) => `${issue.path.join(".") || "value"}: ${issue.message}`)
      .join("; ");
    throw new Error(`Refusing to create an admin account — ${problems}`);
  }

  return {
    email: parsed.data.email.toLowerCase(),
    password: parsed.data.password,
    name: process.env.ADMIN_NAME?.trim() || "StudySphere Admin",
  };
}
