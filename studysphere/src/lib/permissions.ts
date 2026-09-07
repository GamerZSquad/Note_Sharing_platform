import type { Role, UserStatus } from "@/lib/constants";

export function isAdmin(role?: string | null): boolean {
  return role === "ADMIN";
}

export function canUsePlatform(status?: string | null): boolean {
  return status === "ACTIVE";
}

export function canManageNote(options: {
  role?: string | null;
  userId?: string | null;
  uploaderId: string;
}): boolean {
  if (options.role === "ADMIN") return true;
  return Boolean(options.userId && options.userId === options.uploaderId);
}

export function assertRole(
  role: string | undefined,
  allowed: Role[],
): boolean {
  return Boolean(role && allowed.includes(role as Role));
}

export function isSuspended(status?: string | null): boolean {
  return status === "SUSPENDED";
}

export type SessionUser = {
  id: string;
  role: Role;
  status: UserStatus;
  email?: string | null;
  name?: string | null;
};
