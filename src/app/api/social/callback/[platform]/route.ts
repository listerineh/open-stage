import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  exchangeSpotifyCode,
  exchangeYouTubeCode,
  exchangeInstagramCode,
  exchangeTikTokCode,
} from '@/lib/social';
import type { SocialPlatform } from '@/types/database';
import type { OAuthTokens } from '@/lib/social';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const analyticsUrl = `${appUrl}/tools/analytics`;

  const code = request.nextUrl.searchParams.get('code');
  const stateParam = request.nextUrl.searchParams.get('state');
  const error = request.nextUrl.searchParams.get('error');

  if (error) {
    return NextResponse.redirect(`${analyticsUrl}?error=${encodeURIComponent(error)}`);
  }

  if (!code || !stateParam) {
    return NextResponse.redirect(`${analyticsUrl}?error=missing_params`);
  }

  let state: { bandId: string; userId: string; platform: string };
  try {
    state = JSON.parse(Buffer.from(stateParam, 'base64url').toString());
  } catch {
    return NextResponse.redirect(`${analyticsUrl}?error=invalid_state`);
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== state.userId) {
    return NextResponse.redirect(`${analyticsUrl}?error=auth_mismatch`);
  }

  try {
    let tokens: OAuthTokens;

    switch (platform as SocialPlatform) {
      case 'spotify':
        tokens = await exchangeSpotifyCode(code);
        break;
      case 'youtube':
        tokens = await exchangeYouTubeCode(code);
        break;
      case 'instagram':
        tokens = await exchangeInstagramCode(code);
        break;
      case 'tiktok':
        tokens = await exchangeTikTokCode(code);
        break;
      default:
        return NextResponse.redirect(`${analyticsUrl}?error=unsupported_platform`);
    }

    const { error: dbError } = await supabase.from('social_connections').upsert(
      {
        band_id: state.bandId,
        platform: platform as SocialPlatform,
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        expires_at: tokens.expiresAt?.toISOString() ?? null,
        platform_user_id: tokens.platformUserId,
        platform_username: tokens.platformUsername,
        profile_data: tokens.profileData as unknown as Record<string, unknown>,
        connected_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'band_id,platform' }
    );

    if (dbError) {
      console.error('Error saving social connection:', dbError);
      return NextResponse.redirect(`${analyticsUrl}?error=db_error`);
    }

    return NextResponse.redirect(`${analyticsUrl}?connected=${platform}`);
  } catch (err) {
    console.error(`Error in ${platform} callback:`, err);
    const msg = err instanceof Error ? err.message : 'unknown_error';
    return NextResponse.redirect(`${analyticsUrl}?error=${encodeURIComponent(msg)}`);
  }
}
