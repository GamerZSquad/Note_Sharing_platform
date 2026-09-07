"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export async function loginAction(_prev: string | undefined, formData: FormData) {
  const next = String(formData.get("next") || "/dashboard");
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: next.startsWith("/") ? next : "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return "Invalid email or password, or the account is not verified.";
    }
    throw error;
  }
}
