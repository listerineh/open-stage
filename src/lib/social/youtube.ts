import type { OAuthTokens, PlatformFetchResult, RefreshedTokens } from './types';
import type { YouTubeVideo } from '@/types/database';

const YOUTUBE_API = 'https://www.googleapis.com/youtube/v3';
const GOOGLE_ACCOUNTS = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN = 'https://oauth2.googleapis.com/token';

export function getYouTubeAuthUrl(state: string): string {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID!;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/social/callback/youtube`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: [
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/yt-analytics.readonly',
      'profile',
      'email',
    ].join(' '),
    state,
    access_type: 'offline',
    prompt: 'consent',
  });

  return `${GOOGLE_ACCOUNTS}?${params.toString()}`;
}

export async function exchangeYouTubeCode(code: string): Promise<OAuthTokens> {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET!;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/social/callback/youtube`;

  const tokenRes = await fetch(GOOGLE_TOKEN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    throw new Error(`YouTube token exchange failed: ${err}`);
  }

  const tokens = await tokenRes.json();

  const channelRes = await fetch(`${YOUTUBE_API}/channels?part=snippet,statistics&mine=true`, {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  const channelData = await channelRes.json();
  const channel = channelData.items?.[0];

  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token ?? null,
    expiresAt: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null,
    platformUserId: channel?.id ?? '',
    platformUsername: channel?.snippet?.customUrl ?? channel?.snippet?.title ?? '',
    profileData: {
      name: channel?.snippet?.title ?? '',
      avatar: channel?.snippet?.thumbnails?.default?.url ?? null,
      url: channel?.id ? `https://www.youtube.com/channel/${channel.id}` : 'https://youtube.com',
      displayName: channel?.snippet?.title,
    },
  };
}

export async function refreshYouTubeToken(refreshToken: string): Promise<RefreshedTokens> {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET!;

  const res = await fetch(GOOGLE_TOKEN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!res.ok) throw new Error('Failed to refresh YouTube token');

  const data = await res.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? refreshToken,
    expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : null,
  };
}

export async function fetchYouTubeStats(accessToken: string): Promise<PlatformFetchResult> {
  const headers = { Authorization: `Bearer ${accessToken}` };

  const channelRes = await fetch(`${YOUTUBE_API}/channels?part=snippet,statistics&mine=true`, {
    headers,
  });
  const channelData = await channelRes.json();
  const channel = channelData.items?.[0];

  if (!channel) {
    throw new Error('No YouTube channel found for this account');
  }

  const stats = channel.statistics ?? {};
  const subscriberCount = parseInt(stats.subscriberCount ?? '0', 10);
  const viewCount = parseInt(stats.viewCount ?? '0', 10);
  const videoCount = parseInt(stats.videoCount ?? '0', 10);

  const videosRes = await fetch(
    `${YOUTUBE_API}/search?part=snippet&channelId=${channel.id}&maxResults=5&order=date&type=video`,
    { headers }
  );
  const videosData = videosRes.ok ? await videosRes.json() : null;

  const videoIds = videosData?.items
    ?.map((v: { id: { videoId: string } }) => v.id.videoId)
    .join(',');

  let recentVideos: YouTubeVideo[] = [];

  if (videoIds) {
    const videoStatsRes = await fetch(
      `${YOUTUBE_API}/videos?part=snippet,statistics&id=${videoIds}`,
      { headers }
    );
    const videoStatsData = videoStatsRes.ok ? await videoStatsRes.json() : null;

    recentVideos = (videoStatsData?.items ?? []).map(
      (v: {
        id: string;
        snippet: {
          title: string;
          thumbnails: { medium?: { url: string }; default?: { url: string } };
          publishedAt: string;
        };
        statistics: { viewCount?: string; likeCount?: string };
      }) => ({
        id: v.id,
        title: v.snippet.title,
        thumbnailUrl: v.snippet.thumbnails?.medium?.url ?? v.snippet.thumbnails?.default?.url ?? '',
        viewCount: parseInt(v.statistics.viewCount ?? '0', 10),
        likeCount: parseInt(v.statistics.likeCount ?? '0', 10),
        publishedAt: v.snippet.publishedAt,
        url: `https://www.youtube.com/watch?v=${v.id}`,
      })
    );
  }

  return {
    followers: subscriberCount,
    metrics: {
      youtube: {
        totalViews: viewCount,
        videoCount,
        recentVideos,
      },
    },
    profileData: {
      name: channel.snippet?.title ?? '',
      avatar: channel.snippet?.thumbnails?.default?.url ?? null,
      url: `https://www.youtube.com/channel/${channel.id}`,
      displayName: channel.snippet?.title,
    },
  };
}
