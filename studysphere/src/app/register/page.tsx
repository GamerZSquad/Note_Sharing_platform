"use client";

import { useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { PasswordInput } from "@/components/password-input";
import { DEPARTMENTS, SEMESTERS } from "@/lib/constants";

export default function RegisterPage() {
  const [message, setMessage] = useState("");
  const [verifyUrl, setVerifyUrl] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
        department: form.get("department") || undefined,
        semester: form.get("semester") || undefined,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "Registration failed");
      return;
    }
    setMessage(data.data.message);
    setVerifyUrl(data.data.verifyUrl ?? "");
  }

  return (
    <section className="mx-auto max-w-md px-4 py-16">
      <div className="mb-8 flex justify-center">
        <BrandLogo size="lg" showTagline align="center" />
      </div>
      <h1 className="font-serif text-4xl">Create your account</h1>
      <p className="mt-2 text-muted">Students can search, upload, rate, and bookmark resources.</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <input name="name" required placeholder="Full name" className="w-full rounded-xl border border-line bg-paper px-4 py-3" />
        <input name="email" type="email" required placeholder="Email" className="w-full rounded-xl border border-line bg-paper px-4 py-3" />
        <PasswordInput
          name="password"
          required
          placeholder="Password (letter + number, 8+ chars)"
          autoComplete="new-password"
          showStrength
        />
        <select name="department" className="w-full rounded-xl border border-line bg-paper px-4 py-3">
          <option value="">Department (optional)</option>
          {DEPARTMENTS.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select name="semester" className="w-full rounded-xl border border-line bg-paper px-4 py-3">
          <option value="">Semester (optional)</option>
          {SEMESTERS.map((item) => (
            <option key={item} value={item}>
              Semester {item}
            </option>
          ))}
        </select>
        {error && <p className="text-sm text-terracotta">{error}</p>}
        <button className="w-full rounded-full bg-forest py-3 text-white hover:bg-forest-dark">
          Register
        </button>
      </form>
      {message && (
        <div className="mt-6 rounded-xl bg-leaf p-4 text-sm">
          <p>{message}</p>
          {verifyUrl && (
            <p className="mt-2">
              Dev verify link:{" "}
              <Link className="underline" href={verifyUrl}>
                Verify email
              </Link>
            </p>
          )}
        </div>
      )}
      <p className="mt-6 text-sm text-muted">
        Already have an account? <Link href="/login">Sign in</Link>
      </p>
    </section>
  );
}
