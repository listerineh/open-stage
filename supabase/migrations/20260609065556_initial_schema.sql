-- OpenStage Initial Schema
-- Tablas base para el MVP

-- ===========================================
-- PROFILES (extiende auth.users de Supabase)
-- ===========================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- RLS para profiles
alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Trigger para crear profile automáticamente al registrarse
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ===========================================
-- BANDS (equipos/bandas)
-- ===========================================
create table public.bands (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique not null,
  description text,
  logo_url text,
  genre text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- RLS para bands
alter table public.bands enable row level security;

-- ===========================================
-- BAND_MEMBERS (relación usuarios-bandas)
-- ===========================================
create type public.band_role as enum ('admin', 'editor', 'viewer');

create table public.band_members (
  id uuid default gen_random_uuid() primary key,
  band_id uuid references public.bands(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role band_role default 'viewer' not null,
  joined_at timestamptz default now() not null,
  unique(band_id, user_id)
);

-- RLS para band_members
alter table public.band_members enable row level security;

-- Policies para bands (basadas en membresía)
create policy "Band members can view their bands"
  on public.bands for select
  using (
    exists (
      select 1 from public.band_members
      where band_members.band_id = bands.id
      and band_members.user_id = auth.uid()
    )
  );

create policy "Band admins can update their bands"
  on public.bands for update
  using (
    exists (
      select 1 from public.band_members
      where band_members.band_id = bands.id
      and band_members.user_id = auth.uid()
      and band_members.role = 'admin'
    )
  );

create policy "Authenticated users can create bands"
  on public.bands for insert
  with check (auth.uid() is not null);

-- Policies para band_members
create policy "Band members can view other members"
  on public.band_members for select
  using (
    exists (
      select 1 from public.band_members as my_membership
      where my_membership.band_id = band_members.band_id
      and my_membership.user_id = auth.uid()
    )
  );

create policy "Band admins can manage members"
  on public.band_members for all
  using (
    exists (
      select 1 from public.band_members as admin_check
      where admin_check.band_id = band_members.band_id
      and admin_check.user_id = auth.uid()
      and admin_check.role = 'admin'
    )
  );

-- ===========================================
-- VIDEOS (videos subidos)
-- ===========================================
create type public.video_status as enum ('uploading', 'processing', 'ready', 'error');

create table public.videos (
  id uuid default gen_random_uuid() primary key,
  band_id uuid references public.bands(id) on delete cascade not null,
  uploaded_by uuid references public.profiles(id) on delete set null,
  title text not null,
  description text,
  original_filename text,
  storage_path text not null,
  duration_seconds integer,
  file_size_bytes bigint,
  status video_status default 'uploading' not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- RLS para videos
alter table public.videos enable row level security;

create policy "Band members can view videos"
  on public.videos for select
  using (
    exists (
      select 1 from public.band_members
      where band_members.band_id = videos.band_id
      and band_members.user_id = auth.uid()
    )
  );

create policy "Band editors can create videos"
  on public.videos for insert
  with check (
    exists (
      select 1 from public.band_members
      where band_members.band_id = videos.band_id
      and band_members.user_id = auth.uid()
      and band_members.role in ('admin', 'editor')
    )
  );

create policy "Band editors can update videos"
  on public.videos for update
  using (
    exists (
      select 1 from public.band_members
      where band_members.band_id = videos.band_id
      and band_members.user_id = auth.uid()
      and band_members.role in ('admin', 'editor')
    )
  );

-- ===========================================
-- CLIPS (clips generados de videos)
-- ===========================================
create type public.clip_format as enum ('tiktok', 'reels', 'youtube_shorts', 'square');
create type public.clip_status as enum ('pending', 'processing', 'ready', 'error');

create table public.clips (
  id uuid default gen_random_uuid() primary key,
  video_id uuid references public.videos(id) on delete cascade not null,
  band_id uuid references public.bands(id) on delete cascade not null,
  title text not null,
  format clip_format not null,
  status clip_status default 'pending' not null,
  storage_path text,
  thumbnail_path text,
  start_time_seconds numeric(10,3),
  end_time_seconds numeric(10,3),
  duration_seconds numeric(10,3),
  has_subtitles boolean default false,
  subtitle_style jsonb default '{}'::jsonb,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- RLS para clips
alter table public.clips enable row level security;

create policy "Band members can view clips"
  on public.clips for select
  using (
    exists (
      select 1 from public.band_members
      where band_members.band_id = clips.band_id
      and band_members.user_id = auth.uid()
    )
  );

create policy "Band editors can manage clips"
  on public.clips for all
  using (
    exists (
      select 1 from public.band_members
      where band_members.band_id = clips.band_id
      and band_members.user_id = auth.uid()
      and band_members.role in ('admin', 'editor')
    )
  );

-- ===========================================
-- INDEXES para performance
-- ===========================================
create index idx_band_members_user_id on public.band_members(user_id);
create index idx_band_members_band_id on public.band_members(band_id);
create index idx_videos_band_id on public.videos(band_id);
create index idx_clips_video_id on public.clips(video_id);
create index idx_clips_band_id on public.clips(band_id);

-- ===========================================
-- UPDATED_AT trigger function
-- ===========================================
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply updated_at triggers
create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.update_updated_at_column();

create trigger update_bands_updated_at
  before update on public.bands
  for each row execute procedure public.update_updated_at_column();

create trigger update_videos_updated_at
  before update on public.videos
  for each row execute procedure public.update_updated_at_column();

create trigger update_clips_updated_at
  before update on public.clips
  for each row execute procedure public.update_updated_at_column();
