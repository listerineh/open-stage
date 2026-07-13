import type { SocialPlatform, SocialMetrics, SocialProfileData } from '@/types/database';

export interface PlatformConfig {
  id: SocialPlatform;
  name: string;
  color: string;
  bgColor: string;
  hoverBgColor: string;
  borderColor: string;
  isBeta: boolean;
  betaNote?: string;
}

export const PLATFORM_CONFIGS: Record<SocialPlatform, PlatformConfig> = {
  spotify: {
    id: 'spotify',
    name: 'Spotify',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    hoverBgColor: 'hover:bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    isBeta: false,
  },
  youtube: {
    id: 'youtube',
    name: 'YouTube',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    hoverBgColor: 'hover:bg-red-500/10',
    borderColor: 'border-red-500/20',
    isBeta: false,
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10',
    hoverBgColor: 'hover:bg-pink-500/10',
    borderColor: 'border-pink-500/20',
    isBeta: true,
    betaNote: 'Requiere cuenta Business/Creator de Instagram',
  },
  tiktok: {
    id: 'tiktok',
    name: 'TikTok',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    hoverBgColor: 'hover:bg-cyan-500/10',
    borderColor: 'border-cyan-500/20',
    isBeta: true,
    betaNote: 'Requiere aprobación de app en TikTok for Developers',
  },
};

export interface OAuthTokens {
  accessToken: string;
  refreshToken: string | null;
  expiresAt: Date | null;
  platformUserId: string;
  platformUsername: string;
  profileData: SocialProfileData;
}

export interface PlatformFetchResult {
  followers: number;
  metrics: SocialMetrics;
  profileData: SocialProfileData;
}

export interface RefreshedTokens {
  accessToken: string;
  refreshToken: string | null;
  expiresAt: Date | null;
}
