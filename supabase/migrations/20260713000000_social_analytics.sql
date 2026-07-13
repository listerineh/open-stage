-- Social Analytics Migration
-- Adds social_connections and social_stats_snapshots tables

-- ===========================================
-- SOCIAL CONNECTIONS
-- Stores OAuth tokens per band per platform
-- ===========================================
create table public.social_connections (
  id uuid default gen_random_uuid() primary key,
  band_id uuid references public.bands(id) on delete cascade not null,
  platform text not null check (platform in ('spotify', 'youtube', 'instagram', 'tiktok')),
  access_token text not null,
  refresh_token text,
  expires_at timestamptz,
  platform_user_id text,
  platform_username text,
  profile_data jsonb default '{}'::jsonb,
  connected_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  constraint social_connections_band_platform_unique unique (band_id, platform)
);

-- Indexes
create index idx_social_connections_band_id on public.social_connections(band_id);
create index idx_social_connections_platform on public.social_connections(platform);

-- RLS
alter table public.social_connections enable row level security;

-- Band members can read connections
create policy "Band members can view social connections"
  on public.social_connections for select
  using (
    exists (
      select 1 from public.band_members
      where band_members.band_id = social_connections.band_id
      and band_members.user_id = auth.uid()
    )
  );

-- Only admins can insert/update/delete connections
create policy "Band admins can manage social connections"
  on public.social_connections for all
  using (
    exists (
      select 1 from public.band_members
      where band_members.band_id = social_connections.band_id
      and band_members.user_id = auth.uid()
      and band_members.role = 'admin'
    )
  );

-- ===========================================
-- SOCIAL STATS SNAPSHOTS
-- One snapshot per band per platform per day
-- ===========================================
create table public.social_stats_snapshots (
  id uuid default gen_random_uuid() primary key,
  band_id uuid references public.bands(id) on delete cascade not null,
  platform text not null check (platform in ('spotify', 'youtube', 'instagram', 'tiktok')),
  snapshot_date date not null default current_date,
  followers integer not null default 0,
  metrics jsonb default '{}'::jsonb,
  synced_at timestamptz default now() not null,
  constraint social_stats_snapshots_unique unique (band_id, platform, snapshot_date)
);

-- Indexes
create index idx_social_stats_band_id on public.social_stats_snapshots(band_id);
create index idx_social_stats_platform on public.social_stats_snapshots(platform);
create index idx_social_stats_date on public.social_stats_snapshots(snapshot_date desc);
create index idx_social_stats_band_platform on public.social_stats_snapshots(band_id, platform, snapshot_date desc);

-- RLS
alter table public.social_stats_snapshots enable row level security;

-- Band members can read snapshots
create policy "Band members can view social stats"
  on public.social_stats_snapshots for select
  using (
    exists (
      select 1 from public.band_members
      where band_members.band_id = social_stats_snapshots.band_id
      and band_members.user_id = auth.uid()
    )
  );

-- Server-side inserts/updates (via service role or admins)
create policy "Band admins can manage social stats"
  on public.social_stats_snapshots for all
  using (
    exists (
      select 1 from public.band_members
      where band_members.band_id = social_stats_snapshots.band_id
      and band_members.user_id = auth.uid()
      and band_members.role = 'admin'
    )
  );
