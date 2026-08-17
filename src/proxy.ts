import { NextResponse } from "next/server";
import { auth } from "@/auth";

// Protected routes that require authentication
const PROTECTED_ROUTES = ["/library", "/profile"];

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;

  // 1. Admin route gating logic
  if (pathname.startsWith("/admin")) {
    const adminEmail = process.env.ADMIN_EMAIL;
    const userEmail = req.auth?.user?.email;

    // Not logged in → redirect to sign-in
    if (!req.auth) {
      const signInUrl = new URL("/auth/signin", req.nextUrl.origin);
      signInUrl.searchParams.set("callbackUrl", req.url);
      return NextResponse.redirect(signInUrl);
    }

    // Logged in but not the admin → redirect to home
    if (!adminEmail || !userEmail || userEmail.toLowerCase() !== adminEmail.toLowerCase()) {
      return NextResponse.redirect(new URL("/", req.nextUrl.origin));
    }
  }

  // 2. Regular protected routes logic
  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtected && !req.auth) {
    const signInUrl = new URL("/auth/signin", req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match only page routes. Skip:
     * - /api/* (NextAuth internals + Supabase API calls — don't intercept these)
     * - _next/static, _next/image (Next.js internals)
     * - favicon.ico and static asset extensions
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};


