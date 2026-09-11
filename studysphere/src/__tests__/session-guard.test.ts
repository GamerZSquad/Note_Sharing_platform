import { beforeEach, describe, expect, it, vi } from "vitest";

const authMock = vi.fn();
const findUniqueMock = vi.fn();

vi.mock("@/auth", () => ({
  auth: (...args: unknown[]) => authMock(...args),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => findUniqueMock(...args),
    },
  },
}));

import { requireActiveUser, requireAdminUser } from "@/lib/session";

async function readJson(response: Response) {
  return response.json() as Promise<{ ok: false; error: string }>;
}

describe("requireActiveUser", () => {
  beforeEach(() => {
    authMock.mockReset();
    findUniqueMock.mockReset();
  });

  it("rejects when there is no session", async () => {
    authMock.mockResolvedValue(null);
    const result = await requireActiveUser("Sign in to bookmark resources");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.response.status).toBe(401);
    expect(await readJson(result.response)).toEqual({
      ok: false,
      error: "Sign in to bookmark resources",
    });
    expect(findUniqueMock).not.toHaveBeenCalled();
  });

  it("rejects when the JWT user no longer exists", async () => {
    authMock.mockResolvedValue({
      user: { id: "gone", role: "STUDENT", status: "ACTIVE" },
    });
    findUniqueMock.mockResolvedValue(null);

    const result = await requireActiveUser();
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.response.status).toBe(401);
    expect(await readJson(result.response)).toEqual({
      ok: false,
      error: "Unauthorized",
    });
  });

  it("rejects a previously issued ACTIVE JWT after the account is suspended", async () => {
    authMock.mockResolvedValue({
      user: {
        id: "u1",
        role: "STUDENT",
        status: "ACTIVE",
        email: "student@example.com",
        name: "Student",
      },
    });
    findUniqueMock.mockResolvedValue({
      id: "u1",
      role: "STUDENT",
      status: "SUSPENDED",
      email: "student@example.com",
      name: "Student",
    });

    const result = await requireActiveUser("Sign in to rate notes");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.response.status).toBe(403);
    expect(await readJson(result.response)).toEqual({
      ok: false,
      error: "This account is suspended",
    });
  });

  it("allows an ACTIVE user and returns the live database role/status", async () => {
    authMock.mockResolvedValue({
      user: {
        id: "u1",
        role: "STUDENT",
        status: "ACTIVE",
        email: "stale@example.com",
        name: "Stale",
      },
    });
    findUniqueMock.mockResolvedValue({
      id: "u1",
      role: "STUDENT",
      status: "ACTIVE",
      email: "fresh@example.com",
      name: "Fresh",
    });

    const result = await requireActiveUser();
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.user).toEqual({
      id: "u1",
      role: "STUDENT",
      status: "ACTIVE",
      email: "fresh@example.com",
      name: "Fresh",
    });
  });
});

describe("requireAdminUser", () => {
  beforeEach(() => {
    authMock.mockReset();
    findUniqueMock.mockReset();
  });

  it("rejects a JWT that still claims ADMIN after the database role was demoted", async () => {
    authMock.mockResolvedValue({
      user: { id: "a1", role: "ADMIN", status: "ACTIVE" },
    });
    findUniqueMock.mockResolvedValue({
      id: "a1",
      role: "STUDENT",
      status: "ACTIVE",
      email: "was-admin@example.com",
      name: "Was Admin",
    });

    const result = await requireAdminUser();
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.response.status).toBe(403);
    expect(await readJson(result.response)).toEqual({
      ok: false,
      error: "Forbidden",
    });
  });

  it("rejects a suspended admin even when the JWT still says ACTIVE ADMIN", async () => {
    authMock.mockResolvedValue({
      user: { id: "a1", role: "ADMIN", status: "ACTIVE" },
    });
    findUniqueMock.mockResolvedValue({
      id: "a1",
      role: "ADMIN",
      status: "SUSPENDED",
      email: "admin@example.com",
      name: "Admin",
    });

    const result = await requireAdminUser();
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.response.status).toBe(403);
    expect(await readJson(result.response)).toEqual({
      ok: false,
      error: "Forbidden",
    });
  });

  it("allows an ACTIVE admin using the live database role", async () => {
    authMock.mockResolvedValue({
      user: { id: "a1", role: "STUDENT", status: "ACTIVE" },
    });
    findUniqueMock.mockResolvedValue({
      id: "a1",
      role: "ADMIN",
      status: "ACTIVE",
      email: "admin@example.com",
      name: "Admin",
    });

    const result = await requireAdminUser();
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.user.role).toBe("ADMIN");
    expect(result.user.status).toBe("ACTIVE");
  });
});
