"use client";

import { useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { TurnstileField } from "@/components/turnstile-field";

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [error, setError] = useState("");
  const [resetSignal, setResetSignal] = useState(0);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const token =
      turnstileToken || String(form.get("turnstileToken") || "");
    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        turnstileToken: token,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "Request failed");
      setTurnstileToken(null);
      setResetSignal((value) => value + 1);
      setMessage("");
      setResetUrl("");
      return;
    }
    setMessage(data.data?.message ?? "Request sent");
    setResetUrl(data.data?.resetUrl ?? "");
  }

  return (
    <section className="mx-auto max-w-md px-4 py-16">
      <div className="mb-8 flex justify-center">
        <BrandLogo size="lg" showTagline align="center" />
      </div>
      <h1 className="font-serif text-4xl">Forgot password</h1>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <input
          name="email"
          type="email"
          required
          placeholder="Email"
          className="w-full rounded-xl border border-line bg-paper px-4 py-3"
        />
        <TurnstileField
          resetSignal={resetSignal}
          onTokenChange={setTurnstileToken}
        />
        {error && <p className="text-sm text-terracotta">{error}</p>}
        <button className="w-full rounded-full bg-forest py-3 text-white">Send reset link</button>
      </form>
      {message && <p className="mt-4 text-sm">{message}</p>}
      {resetUrl && (
        <p className="mt-2 text-sm">
          Dev reset link:{" "}
          <Link className="underline" href={resetUrl}>
            Reset password
          </Link>
        </p>
      )}
    </section>
  );
}
