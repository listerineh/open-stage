import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { bandId, artistId } = await request.json();

  if (!bandId || !artistId) {
    return NextResponse.json({ error: 'Missing bandId or artistId' }, { status: 400 });
  }

  const { data: member } = await supabase
    .from('band_members')
    .select('role')
    .eq('band_id', bandId)
    .eq('user_id', user.id)
    .single();

  if (!member || member.role !== 'admin') {
    return NextResponse.json({ error: 'Admin role required' }, { status: 403 });
  }

  const { data: connection } = await supabase
    .from('social_connections')
    .select('id, profile_data')
    .eq('band_id', bandId)
    .eq('platform', 'spotify')
    .single();

  if (!connection) {
    return NextResponse.json({ error: 'Spotify not connected' }, { status: 404 });
  }

  const existingProfileData = (connection.profile_data as Record<string, unknown>) ?? {};

  const { error } = await supabase
    .from('social_connections')
    .update({
      profile_data: { ...existingProfileData, artistId },
      updated_at: new Date().toISOString(),
    })
    .eq('id', connection.id);

  if (error) {
    console.error('[spotify-artist] update error:', error);
    return NextResponse.json({ error: 'Failed to save artist ID' }, { status: 500 });
  }

  return NextResponse.json({ success: true, artistId });
}
