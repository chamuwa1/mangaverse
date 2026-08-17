import { NextRequest, NextResponse } from "next/server";

// Only allow proxying to known MangaDex API endpoints
const ALLOWED_PREFIXES = ["manga", "chapter", "at-home", "cover", "author", "group"];

// Proxy MangaDex API to bypass CORS
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  const path = slug.join("/");

  // Validate path starts with an allowed prefix
  const firstSegment = slug[0]?.toLowerCase();
  if (!firstSegment || !ALLOWED_PREFIXES.includes(firstSegment)) {
    return NextResponse.json({ error: "Path not allowed" }, { status: 403 });
  }

  const searchParams = req.nextUrl.searchParams.toString();
  const url = `https://api.mangadex.org/${path}${searchParams ? `?${searchParams}` : ""}`;

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "MangaVerse/1.0",
      },
      next: { revalidate: 300 },
    });

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch from MangaDex" },
      { status: 500 }
    );
  }
}
