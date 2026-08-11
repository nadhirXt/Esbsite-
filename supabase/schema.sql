-- ============================================================
-- ESB Antigravité — Supabase Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Profiles table (extends auth.users)
create table if not exists public.profiles (
  id               uuid references auth.users on delete cascade primary key,
  full_name        text,
  role             text not null default 'student', -- 'student' | 'admin'
  user_type        text,                            -- 'etudiant_esb' | 'autre_etudiant' | 'professeur' | 'ancien' | 'metier'
  institution_name text,                            -- Only for 'autre_etudiant'
  cycle            text,                            -- 'licence' | 'dseb' | 'master'
  created_at       timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role, cycle, user_type, institution_name)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    new.raw_user_meta_data->>'cycle',
    new.raw_user_meta_data->>'user_type',
    new.raw_user_meta_data->>'institution_name'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Documents table
create table if not exists public.documents (
  id         uuid default gen_random_uuid() primary key,
  title      text not null,
  file_path  text not null,
  cycle      text not null,   -- 'licence' | 'dseb' | 'master'
  category   text,            -- 'comptabilite', 'droit', 'finance', etc.
  created_at timestamptz default now()
);

-- 3. Useful links table
create table if not exists public.useful_links (
  id         uuid default gen_random_uuid() primary key,
  title      text not null,
  url        text not null,
  category   text,
  created_at timestamptz default now()
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

-- Profiles
alter table public.profiles enable row level security;
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);
create policy "Admin can view all profiles"
  on public.profiles for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Documents — Students see all docs (for now), Admin manages
alter table public.documents enable row level security;
create policy "Authenticated users can view documents"
  on public.documents for select using (auth.role() = 'authenticated');
create policy "Admin can insert documents"
  on public.documents for insert
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "Admin can delete documents"
  on public.documents for delete
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Useful links — public read, admin write
alter table public.useful_links enable row level security;
create policy "Anyone can view useful links"
  on public.useful_links for select using (true);
create policy "Admin can insert useful links"
  on public.useful_links for insert
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "Admin can delete useful links"
  on public.useful_links for delete
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- ============================================================
-- Storage Bucket
-- Run separately via Supabase Dashboard > Storage, or:
-- ============================================================
-- insert into storage.buckets (id, name, public) values ('documents', 'documents', false);
