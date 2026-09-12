"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { PasswordInput } from "@/components/password-input";
import { TurnstileField } from "@/components/turnstile-field";

function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resetSignal, setResetSignal] = useState(0);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const captcha =
      turnstileToken || String(form.get("turnstileToken") || "");
    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        password: form.get("password"),
        turnstileToken: captcha,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "Reset failed");
      setTurnstileToken(null);
      setResetSignal((value) => value + 1);
      return;
    }
    setMessage(data.data.message);
  }

  return (
    <>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <PasswordInput
          name="password"
          required
          placeholder="New password"
          autoComplete="new-password"
          showStrength
        />
        <TurnstileField
          resetSignal={resetSignal}
          onTokenChange={setTurnstileToken}
        />
        {error && <p className="text-sm text-terracotta">{error}</p>}
        {message && <p className="text-sm text-forest">{message}</p>}
        <button className="w-full rounded-full bg-forest py-3 text-white">Update password</button>
      </form>
      <Link href="/login" className="mt-6 inline-block text-sm">
        Back to login
      </Link>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <section className="mx-auto max-w-md px-4 py-16">
      <div className="mb-8 flex justify-center">
        <BrandLogo size="lg" showTagline align="center" />
      </div>
      <h1 className="font-serif text-4xl">Reset password</h1>
      <Suspense>
        <ResetForm />
      </Suspense>
    </section>
  );
}
