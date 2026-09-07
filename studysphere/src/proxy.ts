import { auth } from "@/auth";
import { NextResponse } from "next/server";

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = Boolean(req.auth);

  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (req.auth?.user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  const protectedPaths = ["/dashboard", "/upload", "/library", "/profile"];
  if (protectedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    if (!isLoggedIn) {
      const login = new URL("/login", req.url);
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/upload/:path*",
    "/library/:path*",
    "/admin/:path*",
    "/profile/:path*",
  ],
};
