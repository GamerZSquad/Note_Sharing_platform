"use client";

import { useEffect, useState } from "react";
import { DEPARTMENTS, SEMESTERS } from "@/lib/constants";

export default function ProfilePage() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => {
        if (data?.user) {
          const form = document.getElementById("profile-form") as HTMLFormElement | null;
          if (!form) return;
          (form.elements.namedItem("name") as HTMLInputElement).value = data.user.name ?? "";
        }
      });
  }, []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        department: form.get("department") || undefined,
        semester: form.get("semester") || undefined,
        bio: form.get("bio") || undefined,
      }),
    });
    const data = await response.json();
    setMessage(response.ok ? "Profile updated." : data.error ?? "Update failed");
  }

  return (
    <section className="mx-auto max-w-xl px-4 py-10">
      <h1 className="font-serif text-4xl">Profile</h1>
      <form id="profile-form" onSubmit={onSubmit} className="mt-8 space-y-4">
        <input name="name" required placeholder="Name" className="w-full rounded-xl border border-line bg-paper px-4 py-3" />
        <select name="department" className="w-full rounded-xl border border-line bg-paper px-4 py-3">
          <option value="">Department</option>
          {DEPARTMENTS.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select name="semester" className="w-full rounded-xl border border-line bg-paper px-4 py-3">
          <option value="">Semester</option>
          {SEMESTERS.map((item) => (
            <option key={item} value={item}>
              Semester {item}
            </option>
          ))}
        </select>
        <textarea name="bio" placeholder="Bio" className="h-28 w-full rounded-xl border border-line bg-paper px-4 py-3" />
        <button className="rounded-full bg-forest px-6 py-3 text-white">Save</button>
      </form>
      {message && <p className="mt-4 text-sm">{message}</p>}
    </section>
  );
}
