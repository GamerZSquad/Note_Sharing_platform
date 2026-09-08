import { prisma } from "@/lib/db";

const MAX_CLICK_AGE_MS = 24 * 60 * 60 * 1000;

export type RecordSearchClickInput = {
  searchId: string;
  clickType: "community" | "external";
  userId: string;
};

export type RecordSearchClickResult =
  | { ok: true }
  | { ok: false; status: 404 | 403; error: string };

/**
 * Marks a search event as successful when an authenticated user clicks a result.
 * Rejects unknown search IDs and events owned by a different user.
 */
export async function recordSearchClick(
  input: RecordSearchClickInput,
): Promise<RecordSearchClickResult> {
  const event = await prisma.searchEvent.findUnique({
    where: { id: input.searchId },
  });
  if (!event) {
    return { ok: false, status: 404, error: "Search event not found" };
  }

  if (event.userId && event.userId !== input.userId) {
    return { ok: false, status: 403, error: "Search event does not belong to this user" };
  }

  const age = Date.now() - event.createdAt.getTime();
  if (age > MAX_CLICK_AGE_MS) {
    return { ok: false, status: 403, error: "Search event has expired" };
  }

  await prisma.searchEvent.update({
    where: { id: event.id },
    data: {
      clicked: true,
      clickType: input.clickType,
      // Attach anonymous searches to the clicking user when possible
      userId: event.userId ?? input.userId,
    },
  });

  return { ok: true };
}
