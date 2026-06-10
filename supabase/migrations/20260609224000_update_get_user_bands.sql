-- Update get_user_bands to include drive_folder_id

create or replace function public.get_user_bands()
returns table (
  id uuid,
  name text,
  slug text,
  logo_url text,
  drive_folder_id text,
  role band_role,
  is_current boolean
) as $$
begin
  return query
  select 
    b.id,
    b.name,
    b.slug,
    b.logo_url,
    b.drive_folder_id,
    bm.role,
    (p.current_band_id = b.id) as is_current
  from public.bands b
  inner join public.band_members bm on bm.band_id = b.id
  inner join public.profiles p on p.id = bm.user_id
  where bm.user_id = auth.uid()
  order by bm.joined_at desc;
end;
$$ language plpgsql security definer;
