"use client";

import { useEffect } from "react";

/**
 * Root layout failure boundary. Must define its own <html>/<body> because the
 * root layout may have crashed and cannot wrap this UI.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global-error]", error.digest ?? error.name);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f3ebe0",
          color: "#1c1915",
          fontFamily: 'Georgia, "Times New Roman", serif',
        }}
      >
        <main style={{ maxWidth: "28rem", padding: "3rem 1.5rem", textAlign: "center" }}>
          <p
            style={{
              margin: 0,
              fontSize: "0.75rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#b44a2a",
            }}
          >
            StudySphere
          </p>
          <h1 style={{ margin: "1rem 0 0", fontSize: "2rem", fontWeight: 400 }}>
            Something went wrong
          </h1>
          <p style={{ margin: "0.75rem 0 0", color: "#6b6358", fontFamily: "system-ui, sans-serif" }}>
            The application could not recover from this error. Please try again.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "1.75rem",
              border: "none",
              borderRadius: "999px",
              background: "#1b5e46",
              color: "#fff",
              padding: "0.7rem 1.4rem",
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
