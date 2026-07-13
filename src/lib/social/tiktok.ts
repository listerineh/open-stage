import type { OAuthTokens, PlatformFetchResult, RefreshedTokens } from './types';

const TIKTOK_AUTH = 'https://www.tiktok.com/v2/auth/authorize';
const TIKTOK_TOKEN = 'https://open.tiktokapis.com/v2/oauth/token/';
const TIKTOK_API = 'https://open.tiktokapis.com/v2';

export function getTikTokAuthUrl(state: string): string {
  const clientKey = process.env.TIKTOK_CLIENT_KEY!;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/social/callback/tiktok`;

  const params = new URLSearchParams({
    client_key: clientKey,
    scope: 'user.info.basic,user.info.stats',
    response_type: 'code',
    redirect_uri: redirectUri,
    state,
  });

  return `${TIKTOK_AUTH}?${params.toString()}`;
}

export async function exchangeTikTokCode(code: string): Promise<OAuthTokens> {
  const clientKey = process.env.TIKTOK_CLIENT_KEY!;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET!;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/social/callback/tiktok`;

  const tokenRes = await fetch(TIKTOK_TOKEN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_key: clientKey,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    throw new Error(`TikTok token exchange failed: ${err}`);
  }

  const tokens = await tokenRes.json();
  const accessToken = tokens.access_token;

  const profileRes = await fetch(
    `${TIKTOK_API}/user/info/?fields=open_id,union_id,avatar_url,display_name,follower_count,following_count,likes_count,video_count`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  const profileData = profileRes.ok ? await profileRes.json() : null;
  const user = profileData?.data?.user ?? {};

  return {
    accessToken,
    refreshToken: tokens.refresh_token ?? null,
    expiresAt: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null,
    platformUserId: user.open_id ?? '',
    platformUsername: user.display_name ?? '',
    profileData: {
      name: user.display_name ?? '',
      avatar: user.avatar_url ?? null,
      url: user.display_name
        ? `https://www.tiktok.com/@${user.display_name}`
        : 'https://tiktok.com',
      displayName: user.display_name,
    },
  };
}

export async function refreshTikTokToken(refreshToken: string): Promise<RefreshedTokens> {
  const clientKey = process.env.TIKTOK_CLIENT_KEY!;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET!;

  const res = await fetch(TIKTOK_TOKEN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_key: clientKey,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  if (!res.ok) throw new Error('Failed to refresh TikTok token');

  const data = await res.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? refreshToken,
    expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : null,
  };
}

export async function fetchTikTokStats(accessToken: string): Promise<PlatformFetchResult> {
  const res = await fetch(
    `${TIKTOK_API}/user/info/?fields=open_id,union_id,avatar_url,display_name,follower_count,following_count,likes_count,video_count`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!res.ok) {
    throw new Error('Failed to fetch TikTok user info');
  }

  const data = await res.json();
  const user = data?.data?.user ?? {};

  return {
    followers: user.follower_count ?? 0,
    metrics: {
      tiktok: {
        totalLikes: user.likes_count ?? 0,
        videoCount: user.video_count ?? 0,
      },
    },
    profileData: {
      name: user.display_name ?? '',
      avatar: user.avatar_url ?? null,
      url: user.display_name
        ? `https://www.tiktok.com/@${user.display_name}`
        : 'https://tiktok.com',
      displayName: user.display_name,
    },
  };
}
