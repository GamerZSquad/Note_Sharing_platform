"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState("");
  const [resetUrl, setResetUrl] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.get("email") }),
    });
    const data = await response.json();
    setMessage(data.data?.message ?? data.error ?? "Request sent");
    setResetUrl(data.data?.resetUrl ?? "");
  }

  return (
    <section className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-serif text-4xl">Forgot password</h1>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <input name="email" type="email" required placeholder="Email" className="w-full rounded-xl border border-line bg-paper px-4 py-3" />
        <button className="w-full rounded-full bg-forest py-3 text-white">Send reset link</button>
      </form>
      {message && <p className="mt-4 text-sm">{message}</p>}
      {resetUrl && (
        <p className="mt-2 text-sm">
          Dev reset link: <Link className="underline" href={resetUrl}>Reset password</Link>
        </p>
      )}
    </section>
  );
}
