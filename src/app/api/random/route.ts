import { NextResponse } from "next/server";
import { searchManga } from "@/lib/api/mangadex";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const origin = new URL(req.url).origin;

  try {
    // Pick a random offset from the top 500 most popular manga
    const randomOffset = Math.floor(Math.random() * 500);
    const result = await searchManga({
      limit: 1,
      offset: randomOffset,
      order: { followedCount: "desc" },
      contentRating: ["safe", "suggestive"],
    });

    if (result.data.length > 0) {
      const mangaId = result.data[0].id;
      // Build same-origin absolute URL to prevent open redirect
      return NextResponse.redirect(new URL(`/manga/${mangaId}`, origin));
    }
    
    return NextResponse.redirect(new URL("/", origin));
  } catch (error) {
    console.error("Error in random API:", error);
    return NextResponse.redirect(new URL("/", origin));
  }
}
