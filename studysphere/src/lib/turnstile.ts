const SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const VERIFY_TIMEOUT_MS = 10_000;

/** Friendly client-facing message — never include Cloudflare codes. */
export const TURNSTILE_FAILURE_MESSAGE =
  "Please complete the security check and try again.";

export function isTurnstileConfigured(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY?.trim());
}

export function getTurnstileSiteKey(): string | undefined {
  const key = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();
  return key || undefined;
}

/**
 * Server-only Turnstile Siteverify.
 * Returns true only when Cloudflare confirms the token.
 * Never logs the token, secret, or full provider response body.
 */
export async function verifyTurnstileToken(
  token: unknown,
  options?: { remoteIp?: string | null },
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret) {
    console.error("[turnstile] TURNSTILE_SECRET_KEY is not set");
    return false;
  }

  if (typeof token !== "string" || token.trim().length === 0) {
    console.warn("[turnstile] missing or empty token");
    return false;
  }

  try {
    const body = new URLSearchParams();
    body.set("secret", secret);
    body.set("response", token.trim());
    const ip = options?.remoteIp?.trim();
    if (ip) body.set("remoteip", ip);

    const response = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(VERIFY_TIMEOUT_MS),
    });

    if (!response.ok) {
      console.error(`[turnstile] siteverify HTTP ${response.status}`);
      return false;
    }

    const data = (await response.json()) as {
      success?: boolean;
      "error-codes"?: string[];
    };

    if (!data.success) {
      const codes = Array.isArray(data["error-codes"])
        ? data["error-codes"].join(",")
        : "unknown";
      console.warn(`[turnstile] validation failed codes=${codes}`);
      return false;
    }

    return true;
  } catch (error) {
    const name = error instanceof Error ? error.name : "Error";
    console.error(`[turnstile] siteverify failed (${name})`);
    return false;
  }
}

/** Prefer Cloudflare's connecting IP when present (e.g. behind CF / Vercel). */
export function turnstileRemoteIp(request: Request): string | undefined {
  const cf = request.headers.get("cf-connecting-ip")?.trim();
  if (cf) return cf;
  const forwarded = request.headers.get("x-forwarded-for");
  if (!forwarded) return undefined;
  return forwarded.split(",")[0]?.trim() || undefined;
}
