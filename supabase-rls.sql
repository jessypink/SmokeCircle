-- Run this in Supabase Dashboard -> SQL Editor.
--
-- Important:
-- The current React app does NOT use Supabase Auth. It identifies users by a
-- row in public.users, so auth.uid() is null for app requests.
-- Because of that, auth.uid()-based policies will block this MVP.
--
-- These policies intentionally allow anon reads/writes for the current MVP.
-- Later, after adding Supabase Auth, replace them with stricter per-user rules.

create extension if not exists "uuid-ossp";

create table if not exists public.groups (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  invite_code text unique not null,
  created_at timestamptz default now()
);

create table if not exists public.users (
  id uuid primary key default uuid_generate_v4(),
  username text unique not null,
  group_id uuid references public.groups(id) on delete cascade not null,
  created_at timestamptz default now()
);

create table if not exists public.entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade not null,
  group_id uuid references public.groups(id) on delete cascade not null,
  date date not null,
  status text check (status in ('clean', 'smoked')) not null,
  notes text,
  created_at timestamptz default now(),
  unique(user_id, date)
);

alter table public.groups enable row level security;
alter table public.users enable row level security;
alter table public.entries enable row level security;

drop policy if exists "Public groups by invite" on public.groups;
drop policy if exists "View own group users" on public.users;
drop policy if exists "View group entries" on public.entries;
drop policy if exists "Insert own entries" on public.entries;
drop policy if exists "Update own entries" on public.entries;

drop policy if exists "Allow anon read groups" on public.groups;
drop policy if exists "Allow anon insert groups" on public.groups;
drop policy if exists "Allow anon read users" on public.users;
drop policy if exists "Allow anon insert users" on public.users;
drop policy if exists "Allow anon read entries" on public.entries;
drop policy if exists "Allow anon insert entries" on public.entries;
drop policy if exists "Allow anon update entries" on public.entries;

create policy "Allow anon read groups"
on public.groups
for select
to anon
using (true);

create policy "Allow anon insert groups"
on public.groups
for insert
to anon
with check (true);

create policy "Allow anon read users"
on public.users
for select
to anon
using (true);

create policy "Allow anon insert users"
on public.users
for insert
to anon
with check (true);

create policy "Allow anon read entries"
on public.entries
for select
to anon
using (true);

create policy "Allow anon insert entries"
on public.entries
for insert
to anon
with check (true);

create policy "Allow anon update entries"
on public.entries
for update
to anon
using (true)
with check (true);
