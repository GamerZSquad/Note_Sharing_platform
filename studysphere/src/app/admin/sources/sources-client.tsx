"use client";

import { useState } from "react";

export type AdminDomainRow = {
  id: string;
  domain: string;
  label: string;
  boost: number;
  enabled: boolean;
};

export function AdminSourcesClient({
  initialDomains,
}: {
  initialDomains: AdminDomainRow[];
}) {
  const [domains, setDomains] = useState(initialDomains);

  async function load() {
    const response = await fetch("/api/admin/sources");
    const data = await response.json();
    setDomains(data.data ?? []);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await fetch("/api/admin/sources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        domain: form.get("domain"),
        label: form.get("label"),
        boost: form.get("boost") || 1.25,
      }),
    });
    event.currentTarget.reset();
    await load();
  }

  async function toggle(id: string, enabled: boolean) {
    await fetch("/api/admin/sources", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, enabled }),
    });
    await load();
  }

  return (
    <section>
      <h1 className="font-serif text-3xl">Trusted sources</h1>
      <p className="mt-2 text-sm text-muted">
        These domains receive a ranking boost in external search. Results still open on the original
        website.
      </p>
      <form onSubmit={onSubmit} className="mt-4 grid gap-2 md:grid-cols-4">
        <input
          name="domain"
          required
          placeholder="mit.edu"
          className="rounded-xl border border-line bg-paper px-3 py-2"
        />
        <input
          name="label"
          required
          placeholder="MIT"
          className="rounded-xl border border-line bg-paper px-3 py-2"
        />
        <input
          name="boost"
          type="number"
          step="0.05"
          min="1"
          max="2"
          defaultValue="1.25"
          className="rounded-xl border border-line bg-paper px-3 py-2"
        />
        <button className="rounded-xl bg-forest text-white">Add domain</button>
      </form>
      <ul className="mt-6 space-y-2">
        {domains.map((domain) => (
          <li
            key={domain.id}
            className="flex items-center justify-between rounded-xl border border-line bg-paper px-4 py-3 text-sm"
          >
            <span>
              {domain.domain} · {domain.label} · boost {domain.boost}
            </span>
            <button onClick={() => toggle(domain.id, !domain.enabled)}>
              {domain.enabled ? "Disable" : "Enable"}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
