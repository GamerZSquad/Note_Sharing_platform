import { NextResponse } from "next/server";

export function jsonOk<T>(data: T, init?: number | ResponseInit) {
  const options = typeof init === "number" ? { status: init } : init;
  return NextResponse.json({ ok: true as const, data }, options);
}

export function jsonError(error: string, status = 400) {
  return NextResponse.json({ ok: false as const, error }, { status });
}
