"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Upload } from "lucide-react";
import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
  RESOURCE_TYPES,
  RESOURCE_TYPE_LABELS,
} from "@/lib/constants";
import { formatBytes } from "@/lib/utils";

type Subject = { id: string; name: string; department: string; semester: number | null };

const ACCEPT = ".pdf,.doc,.docx,.ppt,.pptx,.txt";
const ALLOWED_EXTENSIONS = new Set(Object.values(ALLOWED_MIME_TYPES));

const fieldLabel = "mb-1.5 block text-xs font-medium uppercase tracking-[0.14em] text-muted";
const fieldHint = "mt-1.5 text-xs text-muted";
const control =
  "w-full rounded-xl border border-line bg-paper px-4 py-3 text-ink outline-none transition placeholder:text-muted/70 focus:border-forest/40 focus:ring-2 focus:ring-forest/15";

export default function UploadPage() {
  const router = useRouter();
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    fetch("/api/subjects")
      .then((r) => r.json())
      .then((data) => setSubjects(data.data ?? []));
  }, []);

  function applyFile(file: File | null) {
    const input = fileInputRef.current;
    if (!input) return;

    if (!file) {
      input.value = "";
      setSelectedFile(null);
      return;
    }

    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension || !ALLOWED_EXTENSIONS.has(extension)) {
      setError("Only PDF, DOC, DOCX, PPT, PPTX, and TXT files are allowed");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("File must be 15MB or smaller");
      return;
    }

    const transfer = new DataTransfer();
    transfer.items.add(file);
    input.files = transfer.files;
    setSelectedFile(file);
    setError("");
  }

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
    <section className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
      <header className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.22em] text-muted">Publish</p>
        <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">Share your notes</h1>
        <p className="mt-3 text-base text-muted sm:text-lg">
          Help other students discover useful study material.
        </p>
      </header>

      <form onSubmit={onSubmit} className="mt-10 lg:mt-12">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.9fr)] lg:gap-12 lg:items-start">
          {/* Left: note details */}
          <div className="space-y-8">
            <div>
              <h2 className="font-serif text-2xl">Note details</h2>
              <p className="mt-1 text-sm text-muted">
                Write a clear title and short description so your notes are easy to find.
              </p>
            </div>

            <div>
              <label htmlFor="title" className={fieldLabel}>
                Title
              </label>
              <input
                id="title"
                name="title"
                required
                placeholder="e.g. Operating Systems — Unit 3 Deadlock Notes"
                className={`${control} font-serif text-xl sm:text-2xl py-4`}
              />
            </div>

            <div>
              <label htmlFor="description" className={fieldLabel}>
                Description
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={7}
                placeholder="What topics does this cover? Who is it useful for?"
                className={`${control} min-h-[10rem] resize-y leading-relaxed`}
              />
              <p className={fieldHint}>A few sentences help StudySphere rank and recommend your notes.</p>
            </div>

            <div className="border-t border-line pt-8">
              <h3 className="font-serif text-xl">Academic metadata</h3>
              <p className="mt-1 text-sm text-muted">Subject and unit help classmates filter by course.</p>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="subjectId" className={fieldLabel}>
                    Subject
                  </label>
                  <select id="subjectId" name="subjectId" required className={control}>
                    <option value="">Select a subject</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name} · {subject.department}
                        {subject.semester ? ` · Sem ${subject.semester}` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="unit" className={fieldLabel}>
                    Unit
                  </label>
                  <input
                    id="unit"
                    name="unit"
                    placeholder="e.g. 3"
                    className={control}
                  />
                  <p className={fieldHint}>Optional</p>
                </div>

                <div>
                  <label htmlFor="resourceType" className={fieldLabel}>
                    Resource type
                  </label>
                  <select id="resourceType" name="resourceType" className={control}>
                    {RESOURCE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {RESOURCE_TYPE_LABELS[type]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-5">
                <label htmlFor="tags" className={fieldLabel}>
                  Tags
                </label>
                <input
                  id="tags"
                  name="tags"
                  placeholder="deadlock, scheduling, processes"
                  className={`${control} bg-parchment/60`}
                />
                <p className={fieldHint}>Comma-separated. Keep them short and specific.</p>
              </div>
            </div>
          </div>

          {/* Right: file + publish */}
          <aside className="lg:sticky lg:top-24 space-y-6">
            <div>
              <h2 className="font-serif text-2xl">Your file</h2>
              <p className="mt-1 text-sm text-muted">
                Attach the document students will preview and download.
              </p>
            </div>

            <input
              ref={fileInputRef}
              id={fileInputId}
              name="file"
              type="file"
              required
              accept={ACCEPT}
              className="sr-only"
              onChange={(event) => applyFile(event.target.files?.[0] ?? null)}
            />

            {!selectedFile ? (
              <label
                htmlFor={fileInputId}
                onDragEnter={(event) => {
                  event.preventDefault();
                  setDragging(true);
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={(event) => {
                  event.preventDefault();
                  setDragging(false);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragging(false);
                  applyFile(event.dataTransfer.files?.[0] ?? null);
                }}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-12 text-center transition ${
                  dragging
                    ? "border-forest bg-leaf/60"
                    : "border-line bg-paper hover:border-forest/35 hover:bg-paper"
                }`}
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-line bg-parchment text-forest">
                  <Upload className="h-5 w-5" aria-hidden />
                </span>
                <span className="mt-4 font-serif text-xl text-ink">Drop your notes here</span>
                <span className="mt-1 text-sm text-muted">
                  or{" "}
                  <span className="text-forest underline decoration-forest/30 underline-offset-2">
                    browse files
                  </span>
                </span>
                <span className="mt-5 text-xs uppercase tracking-[0.16em] text-muted">
                  PDF · DOC · PPT · Maximum 15 MB
                </span>
              </label>
            ) : (
              <div className="rounded-2xl border border-line bg-paper p-5">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-leaf text-forest">
                    <FileText className="h-5 w-5" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-ink">{selectedFile.name}</p>
                    <p className="mt-1 text-sm text-muted">
                      {formatBytes(selectedFile.size)}
                      {" · "}
                      {(selectedFile.name.split(".").pop() ?? "file").toUpperCase()}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-full border border-line px-3 py-1.5 text-sm text-ink transition hover:bg-parchment"
                  >
                    Change file
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFile(null)}
                    className="rounded-full border border-line px-3 py-1.5 text-sm text-muted transition hover:bg-parchment hover:text-ink"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}

            <ul className="space-y-2 text-sm text-muted">
              <li>Prefer clear scans or typed PDFs for preview.</li>
              <li>Files stay outside the database; only metadata is indexed for search.</li>
              <li>Do not upload copyrighted textbooks you do not have rights to share.</li>
            </ul>

            <div className="border-t border-line pt-6">
              {error && (
                <p className="mb-4 rounded-xl border border-terracotta/25 bg-terracotta/5 px-3 py-2 text-sm text-terracotta" role="alert">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={pending}
                className="inline-flex w-full items-center justify-center rounded-full bg-forest px-6 py-3.5 text-sm font-medium text-white transition hover:bg-forest-dark disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {pending ? "Publishing…" : "Publish notes →"}
              </button>
              <p className="mt-3 max-w-sm text-sm text-muted">
                Your notes will be available in StudySphere search and can be discovered by other students.
              </p>
            </div>
          </aside>
        </div>
      </form>
    </section>
  );
}
