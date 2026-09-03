-- ═══════════════════════════════════════════════════
-- MangaVerse — Supabase Database Schema (Consolidated)
-- Run this in your Supabase SQL Editor
-- NOTE: We use Auth.js (NextAuth) JWTs, not Supabase Auth.
--       All secure database interactions should be routed
--       through Next.js Server Actions using the 
--       SUPABASE_SERVICE_ROLE_KEY to bypass RLS safely.
-- ═══════════════════════════════════════════════════

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── Bookmarks ───────────────────────────────────────
create table if not exists bookmarks (
  id           uuid primary key default uuid_generate_v4(),
  user_id      text not null,
  manga_id     text not null,
  manga_title  text not null,
  cover_url    text,
  manga_type   text default 'manga',
  status       text,
  added_at     timestamp with time zone default now(),
  unique(user_id, manga_id)
);

-- ─── Reading History ─────────────────────────────────
create table if not exists reading_history (
  id           uuid primary key default uuid_generate_v4(),
  user_id      text not null,
  manga_id     text not null,
  manga_title  text not null,
  cover_url    text,
  chapter_id   text not null,
  chapter_num  text,
  page_num     integer default 1,
  updated_at   timestamp with time zone default now(),
  unique(user_id, manga_id)
);

-- ─── Ratings ─────────────────────────────────────────
create table if not exists ratings (
  id           uuid primary key default uuid_generate_v4(),
  user_id      text not null,
  manga_id     text not null,
  score        integer check (score >= 1 and score <= 10),
  review       text,
  created_at   timestamp with time zone default now(),
  updated_at   timestamp with time zone default now(),
  unique(user_id, manga_id)
);

-- ─── Page Views ──────────────────────────────────────
create table if not exists page_views (
  id         uuid primary key default uuid_generate_v4(),
  path       text not null,
  user_id    text,                   -- null for anonymous visitors
  referrer   text,
  created_at timestamp with time zone default now()
);

-- ─── Indexes ─────────────────────────────────────────
create index if not exists idx_bookmarks_user_id on bookmarks(user_id);
create index if not exists idx_bookmarks_added_at on bookmarks(added_at desc);
create index if not exists idx_reading_history_user_id on reading_history(user_id);
create index if not exists idx_reading_history_updated on reading_history(updated_at desc);
create index if not exists idx_ratings_user_id on ratings(user_id);
create index if not exists idx_ratings_manga_id on ratings(manga_id);
create index if not exists idx_page_views_path on page_views(path);
create index if not exists idx_page_views_created_at on page_views(created_at desc);
create index if not exists idx_page_views_user_id on page_views(user_id);

-- ─── Row Level Security ───────────────────────────────
-- Ensure RLS is enabled for all tables
alter table bookmarks enable row level security;
alter table reading_history enable row level security;
alter table ratings enable row level security;
alter table page_views enable row level security;

-- 1. Drop old permissive policies if they exist from older migrations
DROP POLICY IF EXISTS "allow_all_bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "allow_all_history" ON reading_history;
DROP POLICY IF EXISTS "allow_all_ratings" ON ratings;
DROP POLICY IF EXISTS "allow_all_page_views" ON page_views;
DROP POLICY IF EXISTS "Users can view their own reading history" ON reading_history;
DROP POLICY IF EXISTS "Users can manage their own reading history" ON reading_history;
DROP POLICY IF EXISTS "anon_select_bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "anon_select_history" ON reading_history;
DROP POLICY IF EXISTS "anon_select_ratings" ON ratings;
DROP POLICY IF EXISTS "anon_select_page_views" ON page_views;

-- 2. New Restrictive Policies
-- The service_role key bypasses RLS entirely.
-- We only allow the anon key to INSERT page views for analytics.
-- All reading of user data is securely done server-side.

DROP POLICY IF EXISTS "anon_insert_page_views" ON page_views;
CREATE POLICY "anon_insert_page_views"
  ON page_views FOR INSERT
  TO anon
  WITH CHECK (true);

-- ═══════════════════════════════════════════════════
-- Admin Analytics RPCs (Remote Procedure Calls)
-- ═══════════════════════════════════════════════════

-- 1. Overview counts
CREATE OR REPLACE FUNCTION get_admin_overview()
RETURNS json AS $$
DECLARE
  unique_users bigint;
  total_bookmarks bigint;
  total_reads bigint;
  total_ratings bigint;
  total_page_views bigint;
  avg_rating numeric;
BEGIN
  SELECT count(DISTINCT user_id) INTO unique_users FROM (
    SELECT user_id FROM bookmarks UNION SELECT user_id FROM reading_history
  ) AS u;
  SELECT count(*) INTO total_bookmarks FROM bookmarks;
  SELECT count(*) INTO total_reads FROM reading_history;
  SELECT count(*) INTO total_ratings FROM ratings;
  SELECT count(*) INTO total_page_views FROM page_views;
  SELECT COALESCE(trunc(avg(score), 1), 0.0) INTO avg_rating FROM ratings;

  RETURN json_build_object(
    'uniqueUsers', unique_users,
    'totalBookmarks', total_bookmarks,
    'totalReads', total_reads,
    'totalRatings', total_ratings,
    'totalPageViews', total_page_views,
    'avgRating', avg_rating
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Daily engagement
CREATE OR REPLACE FUNCTION get_daily_engagement(days integer)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  WITH dates AS (
    SELECT generate_series(
      date_trunc('day', now()) - (days || ' days')::interval,
      date_trunc('day', now()),
      '1 day'::interval
    ) AS d
  ),
  b AS (
    SELECT date_trunc('day', added_at) as d, count(*) as c FROM bookmarks WHERE added_at >= now() - (days || ' days')::interval GROUP BY 1
  ),
  r AS (
    SELECT date_trunc('day', updated_at) as d, count(*) as c FROM reading_history WHERE updated_at >= now() - (days || ' days')::interval GROUP BY 1
  ),
  v AS (
    SELECT date_trunc('day', created_at) as d, count(*) as c FROM page_views WHERE created_at >= now() - (days || ' days')::interval GROUP BY 1
  )
  SELECT json_agg(json_build_object(
    'date', to_char(dates.d, 'YYYY-MM-DD'),
    'bookmarks', COALESCE(b.c, 0),
    'reads', COALESCE(r.c, 0),
    'views', COALESCE(v.c, 0)
  )) INTO result
  FROM dates
  LEFT JOIN b ON dates.d = b.d
  LEFT JOIN r ON dates.d = r.d
  LEFT JOIN v ON dates.d = v.d;

  RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Top bookmarked manga
CREATE OR REPLACE FUNCTION get_top_manga_bookmarks(limit_count integer)
RETURNS json AS $$
DECLARE result json;
BEGIN
  SELECT json_agg(t) INTO result FROM (
    SELECT manga_id as id, manga_title as title, cover_url as cover, count(*) as count
    FROM bookmarks GROUP BY manga_id, manga_title, cover_url ORDER BY count(*) DESC LIMIT limit_count
  ) t;
  RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Top read manga
CREATE OR REPLACE FUNCTION get_top_manga_reads(limit_count integer)
RETURNS json AS $$
DECLARE result json;
BEGIN
  SELECT json_agg(t) INTO result FROM (
    SELECT manga_id as id, manga_title as title, cover_url as cover, count(*) as count
    FROM reading_history GROUP BY manga_id, manga_title, cover_url ORDER BY count(*) DESC LIMIT limit_count
  ) t;
  RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Ratings distribution
CREATE OR REPLACE FUNCTION get_ratings_distribution()
RETURNS json AS $$
DECLARE result json;
BEGIN
  WITH scores AS (SELECT generate_series(1, 10) AS s),
  c AS (SELECT score as s, count(*) as count FROM ratings GROUP BY 1)
  SELECT json_agg(json_build_object('score', scores.s, 'count', COALESCE(c.count, 0))) INTO result
  FROM scores LEFT JOIN c ON scores.s = c.s;
  RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Top pages
CREATE OR REPLACE FUNCTION get_top_pages(limit_count integer)
RETURNS json AS $$
DECLARE result json;
BEGIN
  SELECT json_agg(t) INTO result FROM (
    SELECT path, count(*) as count FROM page_views GROUP BY path ORDER BY count(*) DESC LIMIT limit_count
  ) t;
  RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Paginated user activity
CREATE OR REPLACE FUNCTION get_user_activity_paginated(search_query text, page_num integer, page_size integer)
RETURNS json AS $$
DECLARE
  result json;
  total_count bigint;
BEGIN
  WITH all_users AS (
    SELECT user_id FROM bookmarks UNION SELECT user_id FROM reading_history UNION SELECT user_id FROM ratings
  ),
  filtered_users AS (
    SELECT user_id FROM all_users 
    WHERE search_query = '' OR user_id ILIKE '%' || search_query || '%'
  )
  SELECT count(*) INTO total_count FROM filtered_users;

  WITH all_users AS (
    SELECT user_id FROM bookmarks UNION SELECT user_id FROM reading_history UNION SELECT user_id FROM ratings
  ),
  filtered_users AS (
    SELECT user_id FROM all_users 
    WHERE search_query = '' OR user_id ILIKE '%' || search_query || '%'
  ),
  user_stats AS (
    SELECT 
      u.user_id,
      (SELECT count(*) FROM bookmarks b WHERE b.user_id = u.user_id) as bookmarks,
      (SELECT count(*) FROM reading_history rh WHERE rh.user_id = u.user_id) as reads,
      (SELECT count(*) FROM ratings r WHERE r.user_id = u.user_id) as ratings,
      (SELECT max(updated_at) FROM reading_history rh WHERE rh.user_id = u.user_id) as last_seen
    FROM filtered_users u
    ORDER BY ((SELECT count(*) FROM bookmarks b WHERE b.user_id = u.user_id) + (SELECT count(*) FROM reading_history rh WHERE rh.user_id = u.user_id)) DESC
    LIMIT page_size OFFSET (page_num - 1) * page_size
  )
  SELECT json_build_object(
    'total', total_count,
    'users', COALESCE(json_agg(
      json_build_object(
        'userId', substring(user_id from 1 for 8) || '…',
        'fullId', user_id,
        'bookmarks', bookmarks,
        'reads', reads,
        'ratings', ratings,
        'lastSeen', last_seen
      )
    ), '[]'::json)
  ) INTO result FROM user_stats;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

 
 