import { NextResponse } from "next/server";
import { auth } from "@/auth";

const PROTECTED_ROUTES = ["/library", "/profile"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  let response: NextResponse | undefined;

  // 1. Admin route gating logic
  if (pathname.startsWith("/admin")) {
    const adminEmail = process.env.ADMIN_EMAIL;
    const userEmail = req.auth?.user?.email;

    if (!req.auth) {
      const signInUrl = new URL("/auth/signin", req.nextUrl.origin);
      signInUrl.searchParams.set("callbackUrl", req.url);
      response = NextResponse.redirect(signInUrl);
    } else if (!adminEmail || !userEmail || userEmail.toLowerCase() !== adminEmail.toLowerCase()) {
      response = NextResponse.redirect(new URL("/", req.nextUrl.origin));
    }
  }

  // 2. Regular protected routes logic
  if (!response) {
    const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
    if (isProtected && !req.auth) {
      const signInUrl = new URL("/auth/signin", req.nextUrl.origin);
      signInUrl.searchParams.set("callbackUrl", pathname);
      response = NextResponse.redirect(signInUrl);
    }
  }

  // 3. Content Security Policy (CSP) with Nonce
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  
  // unsafe-eval is needed in development for Next.js Fast Refresh
  const isDev = process.env.NODE_ENV === "development";
  const devScriptSrc = isDev ? " 'unsafe-eval'" : "";

  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${devScriptSrc};
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data: blob: https://uploads.mangadex.org https://*.mangadex.network https://s4.anilist.co https://cdn.myanimelist.net https://lh3.googleusercontent.com;
    connect-src 'self' https://*.supabase.co https://api.mangadex.org https://graphql.anilist.co;
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
  `.replace(/\s{2,}/g, " ").trim();

  // If we already have a redirect response, we just return it.
  if (response) {
    return response;
  }

  // Otherwise, we inject the nonce into the request headers for Next.js
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", cspHeader);

  response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Also set it on the response headers for the browser
  response.headers.set("Content-Security-Policy", cspHeader);

  return response;
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
