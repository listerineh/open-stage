import type { OAuthTokens, PlatformFetchResult, RefreshedTokens } from './types';

const META_GRAPH = 'https://graph.facebook.com/v21.0';
const META_OAUTH = 'https://www.facebook.com/v21.0/dialog/oauth';
const META_TOKEN = 'https://graph.facebook.com/v21.0/oauth/access_token';

export function getInstagramAuthUrl(state: string): string {
  const appId = process.env.META_APP_ID!;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/social/callback/instagram`;

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    scope: 'instagram_basic,instagram_manage_insights,pages_show_list,pages_read_engagement',
    response_type: 'code',
    state,
  });

  return `${META_OAUTH}?${params.toString()}`;
}

export async function exchangeInstagramCode(code: string): Promise<OAuthTokens> {
  const appId = process.env.META_APP_ID!;
  const appSecret = process.env.META_APP_SECRET!;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/social/callback/instagram`;

  const tokenRes = await fetch(META_TOKEN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      redirect_uri: redirectUri,
      code,
    }),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    throw new Error(`Instagram token exchange failed: ${err}`);
  }

  const tokens = await tokenRes.json();
  const shortLivedToken = tokens.access_token;

  const longLivedRes = await fetch(
    `${META_GRAPH}/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortLivedToken}`
  );
  const longLived = longLivedRes.ok ? await longLivedRes.json() : tokens;
  const accessToken = longLived.access_token ?? shortLivedToken;

  const pagesRes = await fetch(`${META_GRAPH}/me/accounts?access_token=${accessToken}`);
  const pagesData = await pagesRes.json();
  const page = pagesData.data?.[0];

  if (!page) {
    throw new Error('No Facebook Page found. Instagram requires a linked Facebook Page.');
  }

  const igRes = await fetch(
    `${META_GRAPH}/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`
  );
  const igData = await igRes.json();
  const igUserId = igData.instagram_business_account?.id;

  if (!igUserId) {
    throw new Error('No Instagram Business account linked to this Facebook Page.');
  }

  const profileRes = await fetch(
    `${META_GRAPH}/${igUserId}?fields=id,username,name,profile_picture_url,followers_count&access_token=${page.access_token}`
  );
  const profile = await profileRes.json();

  return {
    accessToken: page.access_token,
    refreshToken: null,
    expiresAt: longLived.expires_in ? new Date(Date.now() + longLived.expires_in * 1000) : null,
    platformUserId: igUserId,
    platformUsername: profile.username ?? '',
    profileData: {
      name: profile.name ?? profile.username ?? '',
      avatar: profile.profile_picture_url ?? null,
      url: profile.username
        ? `https://www.instagram.com/${profile.username}`
        : 'https://instagram.com',
      displayName: profile.name,
    },
  };
}

export async function refreshInstagramToken(accessToken: string): Promise<RefreshedTokens> {
  const appSecret = process.env.META_APP_SECRET!;

  const res = await fetch(
    `${META_GRAPH}/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.META_APP_ID}&client_secret=${appSecret}&fb_exchange_token=${accessToken}`
  );

  if (!res.ok) throw new Error('Failed to refresh Instagram token');

  const data = await res.json();
  return {
    accessToken: data.access_token,
    refreshToken: null,
    expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : null,
  };
}

export async function fetchInstagramStats(
  accessToken: string,
  platformUserId: string
): Promise<PlatformFetchResult> {
  const profileRes = await fetch(
    `${META_GRAPH}/${platformUserId}?fields=id,username,name,profile_picture_url,followers_count,follows_count,media_count&access_token=${accessToken}`
  );

  if (!profileRes.ok) {
    throw new Error('Failed to fetch Instagram profile');
  }

  const profile = await profileRes.json();

  let reach: number | undefined;
  let impressions: number | undefined;

  const insightsRes = await fetch(
    `${META_GRAPH}/${platformUserId}/insights?metric=reach,impressions&period=day&access_token=${accessToken}`
  );

  if (insightsRes.ok) {
    const insightsData = await insightsRes.json();
    const reachMetric = insightsData.data?.find((m: { name: string }) => m.name === 'reach');
    const impressionsMetric = insightsData.data?.find(
      (m: { name: string }) => m.name === 'impressions'
    );
    const lastReach = reachMetric?.values?.slice(-1)[0];
    const lastImpressions = impressionsMetric?.values?.slice(-1)[0];
    reach = lastReach?.value;
    impressions = lastImpressions?.value;
  }

  return {
    followers: profile.followers_count ?? 0,
    metrics: {
      instagram: {
        following: profile.follows_count ?? 0,
        mediaCount: profile.media_count ?? 0,
        reach,
        impressions,
      },
    },
    profileData: {
      name: profile.name ?? profile.username ?? '',
      avatar: profile.profile_picture_url ?? null,
      url: profile.username
        ? `https://www.instagram.com/${profile.username}`
        : 'https://instagram.com',
      displayName: profile.name,
    },
  };
}
