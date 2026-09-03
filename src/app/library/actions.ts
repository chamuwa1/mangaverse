"use server";

import { createAdminClient } from "@/lib/supabase-server";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// ─── Bookmark Actions ────────────────────────────────────────────────────────

export async function toggleBookmarkAction(params: {
  mangaId: string;
  mangaTitle: string;
  coverUrl: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const supabase = createAdminClient();
  const userId = session.user.id;

  // Check if already bookmarked
  const { data: existing } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("user_id", userId)
    .eq("manga_id", params.mangaId)
    .maybeSingle();

  if (existing) {
    // Remove bookmark
    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("id", existing.id)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { bookmarked: false };
  } else {
    // Add bookmark
    const { error } = await supabase.from("bookmarks").upsert({
      user_id: userId,
      manga_id: params.mangaId,
      manga_title: params.mangaTitle,
      cover_url: params.coverUrl,
    });
    if (error) throw new Error(error.message);
    return { bookmarked: true };
  }
}

export async function checkBookmarkAction(mangaId: string) {
  const session = await auth();
  if (!session?.user?.id) return { bookmarked: false };

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("user_id", session.user.id)
    .eq("manga_id", mangaId)
    .maybeSingle();

  return { bookmarked: !!data };
}

export async function deleteBookmarkAction(bookmarkId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("id", bookmarkId)
    .eq("user_id", session.user.id); // Ownership check

  if (error) throw new Error(error.message);
  return { success: true };
}

// ─── Reading History Actions ─────────────────────────────────────────────────

export async function upsertReadingHistoryAction(params: {
  mangaId: string;
  mangaTitle: string;
  coverUrl: string;
  chapterId: string;
  chapterNum: string;
  pageNum: number;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const supabase = createAdminClient();
  const { error } = await supabase.from("reading_history").upsert(
    {
      user_id: session.user.id,
      manga_id: params.mangaId,
      manga_title: params.mangaTitle,
      cover_url: params.coverUrl,
      chapter_id: params.chapterId,
      chapter_num: params.chapterNum,
      page_num: params.pageNum,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,manga_id" }
  );

  if (error) throw new Error(error.message);
  return { success: true };
}

export async function deleteHistoryItemAction(historyId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("reading_history")
    .delete()
    .eq("id", historyId)
    .eq("user_id", session.user.id); // Ownership check

  if (error) throw new Error(error.message);

  revalidatePath("/library");
  return { success: true };
}

export async function clearAllHistoryAction() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("reading_history")
    .delete()
    .eq("user_id", session.user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/library");
  return { success: true };
}

export async function getRecentReadingHistoryAction() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("reading_history")
    .select("manga_id, chapter_id, manga_title, cover_url, chapter_num, updated_at")
    .eq("user_id", session.user.id)
    .order("updated_at", { ascending: false })
    .limit(10);

  return data || [];
}
