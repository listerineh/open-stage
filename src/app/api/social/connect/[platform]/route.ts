import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getSpotifyAuthUrl,
  getYouTubeAuthUrl,
  getInstagramAuthUrl,
  getTikTokAuthUrl,
} from '@/lib/social';
import type { SocialPlatform } from '@/types/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const validPlatforms: SocialPlatform[] = ['spotify', 'youtube', 'instagram', 'tiktok'];
  if (!validPlatforms.includes(platform as SocialPlatform)) {
    return NextResponse.json({ error: 'Invalid platform' }, { status: 400 });
  }

  const bandId = request.nextUrl.searchParams.get('bandId');
  if (!bandId) {
    return NextResponse.json({ error: 'Missing bandId' }, { status: 400 });
  }

  const { data: member } = await supabase
    .from('band_members')
    .select('role')
    .eq('band_id', bandId)
    .eq('user_id', user.id)
    .single();

  if (!member || member.role !== 'admin') {
    return NextResponse.json({ error: 'Only admins can connect platforms' }, { status: 403 });
  }

  const state = Buffer.from(JSON.stringify({ bandId, userId: user.id, platform })).toString(
    'base64url'
  );

  let authUrl: string;

  switch (platform as SocialPlatform) {
    case 'spotify':
      authUrl = getSpotifyAuthUrl(state);
      break;
    case 'youtube':
      authUrl = getYouTubeAuthUrl(state);
      break;
    case 'instagram':
      authUrl = getInstagramAuthUrl(state);
      break;
    case 'tiktok':
      authUrl = getTikTokAuthUrl(state);
      break;
    default:
      return NextResponse.json({ error: 'Unsupported platform' }, { status: 400 });
  }

  return NextResponse.redirect(authUrl);
}
