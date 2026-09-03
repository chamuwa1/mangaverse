import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

// Initialize Upstash Redis Rate Limiter
// We gracefully handle missing env variables to prevent crashes during local setup
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = redisUrl && redisToken ? Redis.fromEnv() : null;

const ratelimit = redis
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(30, "1 m"),
      analytics: true,
      prefix: "@upstash/ratelimit/page-views",
    })
  : null;

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

    if (ratelimit) {
      const { success } = await ratelimit.limit(ip);
      if (!success) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429 });
      }
    } else {
      console.warn("[MangaVerse] Skipping rate limit: Upstash Redis missing");
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
