import type { OAuthTokens, PlatformFetchResult, RefreshedTokens } from './types';
import type { SpotifyTrack } from '@/types/database';

const SPOTIFY_API = 'https://api.spotify.com/v1';
const SPOTIFY_ACCOUNTS = 'https://accounts.spotify.com';

export function getSpotifyAuthUrl(state: string): string {
  const clientId = process.env.SPOTIFY_CLIENT_ID!;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/social/callback/spotify`;

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    state,
    scope: ['user-read-private', 'user-read-email', 'user-top-read', 'user-follow-read'].join(' '),
  });

  return `${SPOTIFY_ACCOUNTS}/authorize?${params.toString()}`;
}

export async function exchangeSpotifyCode(code: string): Promise<OAuthTokens> {
  const clientId = process.env.SPOTIFY_CLIENT_ID!;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET!;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/social/callback/spotify`;

  const tokenRes = await fetch(`${SPOTIFY_ACCOUNTS}/api/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    throw new Error(`Spotify token exchange failed: ${err}`);
  }

  const tokens = await tokenRes.json();

  const profileRes = await fetch(`${SPOTIFY_API}/me`, {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  const profile = await profileRes.json();

  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token ?? null,
    expiresAt: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null,
    platformUserId: profile.id,
    platformUsername: profile.id,
    profileData: {
      name: profile.display_name || profile.id,
      avatar: profile.images?.[0]?.url ?? null,
      url: profile.external_urls?.spotify ?? `https://open.spotify.com/user/${profile.id}`,
      displayName: profile.display_name,
    },
  };
}

export async function refreshSpotifyToken(refreshToken: string): Promise<RefreshedTokens> {
  const clientId = process.env.SPOTIFY_CLIENT_ID!;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET!;

  const res = await fetch(`${SPOTIFY_ACCOUNTS}/api/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  if (!res.ok) throw new Error('Failed to refresh Spotify token');

  const data = await res.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? refreshToken,
    expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : null,
  };
}

export async function fetchSpotifyStats(
  accessToken: string,
  artistId?: string
): Promise<PlatformFetchResult> {
  const headers = { Authorization: `Bearer ${accessToken}` };

  const profileRes = await fetch(`${SPOTIFY_API}/me`, { headers });

  const profile = await profileRes.json();

  let followers = profile.followers?.total ?? 0;
  let popularity = 0;
  let topTracks: SpotifyTrack[] = [];

  const mapTrack = (t: {
    id: string;
    name: string;
    popularity: number;
    preview_url: string | null;
    external_urls: { spotify: string };
    album: { name: string; images: { url: string }[] };
  }): SpotifyTrack => ({
    id: t.id,
    name: t.name,
    popularity: t.popularity,
    previewUrl: t.preview_url,
    externalUrl: t.external_urls.spotify,
    albumName: t.album.name,
    albumImageUrl: t.album.images?.[0]?.url ?? null,
  });

  let artistResolved = false;

  if (artistId) {
    const artistRes = await fetch(`${SPOTIFY_API}/artists/${artistId}`, { headers });
    if (artistRes.ok) {
      artistResolved = true;
      const artist = await artistRes.json();
      followers = artist.followers?.total ?? followers;
      popularity = artist.popularity ?? 0;

      for (const market of ['MX', 'US', 'ES']) {
        const tracksRes = await fetch(
          `${SPOTIFY_API}/artists/${artistId}/top-tracks?market=${market}`,
          { headers }
        );
        if (tracksRes.ok) {
          const tracksData = await tracksRes.json();
          topTracks = (tracksData.tracks ?? []).slice(0, 5).map(mapTrack);
          if (topTracks.length > 0) break;
        }
      }
    } else {
    }
  }

  if (!artistResolved) {
    return {
      followers: 0,
      metrics: {
        spotify: {
          popularity: 0,
          topTracks: [],
          needsArtistUrl: true,
        },
      },
      profileData: {
        name: profile.display_name || profile.id,
        avatar: profile.images?.[0]?.url ?? null,
        url: profile.external_urls?.spotify ?? `https://open.spotify.com/user/${profile.id}`,
      },
    };
  }

  return {
    followers,
    metrics: {
      spotify: {
        popularity,
        topTracks,
      },
    },
    profileData: {
      name: profile.display_name || profile.id,
      avatar: profile.images?.[0]?.url ?? null,
      url: profile.external_urls?.spotify ?? `https://open.spotify.com/user/${profile.id}`,
    },
  };
}
