-- ─── The Vault — Supabase Schema ─────────────────────────
-- Run this in your Supabase project's SQL editor.
-- Project: https://supabase.com/dashboard

-- ── Submissions ──────────────────────────────────────────
create table if not exists public.submissions (
  id           uuid        default gen_random_uuid() primary key,
  user_id      uuid        references auth.users(id) on delete cascade,
  artist_name  text        not null,
  track_title  text        not null default '',
  track_url    text        not null,
  platform     text,
  genre        text        not null default '',
  pitch        text        not null default '',
  status       text        not null default 'pending'
                           check (status in ('pending', 'reviewed', 'accepted', 'passed')),
  curator_notes text,
  created_at   timestamptz default now()
);

alter table public.submissions enable row level security;

create policy "Users can view own submissions"
  on public.submissions for select
  using (auth.uid() = user_id);

create policy "Users can insert own submissions"
  on public.submissions for insert
  with check (auth.uid() = user_id);

-- ── Lyric Notes ──────────────────────────────────────────
create table if not exists public.lyric_notes (
  id         uuid        default gen_random_uuid() primary key,
  user_id    uuid        references auth.users(id) on delete cascade not null,
  title      text        not null default 'Untitled',
  content    text        not null default '',
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

alter table public.lyric_notes enable row level security;

create policy "Users can manage own lyric notes"
  on public.lyric_notes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── Press Kits ───────────────────────────────────────────
create table if not exists public.press_kits (
  id           uuid        default gen_random_uuid() primary key,
  user_id      uuid        references auth.users(id) on delete cascade not null unique,
  artist_name  text        not null default '',
  tagline      text        not null default '',
  bio          text        not null default '',
  genre        text        not null default '',
  location     text        not null default '',
  influences   text        not null default '',
  press_quote  text        not null default '',
  social_links jsonb       not null default '{}',
  updated_at   timestamptz default now()
);

alter table public.press_kits enable row level security;

create policy "Users can manage own press kit"
  on public.press_kits for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── Release Checklists ───────────────────────────────────
create table if not exists public.release_checklists (
  id           uuid        default gen_random_uuid() primary key,
  user_id      uuid        references auth.users(id) on delete cascade not null,
  release_name text        not null,
  release_date date,
  items        jsonb       not null default '[]',
  updated_at   timestamptz default now(),
  created_at   timestamptz default now()
);

alter table public.release_checklists enable row level security;

create policy "Users can manage own release checklists"
  on public.release_checklists for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
