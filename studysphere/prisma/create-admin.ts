import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { readAdminCredentials } from "./admin-env";

const prisma = new PrismaClient();

/**
 * Non-destructive first-admin bootstrap, safe to run against a real database.
 *
 * Unlike prisma/seed.ts this deletes nothing: it creates the admin, or promotes
 * an existing account with the same email and rotates its password. Re-running
 * it with a new ADMIN_PASSWORD is the supported recovery path.
 */
async function main() {
  const { email, password, name } = readAdminCredentials();

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  const passwordHash = await hash(password, 12);
  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      role: "ADMIN",
      status: "ACTIVE",
      emailVerified: new Date(),
      passwordHash,
    },
    create: {
      name,
      email,
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE",
      emailVerified: new Date(),
    },
    select: { email: true },
  });

  console.log(
    existing
      ? `Promoted existing account to ADMIN and rotated its password: ${admin.email}`
      : `Created ADMIN account: ${admin.email}`,
  );
  console.log("The password came from ADMIN_PASSWORD and is not printed.");
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : "Failed to create admin");
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
