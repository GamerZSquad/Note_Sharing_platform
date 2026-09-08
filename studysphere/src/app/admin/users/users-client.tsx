"use client";

import { useState } from "react";

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  department: string | null;
  _count: { notes: number; reports: number };
};

export function AdminUsersClient({ initialUsers }: { initialUsers: AdminUserRow[] }) {
  const [users, setUsers] = useState(initialUsers);

  async function load() {
    const response = await fetch("/api/admin/users");
    const data = await response.json();
    setUsers(data.data ?? []);
  }

  async function patch(id: string, body: Record<string, string>) {
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...body }),
    });
    await load();
  }

  return (
    <section>
      <h1 className="font-serif text-3xl">Users</h1>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-paper">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-muted">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Role</th>
              <th className="p-3">Status</th>
              <th className="p-3">Notes</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-line/70">
                <td className="p-3">
                  <div>{user.name}</div>
                  <div className="text-xs text-muted">{user.email}</div>
                </td>
                <td className="p-3">{user.role}</td>
                <td className="p-3">{user.status}</td>
                <td className="p-3">{user._count.notes}</td>
                <td className="p-3 space-x-2">
                  <button
                    onClick={() =>
                      patch(user.id, {
                        status: user.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED",
                      })
                    }
                  >
                    {user.status === "SUSPENDED" ? "Restore" : "Suspend"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
