"use client";

import { useState } from "react";

export type WebCardData = {
  title: string;
  description: string;
  url: string;
  domain: string;
  source: string;
  sourceType: string;
};

export function WebCard({
  resource,
  searchId,
}: {
  resource: WebCardData;
  searchId?: string;
}) {
  const [saved, setSaved] = useState(false);

  async function bookmark() {
    const response = await fetch("/api/bookmarks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "EXTERNAL",
        external: {
          title: resource.title,
          url: resource.url,
          domain: resource.domain,
          description: resource.description,
          sourceType: resource.sourceType,
        },
      }),
    });
    if (response.ok) setSaved(true);
  }

  async function openOriginal() {
    if (searchId) {
      fetch("/api/search/click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ searchId, clickType: "external" }),
      }).catch(() => {});
    }
    window.open(resource.url, "_blank", "noopener,noreferrer");
  }

  return (
    <article className="rounded-2xl border border-line bg-paper p-5">
      <p className="text-xs uppercase tracking-wide text-muted">
        {resource.source} · {resource.sourceType}
      </p>
      <h3 className="mt-2 font-serif text-xl leading-snug">{resource.title}</h3>
      <p className="mt-2 line-clamp-3 text-sm text-muted">{resource.description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={openOriginal}
          className="rounded-full bg-ink px-3 py-1.5 text-sm text-paper hover:bg-forest-dark"
        >
          Open original ↗
        </button>
        <button
          onClick={bookmark}
          disabled={saved}
          className="rounded-full border border-line px-3 py-1.5 text-sm hover:bg-parchment disabled:opacity-60"
        >
          {saved ? "Saved" : "Bookmark"}
        </button>
      </div>
    </article>
  );
}
