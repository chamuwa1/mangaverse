import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase-server";
import { LibraryClient } from "@/components/library/LibraryClient";
import type { Metadata } from "next";

// Always fetch fresh data — never serve a cached render
export const dynamic = "force-dynamic";



export const metadata: Metadata = {
  title: "My Library",
  description: "Your bookmarked manga and reading history.",
  robots: { index: false, follow: false },
};

export default async function LibraryPage() {
  const session = await auth();
  if (!session) redirect("/auth/signin?callbackUrl=/library");

  const supabase = createAdminClient();


  const [{ data: bookmarks }, { data: history }] = await Promise.all([
    supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", session.user?.id)
      .order("added_at", { ascending: false }),
    supabase
      .from("reading_history")
      .select("*")
      .eq("user_id", session.user?.id)
      .order("updated_at", { ascending: false })
      .limit(20),
  ]);

  return (
    <LibraryClient
      bookmarks={bookmarks ?? []}
      history={history ?? []}
      userName={session.user?.name ?? ""}
      userImage={session.user?.image ?? null}
    />
  );
}
