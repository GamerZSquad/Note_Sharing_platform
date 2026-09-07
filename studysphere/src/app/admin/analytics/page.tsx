"use client";

import { useEffect, useState } from "react";

type Analytics = {
  totals: {
    users: number;
    notes: number;
    downloads: number;
    searches: number;
    successRate: number;
    successfulSearches: number;
  };
  charts: { searches: Array<{ day: string; count: number }>; uploads: Array<{ day: string; count: number }> };
  popularSubjects: Array<{ name: string; notes: number; downloads: number }>;
  topQueries: Array<{ query: string; count: number }>;
  topNotes: Array<{ id: string; title: string; downloads: number }>;
  resultMix: { community: number; web: number };
};

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then((payload) => setData(payload.data));
  }, []);

  if (!data) return <p>Loading analytics…</p>;

  return (
    <section>
      <h1 className="font-serif text-3xl">Analytics</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-5">
        {[
          ["Users", data.totals.users],
          ["Notes", data.totals.notes],
          ["Downloads", data.totals.downloads],
          ["Searches", data.totals.searches],
          ["Success rate", `${data.totals.successRate}%`],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-2xl border border-line bg-paper p-4">
            <p className="font-serif text-2xl">{value}</p>
            <p className="text-xs text-muted">{label}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-sm text-muted">
        A search is successful if it results in a note open/download or an external resource click.
      </p>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Chart title="Searches / day" points={data.charts.searches} />
        <Chart title="Uploads / day" points={data.charts.uploads} />
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <List title="Popular subjects" rows={data.popularSubjects.map((s) => `${s.name} · ${s.notes} notes`)} />
        <List title="Most searched" rows={data.topQueries.map((q) => `${q.query} · ${q.count}`)} />
        <List title="Most downloaded" rows={data.topNotes.map((n) => `${n.title} · ${n.downloads}`)} />
      </div>
      <p className="mt-6 text-sm text-muted">
        Result clicks — community {data.resultMix.community} · web {data.resultMix.web}
      </p>
    </section>
  );
}

function Chart({ title, points }: { title: string; points: Array<{ day: string; count: number }> }) {
  const max = Math.max(1, ...points.map((p) => p.count));
  return (
    <div className="rounded-2xl border border-line bg-paper p-4">
      <h2 className="font-medium">{title}</h2>
      <div className="mt-4 flex h-32 items-end gap-1">
        {points.map((point) => (
          <div key={point.day} className="flex-1 rounded-t bg-forest/80" style={{ height: `${(point.count / max) * 100}%` }} title={`${point.day}: ${point.count}`} />
        ))}
      </div>
    </div>
  );
}

function List({ title, rows }: { title: string; rows: string[] }) {
  return (
    <div className="rounded-2xl border border-line bg-paper p-4">
      <h2 className="font-medium">{title}</h2>
      <ul className="mt-3 space-y-2 text-sm text-muted">
        {rows.length === 0 && <li>No data yet</li>}
        {rows.map((row) => (
          <li key={row}>{row}</li>
        ))}
      </ul>
    </div>
  );
}
