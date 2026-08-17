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

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = getSupabaseAdmin();

  try {
    const [{ data: bookmarkUsers }, { data: historyUsers }, { data: allRatings }, { data: lastSeenData }] =
      await Promise.all([
        supabase.from("bookmarks").select("user_id"),
        supabase.from("reading_history").select("user_id"),
        supabase.from("ratings").select("user_id, score"),
        supabase
          .from("reading_history")
          .select("user_id, updated_at")
          .order("updated_at", { ascending: false }),
      ]);

    const userMap: Record<
      string,
      { bookmarks: number; reads: number; ratings: number; lastSeen: string }
    > = {};

    bookmarkUsers?.forEach((r: { user_id: string }) => {
      if (!userMap[r.user_id])
        userMap[r.user_id] = { bookmarks: 0, reads: 0, ratings: 0, lastSeen: "" };
      userMap[r.user_id].bookmarks++;
    });

    historyUsers?.forEach((r: { user_id: string }) => {
      if (!userMap[r.user_id])
        userMap[r.user_id] = { bookmarks: 0, reads: 0, ratings: 0, lastSeen: "" };
      userMap[r.user_id].reads++;
    });

    allRatings?.forEach((r: { user_id: string }) => {
      if (!userMap[r.user_id])
        userMap[r.user_id] = { bookmarks: 0, reads: 0, ratings: 0, lastSeen: "" };
      userMap[r.user_id].ratings++;
    });

    lastSeenData?.forEach((r: { user_id: string; updated_at: string }) => {
      if (userMap[r.user_id] && !userMap[r.user_id].lastSeen) {
        userMap[r.user_id].lastSeen = r.updated_at;
      }
    });

    const users = Object.entries(userMap)
      .map(([userId, v]) => ({
        userId: userId.slice(0, 8) + "…",
        fullId: userId,
        ...v,
      }))
      .sort((a, b) => b.reads + b.bookmarks - (a.reads + a.bookmarks));

    return NextResponse.json({ users, total: users.length });
  } catch (err) {
    console.error("Admin users error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
