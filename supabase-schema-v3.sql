-- ═══════════════════════════════════════════════════
-- MangaVerse — Supabase Schema Migration v3
-- Adds: page_views table for analytics tracking
-- Run this in your Supabase SQL Editor
-- ═══════════════════════════════════════════════════

-- ─── Page Views ──────────────────────────────────────
create table if not exists page_views (
  id         uuid primary key default uuid_generate_v4(),
  path       text not null,
  user_id    text,                   -- null for anonymous visitors
  referrer   text,
  created_at timestamp with time zone default now()
);

-- Indexes for common query patterns
create index if not exists idx_page_views_path       on page_views(path);
create index if not exists idx_page_views_created_at on page_views(created_at desc);
create index if not exists idx_page_views_user_id    on page_views(user_id);

-- Row Level Security
alter table page_views enable row level security;

-- Allow full access (service_role bypasses RLS automatically)
create policy "allow_all_page_views"
  on page_views for all
  using (true)
  with check (true);
