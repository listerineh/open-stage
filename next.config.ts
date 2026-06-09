import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  // Exclude heavy WASM modules from server-side bundling
  serverExternalPackages: [
    '@ffmpeg/ffmpeg',
    '@ffmpeg/util',
    '@transcribe/transcriber',
    '@transcribe/shout',
  ],
};

export default nextConfig;
