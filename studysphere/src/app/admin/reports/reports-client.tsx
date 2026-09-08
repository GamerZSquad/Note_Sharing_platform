"use client";

import { useState } from "react";

export type AdminReportRow = {
  id: string;
  reason: string;
  status: string;
  details: string | null;
  note: { id: string; title: string };
  user: { name: string; email: string };
};

export function AdminReportsClient({
  initialReports,
}: {
  initialReports: AdminReportRow[];
}) {
  const [reports, setReports] = useState(initialReports);

  async function load() {
    const response = await fetch("/api/admin/reports");
    const data = await response.json();
    setReports(data.data ?? []);
  }

  async function act(id: string, body: Record<string, unknown>) {
    await fetch("/api/admin/reports", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...body }),
    });
    await load();
  }

  return (
    <section>
      <h1 className="font-serif text-3xl">Reports</h1>
      <div className="mt-4 space-y-3">
        {reports.map((report) => (
          <article key={report.id} className="rounded-2xl border border-line bg-paper p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-medium">{report.note.title}</p>
                <p className="text-sm text-muted">
                  {report.reason} · {report.status} · reported by {report.user.name}
                </p>
              </div>
              <div className="flex gap-2 text-sm">
                <button onClick={() => act(report.id, { status: "REJECTED" })}>Reject</button>
                <button onClick={() => act(report.id, { status: "ACTIONED", removeNote: true })}>
                  Remove note
                </button>
                <button
                  onClick={() =>
                    act(report.id, {
                      status: "ACTIONED",
                      suspendUser: true,
                      removeNote: true,
                    })
                  }
                >
                  Suspend uploader
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
