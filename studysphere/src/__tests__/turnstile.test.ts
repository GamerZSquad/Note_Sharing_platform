import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  TURNSTILE_FAILURE_MESSAGE,
  turnstileRemoteIp,
  verifyTurnstileToken,
} from "@/lib/turnstile";

const SECRET = "test-turnstile-secret";

describe("verifyTurnstileToken", () => {
  const originalSecret = process.env.TURNSTILE_SECRET_KEY;
  const fetchMock = vi.fn();

  beforeEach(() => {
    process.env.TURNSTILE_SECRET_KEY = SECRET;
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    if (originalSecret === undefined) delete process.env.TURNSTILE_SECRET_KEY;
    else process.env.TURNSTILE_SECRET_KEY = originalSecret;
    vi.unstubAllGlobals();
  });

  it("rejects a missing token without calling Cloudflare", async () => {
    await expect(verifyTurnstileToken(undefined)).resolves.toBe(false);
    await expect(verifyTurnstileToken("")).resolves.toBe(false);
    await expect(verifyTurnstileToken("   ")).resolves.toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects when the secret key is not configured", async () => {
    delete process.env.TURNSTILE_SECRET_KEY;
    await expect(verifyTurnstileToken("token-value")).resolves.toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects an invalid Cloudflare response", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: false,
        "error-codes": ["invalid-input-response"],
      }),
    });

    await expect(verifyTurnstileToken("bad-token")).resolves.toBe(false);
    expect(fetchMock).toHaveBeenCalledOnce();
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = String(init.body);
    expect(body).toContain("secret=");
    expect(body).toContain("response=bad-token");
    expect(body).not.toContain(TURNSTILE_FAILURE_MESSAGE);
  });

  it("accepts a successful Cloudflare validation", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    await expect(
      verifyTurnstileToken("good-token", { remoteIp: "203.0.113.10" }),
    ).resolves.toBe(true);

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(String(init.body)).toContain("remoteip=203.0.113.10");
  });

  it("rejects on Cloudflare timeout or network failure", async () => {
    fetchMock.mockRejectedValue(new DOMException("Aborted", "TimeoutError"));
    await expect(verifyTurnstileToken("slow-token")).resolves.toBe(false);
  });

  it("rejects when siteverify returns a non-OK HTTP status", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({}),
    });
    await expect(verifyTurnstileToken("token")).resolves.toBe(false);
  });
});

describe("turnstileRemoteIp", () => {
  it("prefers cf-connecting-ip then x-forwarded-for", () => {
    expect(
      turnstileRemoteIp(
        new Request("https://studysphere.space", {
          headers: {
            "cf-connecting-ip": "198.51.100.1",
            "x-forwarded-for": "203.0.113.1, 192.0.2.1",
          },
        }),
      ),
    ).toBe("198.51.100.1");

    expect(
      turnstileRemoteIp(
        new Request("https://studysphere.space", {
          headers: { "x-forwarded-for": "203.0.113.1, 192.0.2.1" },
        }),
      ),
    ).toBe("203.0.113.1");
  });
});
