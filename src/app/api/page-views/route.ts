import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

// ── Simple in-memory rate limiter ──────────────────────────────────────────
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 30; // max 30 page-view requests per minute per IP
const ipHits = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipHits.get(ip);

  if (!entry || now > entry.resetAt) {
    ipHits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) {
    return true;
  }
  return false;
}

// Clean up stale entries every 5 minutes to avoid memory leak
if (typeof globalThis !== "undefined") {
  const CLEANUP_INTERVAL = 5 * 60_000;
  const cleanupKey = "__pageViewRateLimitCleanup";
  if (!(globalThis as Record<string, unknown>)[cleanupKey]) {
    (globalThis as Record<string, unknown>)[cleanupKey] = true;
    setInterval(() => {
      const now = Date.now();
      for (const [ip, entry] of ipHits) {
        if (now > entry.resetAt) ipHits.delete(ip);
      }
    }, CLEANUP_INTERVAL);
  }
}

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// ── Sanitize inputs ────────────────────────────────────────────────────────
const PATH_MAX_LENGTH = 500;
const REFERRER_MAX_LENGTH = 500;
// Only allow safe path characters
const SAFE_PATH_REGEX = /^[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=%]+$/;

function sanitizePath(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim().slice(0, PATH_MAX_LENGTH);
  if (!trimmed.startsWith("/")) return null;
  if (!SAFE_PATH_REGEX.test(trimmed)) return null;
  return trimmed;
}

function sanitizeReferrer(raw: unknown): string | null {
  if (!raw || typeof raw !== "string") return null;
  const trimmed = raw.trim().slice(0, REFERRER_MAX_LENGTH);
  // Must be a valid URL
  try {
    new URL(trimmed);
    return trimmed;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    // CSRF protection: verify request origin
    const origin = req.headers.get("origin");
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (appUrl && origin && !origin.startsWith(appUrl)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Rate limiting
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      ?? req.headers.get("x-real-ip")
      ?? "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await req.json();
    const path = sanitizePath(body?.path);

    if (!path) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    // Skip admin routes
    if (path.startsWith("/admin")) {
      return NextResponse.json({ ok: true });
    }

    const referrer = sanitizeReferrer(body?.referrer);
    const session = await auth();
    const supabase = getSupabaseAdmin();

    await supabase.from("page_views").insert({
      path,
      user_id: session?.user?.id ?? null,
      referrer,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Page view tracking error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
