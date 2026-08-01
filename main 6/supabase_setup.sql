-- ============================================================
-- Bharat Stack — Supabase schema setup
-- Run this in: Supabase Dashboard -> SQL Editor -> New query -> Run
-- ============================================================

-- 1. PROFILES (gamification: xp, coins, streak, badges, level, league)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  xp integer default 0,
  coins integer default 0,
  streak integer default 0,
  badges jsonb default '[]'::jsonb,
  level integer default 1,
  league text default 'Bronze',
  updated_at timestamptz default now()
);

-- 2. COURSES (video/module content)
create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  video_url text,
  thumbnail_url text,
  grade_level text,
  category text,
  visibility text default 'public',
  created_at timestamptz default now()
);

-- 3. SCHOOLS (admin-managed school records)
create table if not exists schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  board text,
  principal_name text,
  email text,
  phone text,
  student_count integer default 0,
  status text default 'pending',
  district text default 'General',
  created_at timestamptz default now()
);

-- 4. STUDENT_PROGRESS (which courses a student completed)
create table if not exists student_progress (
  user_id uuid not null,
  course_id uuid not null references courses(id) on delete cascade,
  completed_at timestamptz default now(),
  primary key (user_id, course_id)
);

-- 5. SYSTEM_CONFIG (single-row global app settings)
create table if not exists system_config (
  id text primary key,
  config_data jsonb,
  updated_at timestamptz default now()
);

-- 6. NOTIFICATIONS
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  type text,
  title_en text,
  title_ta text,
  message_en text,
  message_ta text,
  link_to text,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- ============================================================
-- Row Level Security — enabled with permissive starter policies.
-- Tighten these later once you have real auth roles (student/admin).
-- ============================================================

alter table profiles enable row level security;
alter table courses enable row level security;
alter table schools enable row level security;
alter table student_progress enable row level security;
alter table system_config enable row level security;
alter table notifications enable row level security;

-- Profiles: users can read/write only their own row
create policy "profiles_select_own" on profiles for select using (auth.uid() = id);
create policy "profiles_upsert_own" on profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);

-- Courses: readable by anyone (it's the public course catalog)
create policy "courses_public_read" on courses for select using (true);
create policy "courses_authenticated_write" on courses for all using (auth.role() = 'authenticated');

-- Schools: authenticated users can read/write (tighten to admin-only later)
create policy "schools_authenticated_all" on schools for all using (auth.role() = 'authenticated');

-- Student progress: users can manage only their own rows
create policy "progress_select_own" on student_progress for select using (auth.uid() = user_id);
create policy "progress_upsert_own" on student_progress for insert with check (auth.uid() = user_id);
create policy "progress_delete_own" on student_progress for delete using (auth.uid() = user_id);

-- System config: readable by anyone, writable by authenticated (tighten to admin later)
create policy "config_public_read" on system_config for select using (true);
create policy "config_authenticated_write" on system_config for all using (auth.role() = 'authenticated');

-- Notifications: readable/writable by authenticated users
create policy "notifications_authenticated_all" on notifications for all using (auth.role() = 'authenticated');
