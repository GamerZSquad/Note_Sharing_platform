import { prisma } from "@/lib/db";
import { AdminSourcesClient } from "./sources-client";

export default async function AdminSourcesPage() {
  const domains = await prisma.trustedDomain.findMany({
    orderBy: { domain: "asc" },
  });

  return <AdminSourcesClient initialDomains={domains} />;
}
