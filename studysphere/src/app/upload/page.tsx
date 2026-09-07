"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RESOURCE_TYPES, RESOURCE_TYPE_LABELS } from "@/lib/constants";

type Subject = { id: string; name: string; department: string; semester: number | null };

export default function UploadPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    fetch("/api/subjects")
      .then((r) => r.json())
      .then((data) => setSubjects(data.data ?? []));
  }, []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = event.currentTarget;
    const response = await fetch("/api/notes", {
      method: "POST",
      body: new FormData(form),
    });
    const data = await response.json();
    setPending(false);
    if (!response.ok) {
      setError(data.error ?? "Upload failed");
      return;
    }
    router.push(`/notes/${data.data.id}`);
  }

  return (
    <section className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-serif text-4xl">Upload notes</h1>
      <p className="mt-2 text-muted">
        Files are stored outside the database. We keep the metadata; the PDF lives in object storage (local folder in development).
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <input name="title" required placeholder="Title" className="w-full rounded-xl border border-line bg-paper px-4 py-3" />
        <textarea name="description" required placeholder="Description" className="h-28 w-full rounded-xl border border-line bg-paper px-4 py-3" />
        <select name="subjectId" required className="w-full rounded-xl border border-line bg-paper px-4 py-3">
          <option value="">Subject</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name} · {subject.department}
              {subject.semester ? ` · Sem ${subject.semester}` : ""}
            </option>
          ))}
        </select>
        <input name="unit" placeholder="Unit (optional)" className="w-full rounded-xl border border-line bg-paper px-4 py-3" />
        <input name="tags" placeholder="Tags, comma separated" className="w-full rounded-xl border border-line bg-paper px-4 py-3" />
        <select name="resourceType" className="w-full rounded-xl border border-line bg-paper px-4 py-3">
          {RESOURCE_TYPES.map((type) => (
            <option key={type} value={type}>
              {RESOURCE_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
        <input name="file" type="file" required accept=".pdf,.doc,.docx,.ppt,.pptx,.txt" className="w-full rounded-xl border border-line bg-paper px-4 py-3" />
        {error && <p className="text-sm text-terracotta">{error}</p>}
        <button disabled={pending} className="rounded-full bg-forest px-6 py-3 text-white disabled:opacity-60">
          {pending ? "Uploading…" : "Publish note"}
        </button>
      </form>
    </section>
  );
}
