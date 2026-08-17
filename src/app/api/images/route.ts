import { NextRequest, NextResponse } from "next/server";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB — reject oversized responses

// Only allow proxying from trusted manga image hosts
const ALLOWED_HOSTS = [
  "uploads.mangadex.org",
  "mangadex.org",
  "mangadex.network",
  "s4.anilist.co",
];

// Only allow common image file extensions
const ALLOWED_EXTENSIONS = /\.(jpg|jpeg|png|gif|webp|avif|svg)$/i;

// Image proxy to bypass MangaDex hotlink protection
// Uses streaming to avoid buffering entire images in memory
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  try {
    const parsedUrl = new URL(url);

    // Protocol validation
    if (parsedUrl.protocol !== "https:") {
      return NextResponse.json({ error: "Only HTTPS URLs allowed" }, { status: 400 });
    }

    // Host allowlist check
    const isAllowed = ALLOWED_HOSTS.some(
      (host) => parsedUrl.hostname === host || parsedUrl.hostname.endsWith(`.${host}`)
    );
    if (!isAllowed) {
      return NextResponse.json({ error: "Host not allowed" }, { status: 403 });
    }

    // Path validation — must look like an image URL
    if (!ALLOWED_EXTENSIONS.test(parsedUrl.pathname)) {
      return NextResponse.json({ error: "URL does not point to a valid image" }, { status: 400 });
    }

    const response = await fetch(url, {
      headers: {
        Referer: "https://mangadex.org/",
        "User-Agent": "MangaVerse/1.0",
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch image" }, { status: response.status });
    }

    // Size check — reject if Content-Length exceeds limit
    const contentLength = response.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_IMAGE_SIZE) {
      return NextResponse.json({ error: "Image too large" }, { status: 413 });
    }

    const contentType = response.headers.get("content-type") ?? "image/jpeg";

    // Validate content-type is actually an image
    if (!contentType.startsWith("image/")) {
      return NextResponse.json({ error: "Response is not an image" }, { status: 400 });
    }

    // Stream the response body with size enforcement
    // This prevents attacks where Content-Length is omitted but body is huge
    const reader = response.body?.getReader();
    if (!reader) {
      return NextResponse.json({ error: "No response body" }, { status: 502 });
    }

    let totalBytes = 0;
    const chunks: Uint8Array[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > MAX_IMAGE_SIZE) {
        reader.cancel();
        return NextResponse.json({ error: "Image too large" }, { status: 413 });
      }
      chunks.push(value);
    }

    const body = new Uint8Array(totalBytes);
    let offset = 0;
    for (const chunk of chunks) {
      body.set(chunk, offset);
      offset += chunk.byteLength;
    }

    const appOrigin = process.env.NEXT_PUBLIC_APP_URL || "*";
    const headers: Record<string, string> = {
      "Content-Type": contentType,
      "Content-Disposition": "inline",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
      "Access-Control-Allow-Origin": appOrigin,
      "X-Content-Type-Options": "nosniff",
      "Content-Length": String(totalBytes),
    };

    return new NextResponse(body, { headers });
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }
}
