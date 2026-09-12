import { beforeEach, describe, expect, it, vi } from "vitest";

const verifyTurnstileToken = vi.fn();
const findUnique = vi.fn();
const createUser = vi.fn();
const createVerification = vi.fn();
const sendVerificationEmail = vi.fn();
const hash = vi.fn();
const rateLimit = vi.fn();
const signIn = vi.fn();

vi.mock("next-auth", () => {
  class AuthError extends Error {
    type = "CredentialsSignin";
    code?: string;
  }
  return { AuthError };
});

vi.mock("@/lib/turnstile", () => ({
  TURNSTILE_FAILURE_MESSAGE:
    "Please complete the security check and try again.",
  turnstileRemoteIp: () => "127.0.0.1",
  verifyTurnstileToken: (...args: unknown[]) => verifyTurnstileToken(...args),
}));

vi.mock("@/lib/rate-limit", () => ({
  clientKey: () => "test",
  rateLimit: (...args: unknown[]) => rateLimit(...args),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => findUnique(...args),
      create: (...args: unknown[]) => createUser(...args),
    },
    verificationToken: {
      create: (...args: unknown[]) => createVerification(...args),
    },
  },
}));

vi.mock("@/lib/email", () => ({
  appUrl: (path: string) => `https://studysphere.space${path}`,
  sendVerificationEmail: (...args: unknown[]) => sendVerificationEmail(...args),
}));

vi.mock("bcryptjs", () => ({
  hash: (...args: unknown[]) => hash(...args),
}));

vi.mock("@/auth", () => ({
  signIn: (...args: unknown[]) => signIn(...args),
}));

import { AuthError } from "next-auth";
import { POST as registerPost } from "@/app/api/auth/register/route";
import { loginAction } from "@/app/login/actions";

async function readJson(response: Response) {
  return response.json() as Promise<{
    ok: boolean;
    error?: string;
    data?: { message?: string };
  }>;
}

describe("register API Turnstile enforcement", () => {
  beforeEach(() => {
    verifyTurnstileToken.mockReset();
    findUnique.mockReset();
    createUser.mockReset();
    createVerification.mockReset();
    sendVerificationEmail.mockReset();
    hash.mockReset();
    rateLimit.mockReset();
    rateLimit.mockReturnValue({ ok: true });
  });

  it("rejects form submission without a valid Turnstile token", async () => {
    verifyTurnstileToken.mockResolvedValue(false);

    const response = await registerPost(
      new Request("https://studysphere.space/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Alex Student",
          email: "alex@example.com",
          password: "Password1",
        }),
      }),
    );

    expect(response.status).toBe(400);
    expect(await readJson(response)).toEqual({
      ok: false,
      error: "Please complete the security check and try again.",
    });
    expect(findUnique).not.toHaveBeenCalled();
  });

  it("allows registration when Turnstile succeeds", async () => {
    verifyTurnstileToken.mockResolvedValue(true);
    findUnique.mockResolvedValue(null);
    hash.mockResolvedValue("hashed");
    createUser.mockResolvedValue({
      id: "user-1",
      email: "alex@example.com",
      name: "Alex Student",
    });
    createVerification.mockResolvedValue({});
    sendVerificationEmail.mockResolvedValue(true);

    const response = await registerPost(
      new Request("https://studysphere.space/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Alex Student",
          email: "alex@example.com",
          password: "Password1",
          turnstileToken: "valid-turnstile-token",
        }),
      }),
    );

    expect(response.status).toBe(201);
    const payload = await readJson(response);
    expect(payload.ok).toBe(true);
    expect(verifyTurnstileToken).toHaveBeenCalledWith(
      "valid-turnstile-token",
      expect.any(Object),
    );
    expect(createUser).toHaveBeenCalledOnce();
  });
});

describe("loginAction Turnstile messaging", () => {
  beforeEach(() => {
    signIn.mockReset();
  });

  it("returns a friendly message when Turnstile auth fails", async () => {
    const error = Object.assign(new AuthError("CredentialsSignin"), {
      code: "turnstile",
    });
    signIn.mockRejectedValue(error);

    const formData = new FormData();
    formData.set("email", "student@studysphere.dev");
    formData.set("password", "Student123");
    formData.set("next", "/dashboard");

    await expect(loginAction(undefined, formData)).resolves.toBe(
      "Please complete the security check and try again.",
    );
  });

  it("completes sign-in when credentials and Turnstile are accepted", async () => {
    signIn.mockResolvedValue(undefined as never);

    const formData = new FormData();
    formData.set("email", "student@studysphere.dev");
    formData.set("password", "Student123");
    formData.set("turnstileToken", "valid-turnstile-token");
    formData.set("next", "/dashboard");

    await expect(loginAction(undefined, formData)).resolves.toBeUndefined();
    expect(signIn).toHaveBeenCalledWith(
      "credentials",
      expect.objectContaining({
        turnstileToken: "valid-turnstile-token",
      }),
    );
  });
});
