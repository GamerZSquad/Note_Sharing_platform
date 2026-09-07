"use client";

import { useEffect, useState } from "react";
import { DEPARTMENTS, SEMESTERS } from "@/lib/constants";

type Subject = {
  id: string;
  name: string;
  department: string;
  semester: number | null;
  _count: { notes: number };
};

export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);

  async function load() {
    const response = await fetch("/api/admin/subjects");
    const data = await response.json();
    setSubjects(data.data ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await fetch("/api/admin/subjects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        department: form.get("department"),
        semester: form.get("semester") || undefined,
      }),
    });
    event.currentTarget.reset();
    load();
  }

  return (
    <section>
      <h1 className="font-serif text-3xl">Subjects</h1>
      <form onSubmit={onSubmit} className="mt-4 grid gap-2 md:grid-cols-4">
        <input name="name" required placeholder="Subject name" className="rounded-xl border border-line bg-paper px-3 py-2" />
        <select name="department" className="rounded-xl border border-line bg-paper px-3 py-2">
          {DEPARTMENTS.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select name="semester" className="rounded-xl border border-line bg-paper px-3 py-2">
          {SEMESTERS.map((item) => (
            <option key={item} value={item}>
              Sem {item}
            </option>
          ))}
        </select>
        <button className="rounded-xl bg-forest text-white">Add</button>
      </form>
      <ul className="mt-6 space-y-2">
        {subjects.map((subject) => (
          <li key={subject.id} className="rounded-xl border border-line bg-paper px-4 py-3 text-sm">
            {subject.name} · {subject.department} · {subject._count.notes} notes
          </li>
        ))}
      </ul>
    </section>
  );
}
