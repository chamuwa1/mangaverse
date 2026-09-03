import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function isAdmin(email: string | null | undefined) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || !email) return false;
  return email.toLowerCase() === adminEmail.toLowerCase();
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = getSupabaseAdmin();

  try {
    const [
      { data: overview },
      { data: dailyEngagement },
      { data: topBookmarkedManga },
      { data: topReadManga },
      { data: ratingsChart },
      { data: topPages }
    ] = await Promise.all([
      supabase.rpc("get_admin_overview"),
      supabase.rpc("get_daily_engagement", { days: 30 }),
      supabase.rpc("get_top_manga_bookmarks", { limit_count: 15 }),
      supabase.rpc("get_top_manga_reads", { limit_count: 15 }),
      supabase.rpc("get_ratings_distribution"),
      supabase.rpc("get_top_pages", { limit_count: 10 }),
    ]);

    return NextResponse.json({
      overview: overview || { uniqueUsers: 0, totalBookmarks: 0, totalReads: 0, totalRatings: 0, totalPageViews: 0, avgRating: 0 },
      dailyEngagement: dailyEngagement || [],
      topBookmarkedManga: topBookmarkedManga || [],
      topReadManga: topReadManga || [],
      ratingsChart: ratingsChart || [],
      userActivity: [], // Omitted to save bandwidth; use /api/admin/users for this
      topPages: topPages || [],
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
