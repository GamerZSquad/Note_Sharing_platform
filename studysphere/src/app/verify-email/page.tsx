"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function VerifyStatus() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [message, setMessage] = useState(
    token ? "Verifying…" : "Missing verification token.",
  );

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (response) => {
        const data = await response.json();
        if (!cancelled) {
          setMessage(data.data?.message ?? data.error ?? "Verification failed");
        }
      })
      .catch(() => {
        if (!cancelled) setMessage("Verification failed");
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <>
      <p className="mt-4">{message}</p>
      <Link href="/login" className="mt-6 inline-block text-forest underline">
        Continue to login
      </Link>
    </>
  );
}

export default function VerifyEmailPage() {
  return (
    <section className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-serif text-4xl">Email verification</h1>
      <Suspense>
        <VerifyStatus />
      </Suspense>
    </section>
  );
}
