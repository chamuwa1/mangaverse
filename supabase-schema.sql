-- ═══════════════════════════════════════════════════
-- MangaVerse — Supabase Database Schema (v2)
-- Run this in your Supabase SQL Editor
-- NOTE: We use Auth.js (NextAuth) JWTs, not Supabase Auth.
--       user_id is stored as TEXT (Auth.js user ID).
--       API calls from Next.js Route Handlers use the
--       SUPABASE_SERVICE_ROLE_KEY so RLS allows all
--       server-side operations. The anon key is used
--       for client reads.
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

-- ─── Indexes ─────────────────────────────────────────
create index if not exists idx_bookmarks_user_id on bookmarks(user_id);
create index if not exists idx_bookmarks_added_at on bookmarks(added_at desc);
create index if not exists idx_reading_history_user_id on reading_history(user_id);
create index if not exists idx_reading_history_updated on reading_history(updated_at desc);
create index if not exists idx_ratings_user_id on ratings(user_id);
create index if not exists idx_ratings_manga_id on ratings(manga_id);

-- ─── Row Level Security ───────────────────────────────
-- Since we use Auth.js (not Supabase Auth), the service_role key
-- is used for all server-side writes. RLS policies allow all
-- operations since we enforce ownership in application code.
-- The anon key is used for client-side reads only.

alter table bookmarks enable row level security;
alter table reading_history enable row level security;
alter table ratings enable row level security;

-- Allow ALL operations (service_role bypasses RLS automatically)
-- These policies apply only to anon key requests

-- Bookmarks: allow full access (service role bypasses these)
create policy "allow_all_bookmarks"
  on bookmarks for all
  using (true)
  with check (true);

-- Reading History: allow full access
create policy "allow_all_history"
  on reading_history for all
  using (true)
  with check (true);

-- Ratings: allow full access
create policy "allow_all_ratings"
  on ratings for all
  using (true)
  with check (true);
