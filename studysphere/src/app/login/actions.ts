"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { TURNSTILE_FAILURE_MESSAGE } from "@/lib/turnstile";

function isTurnstileAuthError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const withCode = error as { code?: unknown; cause?: unknown };
  if (withCode.code === "turnstile") return true;

  if (withCode.cause && typeof withCode.cause === "object") {
    const cause = withCode.cause as { code?: unknown };
    if (cause.code === "turnstile") return true;
  }

  return false;
}

export async function loginAction(_prev: string | undefined, formData: FormData) {
  const next = String(formData.get("next") || "/dashboard");
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      turnstileToken: formData.get("turnstileToken"),
      redirectTo: next.startsWith("/") ? next : "/dashboard",
    });
  } catch (error) {
    if (isTurnstileAuthError(error)) {
      return TURNSTILE_FAILURE_MESSAGE;
    }
    if (error instanceof AuthError) {
      return "Invalid email or password, or the account is not verified.";
    }
    throw error;
  }
}
