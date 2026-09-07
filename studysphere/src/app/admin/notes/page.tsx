"use client";

import { useEffect, useState } from "react";

type NoteRow = {
  id: string;
  title: string;
  status: string;
  downloads: number;
  uploader: { name: string; email: string };
  _count: { reports: number };
};

export default function AdminNotesPage() {
  const [notes, setNotes] = useState<NoteRow[]>([]);

  async function load() {
    const response = await fetch("/api/admin/notes");
    const data = await response.json();
    setNotes(data.data ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function setStatus(id: string, status: string) {
    await fetch("/api/admin/notes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    load();
  }

  return (
    <section>
      <h1 className="font-serif text-3xl">Notes</h1>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-paper">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-muted">
            <tr>
              <th className="p-3">Title</th>
              <th className="p-3">Uploader</th>
              <th className="p-3">Status</th>
              <th className="p-3">Reports</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {notes.map((note) => (
              <tr key={note.id} className="border-b border-line/70">
                <td className="p-3">{note.title}</td>
                <td className="p-3">{note.uploader.name}</td>
                <td className="p-3">{note.status}</td>
                <td className="p-3">{note._count.reports}</td>
                <td className="p-3 space-x-2">
                  <button onClick={() => setStatus(note.id, "REMOVED")}>Remove</button>
                  <button onClick={() => setStatus(note.id, "PUBLISHED")}>Publish</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
