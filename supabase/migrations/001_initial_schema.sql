-- ============================================================================
-- श्री गणेश मित्र मंडळ 2026 — Initial schema
-- Run in: Supabase Dashboard → SQL Editor  (or `supabase db push`)
-- Order matters: profiles first (is_admin() depends on it).
-- ============================================================================

create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- ---------------------------------------------------------------------------
-- 1. PROFILES  (1:1 with auth.users, auto-created by trigger)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  name          text not null default '',
  email         text not null,
  role          text not null default 'member'
                check (role in ('member', 'admin')),
  profile_image text,
  created_at    timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- security definer helper → avoids RLS recursion, usable inside policies
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public, pg_temp
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create policy "Users read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Admins read all profiles"
  on public.profiles for select
  using (public.is_admin());

create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins update any profile"
  on public.profiles for update
  using (public.is_admin());

create policy "Admins delete profiles"
  on public.profiles for delete
  using (public.is_admin());

-- profile insert for new sign-ups is done by the trigger below (security definer)

-- ---------------------------------------------------------------------------
-- 2. POSTS
-- ---------------------------------------------------------------------------
create table if not exists public.posts (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  content     text not null default '',
  excerpt     text not null default '',
  cover_image text,
  author_id   uuid not null references public.profiles (id) on delete cascade,
  author_name text not null default '',
  published   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.posts enable row level security;

create policy "Public read published posts"
  on public.posts for select
  using (published = true);

create policy "Admins read all posts (incl. drafts)"
  on public.posts for select
  using (public.is_admin());

create policy "Admins insert posts"
  on public.posts for insert
  with check (public.is_admin());

create policy "Admins update posts"
  on public.posts for update
  using (public.is_admin());

create policy "Admins delete posts"
  on public.posts for delete
  using (public.is_admin());

create index if not exists posts_published_idx on public.posts (published, created_at desc);

-- ---------------------------------------------------------------------------
-- 3. EVENTS
-- ---------------------------------------------------------------------------
create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text not null default '',
  event_date  date not null,
  event_time  text not null default '',
  location    text not null default '',
  image       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.events enable row level security;

create policy "Public read events"
  on public.events for select
  using (true);

create policy "Admins insert events"
  on public.events for insert
  with check (public.is_admin());

create policy "Admins update events"
  on public.events for update
  using (public.is_admin());

create policy "Admins delete events"
  on public.events for delete
  using (public.is_admin());

create index if not exists events_date_idx on public.events (event_date);

-- ---------------------------------------------------------------------------
-- 4. ANNOUNCEMENTS
-- ---------------------------------------------------------------------------
create table if not exists public.announcements (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  content     text not null default '',
  image       text,
  published   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.announcements enable row level security;

create policy "Public read published announcements"
  on public.announcements for select
  using (published = true);

create policy "Admins read all announcements (incl. drafts)"
  on public.announcements for select
  using (public.is_admin());

create policy "Admins insert announcements"
  on public.announcements for insert
  with check (public.is_admin());

create policy "Admins update announcements"
  on public.announcements for update
  using (public.is_admin());

create policy "Admins delete announcements"
  on public.announcements for delete
  using (public.is_admin());

create index if not exists announcements_published_idx
  on public.announcements (published, created_at desc);

-- ---------------------------------------------------------------------------
-- 5. GALLERY
-- ---------------------------------------------------------------------------
create table if not exists public.gallery (
  id          uuid primary key default gen_random_uuid(),
  title       text not null default '',
  description text not null default '',
  image_url   text not null,
  uploaded_by uuid references public.profiles (id) on delete set null,
  created_at  timestamptz not null default now()
);

alter table public.gallery enable row level security;

create policy "Public read gallery"
  on public.gallery for select
  using (true);

create policy "Admins insert gallery"
  on public.gallery for insert
  with check (public.is_admin());

create policy "Admins update gallery"
  on public.gallery for update
  using (public.is_admin());

create policy "Admins delete gallery"
  on public.gallery for delete
  using (public.is_admin());

create index if not exists gallery_created_idx on public.gallery (created_at desc);

-- ---------------------------------------------------------------------------
-- 6. TRIGGERS
-- ---------------------------------------------------------------------------

-- auto-create a member profile on every new auth.users row
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'name', ''), split_part(new.email, '@', 1)),
    new.email,
    'member'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

drop trigger if exists announcements_set_updated_at on public.announcements;
create trigger announcements_set_updated_at
  before update on public.announcements
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 7. STORAGE — public 'images' bucket
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'images',
  'images',
  true,
  10485760, -- 10 MB
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "Public read images"
  on storage.objects for select
  using (bucket_id = 'images');

create policy "Authenticated users upload images"
  on storage.objects for insert
  with check (bucket_id = 'images' and auth.role() = 'authenticated');

create policy "Owner or admin update images"
  on storage.objects for update
  using (bucket_id = 'images' and (owner = auth.uid() or public.is_admin()));

create policy "Owner or admin delete images"
  on storage.objects for delete
  using (bucket_id = 'images' and (owner = auth.uid() or public.is_admin()));
