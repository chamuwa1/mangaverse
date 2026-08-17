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
    // ── Overview counts ───────────────────────────────────────────
    const [
      { count: totalBookmarks },
      { count: totalHistory },
      { count: totalRatings },
      { count: totalPageViews },
    ] = await Promise.all([
      supabase.from("bookmarks").select("*", { count: "exact", head: true }),
      supabase.from("reading_history").select("*", { count: "exact", head: true }),
      supabase.from("ratings").select("*", { count: "exact", head: true }),
      supabase.from("page_views").select("*", { count: "exact", head: true }),
    ]);

    // ── Unique users ──────────────────────────────────────────────
    const [{ data: bookmarkUsers }, { data: historyUsers }] = await Promise.all([
      supabase.from("bookmarks").select("user_id"),
      supabase.from("reading_history").select("user_id"),
    ]);
    const uniqueUsers = new Set([
      ...(bookmarkUsers?.map((r: { user_id: string }) => r.user_id) ?? []),
      ...(historyUsers?.map((r: { user_id: string }) => r.user_id) ?? []),
    ]).size;

    // ── Daily engagement (last 30 days) ───────────────────────────
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const isoThirty = thirtyDaysAgo.toISOString();

    const [{ data: recentBookmarks }, { data: recentHistory }, { data: recentPageViews }] =
      await Promise.all([
        supabase.from("bookmarks").select("added_at").gte("added_at", isoThirty),
        supabase.from("reading_history").select("updated_at").gte("updated_at", isoThirty),
        supabase.from("page_views").select("created_at").gte("created_at", isoThirty),
      ]);

    // Build day-by-day map
    const dayMap: Record<string, { bookmarks: number; reads: number; views: number }> = {};
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      dayMap[key] = { bookmarks: 0, reads: 0, views: 0 };
    }
    recentBookmarks?.forEach((r: { added_at: string }) => {
      const key = r.added_at.slice(0, 10);
      if (dayMap[key]) dayMap[key].bookmarks++;
    });
    recentHistory?.forEach((r: { updated_at: string }) => {
      const key = r.updated_at.slice(0, 10);
      if (dayMap[key]) dayMap[key].reads++;
    });
    recentPageViews?.forEach((r: { created_at: string }) => {
      const key = r.created_at.slice(0, 10);
      if (dayMap[key]) dayMap[key].views++;
    });
    const dailyEngagement = Object.entries(dayMap).map(([date, vals]) => ({ date, ...vals }));

    // ── Top manga (bookmarks) ─────────────────────────────────────
    const { data: allBookmarks } = await supabase
      .from("bookmarks")
      .select("manga_id, manga_title, cover_url");
    const mangaBookmarkMap: Record<string, { title: string; cover: string; count: number }> = {};
    allBookmarks?.forEach((r: { manga_id: string; manga_title: string; cover_url: string }) => {
      if (!mangaBookmarkMap[r.manga_id]) {
        mangaBookmarkMap[r.manga_id] = { title: r.manga_title, cover: r.cover_url, count: 0 };
      }
      mangaBookmarkMap[r.manga_id].count++;
    });
    const topBookmarkedManga = Object.entries(mangaBookmarkMap)
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    // ── Top manga (reads) ─────────────────────────────────────────
    const { data: allHistory } = await supabase
      .from("reading_history")
      .select("manga_id, manga_title, cover_url");
    const mangaReadMap: Record<string, { title: string; cover: string; count: number }> = {};
    allHistory?.forEach((r: { manga_id: string; manga_title: string; cover_url: string }) => {
      if (!mangaReadMap[r.manga_id]) {
        mangaReadMap[r.manga_id] = { title: r.manga_title, cover: r.cover_url, count: 0 };
      }
      mangaReadMap[r.manga_id].count++;
    });
    const topReadManga = Object.entries(mangaReadMap)
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    // ── Ratings breakdown ─────────────────────────────────────────
    const { data: allRatings } = await supabase.from("ratings").select("score, manga_id, manga_title, user_id");
    const scoreDistribution: Record<number, number> = {};
    for (let i = 1; i <= 10; i++) scoreDistribution[i] = 0;
    let totalScore = 0;
    allRatings?.forEach((r: { score: number }) => {
      if (r.score >= 1 && r.score <= 10) {
        scoreDistribution[r.score]++;
        totalScore += r.score;
      }
    });
    const avgRating = allRatings?.length ? (totalScore / allRatings.length).toFixed(1) : "0.0";
    const ratingsChart = Object.entries(scoreDistribution).map(([score, count]) => ({
      score: Number(score),
      count,
    }));

    // ── Per-user activity ─────────────────────────────────────────
    const userMap: Record<string, { bookmarks: number; reads: number; ratings: number; lastSeen: string }> = {};
    bookmarkUsers?.forEach((r: { user_id: string }) => {
      if (!userMap[r.user_id]) userMap[r.user_id] = { bookmarks: 0, reads: 0, ratings: 0, lastSeen: "" };
      userMap[r.user_id].bookmarks++;
    });
    historyUsers?.forEach((r: { user_id: string }) => {
      if (!userMap[r.user_id]) userMap[r.user_id] = { bookmarks: 0, reads: 0, ratings: 0, lastSeen: "" };
      userMap[r.user_id].reads++;
    });
    allRatings?.forEach((r: { user_id: string }) => {
      if (!userMap[r.user_id]) userMap[r.user_id] = { bookmarks: 0, reads: 0, ratings: 0, lastSeen: "" };
      userMap[r.user_id].ratings++;
    });
    // Get last seen from reading_history
    const { data: lastSeenData } = await supabase
      .from("reading_history")
      .select("user_id, updated_at")
      .order("updated_at", { ascending: false });
    lastSeenData?.forEach((r: { user_id: string; updated_at: string }) => {
      if (userMap[r.user_id] && !userMap[r.user_id].lastSeen) {
        userMap[r.user_id].lastSeen = r.updated_at;
      }
    });
    const userActivity = Object.entries(userMap)
      .map(([userId, v]) => ({
        userId: userId.slice(0, 8) + "…",
        fullId: userId,
        ...v,
      }))
      .sort((a, b) => b.reads + b.bookmarks - (a.reads + a.bookmarks));

    // ── Top pages (page_views) ────────────────────────────────────
    const { data: pageViewData } = await supabase.from("page_views").select("path");
    const pathMap: Record<string, number> = {};
    pageViewData?.forEach((r: { path: string }) => {
      pathMap[r.path] = (pathMap[r.path] ?? 0) + 1;
    });
    const topPages = Object.entries(pathMap)
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return NextResponse.json({
      overview: {
        uniqueUsers,
        totalBookmarks: totalBookmarks ?? 0,
        totalReads: totalHistory ?? 0,
        totalRatings: totalRatings ?? 0,
        totalPageViews: totalPageViews ?? 0,
        avgRating,
      },
      dailyEngagement,
      topBookmarkedManga,
      topReadManga,
      ratingsChart,
      userActivity,
      topPages,
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
