-- ═══════════════════════════════════════════════════
-- MangaVerse — RLS Security Fix Migration
-- Run this in your Supabase SQL Editor
-- 
-- WHAT THIS DOES:
-- Drops the permissive "allow all" policies and replaces
-- them with restrictive policies:
--   • anon key: SELECT-only on user-scoped tables
--   • page_views: INSERT-only for anon (analytics)
--   • service_role: bypasses RLS automatically (no policy needed)
--
-- Since we use NextAuth (not Supabase Auth), all writes
-- go through server actions using the service_role key.
-- The anon key is only used for client-side reads.
-- ═══════════════════════════════════════════════════

-- ─── 1. Drop existing permissive policies ────────────────────────────────────

DROP POLICY IF EXISTS "allow_all_bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "allow_all_history" ON reading_history;
DROP POLICY IF EXISTS "allow_all_ratings" ON ratings;
DROP POLICY IF EXISTS "allow_all_page_views" ON page_views;

-- Also drop the older RLS policies from supabase-rls.sql if they exist
DROP POLICY IF EXISTS "Users can view their own reading history" ON reading_history;
DROP POLICY IF EXISTS "Users can manage their own reading history" ON reading_history;
DROP POLICY IF EXISTS "Users can view their own library" ON library;
DROP POLICY IF EXISTS "Users can manage their own library" ON library;

-- ─── 2. Ensure RLS is enabled ────────────────────────────────────────────────

ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- ─── 3. New restrictive policies ─────────────────────────────────────────────

-- Bookmarks: anon can only SELECT (reads scoped by app code)
CREATE POLICY "anon_select_bookmarks"
  ON bookmarks FOR SELECT
  TO anon
  USING (true);

-- Reading History: anon can only SELECT
CREATE POLICY "anon_select_history"
  ON reading_history FOR SELECT
  TO anon
  USING (true);

-- Ratings: anon can only SELECT
CREATE POLICY "anon_select_ratings"
  ON ratings FOR SELECT
  TO anon
  USING (true);

-- Page Views: anon can INSERT (analytics tracking) and SELECT
CREATE POLICY "anon_insert_page_views"
  ON page_views FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "anon_select_page_views"
  ON page_views FOR SELECT
  TO anon
  USING (true);

-- ─── Notes ───────────────────────────────────────────────────────────────────
-- • The service_role key bypasses RLS entirely, so no policies
--   are needed for server-side writes (API routes / server actions).
-- • The anon key can now only read data. All writes (INSERT, UPDATE,
--   DELETE) on bookmarks, reading_history, and ratings are blocked
--   for the anon role.
-- • Client-side reads via anon key still return all rows. Row-level
--   scoping is enforced in application code via .eq("user_id", ...).
--   For additional defense-in-depth, consider using Supabase custom
--   claims or a Postgres function to validate the user_id.
