export const env = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '',
    secretKey: process.env.SUPABASE_SECRET_KEY ?? '',
  },
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
    nodeEnv: process.env.NODE_ENV ?? 'development',
  },
  features: {
    enableSpotify: process.env.NEXT_PUBLIC_ENABLE_SPOTIFY === 'true',
    enableYouTube: process.env.NEXT_PUBLIC_ENABLE_YOUTUBE === 'true',
  },
} as const;

export type Env = typeof env;

export function validateEnv(): void {
  const required = [
    ['NEXT_PUBLIC_SUPABASE_URL', env.supabase.url],
    ['NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', env.supabase.publishableKey],
  ] as const;

  const missing = required.filter(([, value]) => !value).map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
