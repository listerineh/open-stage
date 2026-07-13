import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  fetchSpotifyStats,
  fetchYouTubeStats,
  fetchInstagramStats,
  fetchTikTokStats,
  refreshSpotifyToken,
  refreshYouTubeToken,
  refreshInstagramToken,
  refreshTikTokToken,
} from '@/lib/social';
import type { SocialPlatform } from '@/types/database';

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { bandId, platform } = await request.json();

  if (!bandId) {
    return NextResponse.json({ error: 'Missing bandId' }, { status: 400 });
  }

  const { data: member } = await supabase
    .from('band_members')
    .select('role')
    .eq('band_id', bandId)
    .eq('user_id', user.id)
    .single();

  if (!member) {
    return NextResponse.json({ error: 'Not a member of this band' }, { status: 403 });
  }

  const platformsToSync: SocialPlatform[] = platform
    ? [platform as SocialPlatform]
    : ['spotify', 'youtube', 'instagram', 'tiktok'];

  const results: Record<string, { success: boolean; error?: string }> = {};

  for (const p of platformsToSync) {
    try {
      const { data: connection } = await supabase
        .from('social_connections')
        .select('*')
        .eq('band_id', bandId)
        .eq('platform', p)
        .single();

      if (!connection) {
        results[p] = { success: false, error: 'Not connected' };
        continue;
      }

      let accessToken = connection.access_token;

      const isExpired =
        connection.expires_at && new Date(connection.expires_at) <= new Date(Date.now() + 60000);

      if (isExpired && connection.refresh_token) {
        try {
          let refreshed;
          switch (p) {
            case 'spotify':
              refreshed = await refreshSpotifyToken(connection.refresh_token);
              break;
            case 'youtube':
              refreshed = await refreshYouTubeToken(connection.refresh_token);
              break;
            case 'instagram':
              refreshed = await refreshInstagramToken(connection.access_token);
              break;
            case 'tiktok':
              refreshed = await refreshTikTokToken(connection.refresh_token);
              break;
          }

          if (refreshed) {
            accessToken = refreshed.accessToken;
            await supabase
              .from('social_connections')
              .update({
                access_token: refreshed.accessToken,
                refresh_token: refreshed.refreshToken ?? connection.refresh_token,
                expires_at: refreshed.expiresAt?.toISOString() ?? null,
                updated_at: new Date().toISOString(),
              })
              .eq('id', connection.id);
          }
        } catch (refreshErr) {
          console.error(`Failed to refresh ${p} token:`, refreshErr);
        }
      }

      let fetchResult;
      switch (p) {
        case 'spotify': {
          const profileData = connection.profile_data as Record<string, unknown> | null;
          const spotifyArtistId =
            (profileData?.artistId as string | undefined) ??
            connection.platform_user_id ??
            undefined;
          fetchResult = await fetchSpotifyStats(accessToken, spotifyArtistId);
          break;
        }
        case 'youtube':
          fetchResult = await fetchYouTubeStats(accessToken);
          break;
        case 'instagram':
          fetchResult = await fetchInstagramStats(accessToken, connection.platform_user_id ?? '');
          break;
        case 'tiktok':
          fetchResult = await fetchTikTokStats(accessToken);
          break;
        default:
          continue;
      }

      const today = new Date().toISOString().split('T')[0];

      await supabase.from('social_stats_snapshots').upsert(
        {
          band_id: bandId,
          platform: p,
          snapshot_date: today,
          followers: fetchResult.followers,
          metrics: fetchResult.metrics as Record<string, unknown>,
          synced_at: new Date().toISOString(),
        },
        { onConflict: 'band_id,platform,snapshot_date' }
      );

      const existingProfileData = (connection.profile_data as Record<string, unknown>) ?? {};
      await supabase
        .from('social_connections')
        .update({
          profile_data: {
            ...existingProfileData,
            ...(fetchResult.profileData as unknown as Record<string, unknown>),
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', connection.id);

      results[p] = { success: true };
    } catch (err) {
      console.error(`Error syncing ${p}:`, err);
      results[p] = { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }

  return NextResponse.json({ results, syncedAt: new Date().toISOString() });
}
