import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Providers } from '@/components/providers';
import { CookieConsentProvider } from '@/components/providers/cookie-consent-provider';
import { OrganizationJsonLd, WebsiteJsonLd } from '@/components/seo';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import '@/lib/tour/shepherd-theme.css';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
});

const siteConfig = {
  name: 'OpenStage',
  description:
    'Plataforma open source para músicos. Genera clips virales, gestiona contenido y crece en redes sociales. Herramientas gratuitas para bandas.',
  url: 'https://openstage.online',
  ogImage: 'https://openstage.online/og-image.png',
  creator: '@listerineh',
  keywords: [
    'clips virales',
    'músicos',
    'bandas',
    'contenido para redes sociales',
    'generador de clips',
    'TikTok',
    'Instagram Reels',
    'YouTube Shorts',
    'open source',
    'Ecuador',
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: '/',
  },
  title: {
    default: `${siteConfig.name} - Plataforma para músicos`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: 'listerineh', url: 'https://listerineh.dev' }],
  creator: siteConfig.creator,
  openGraph: {
    type: 'website',
    locale: 'es_EC',
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: 'OpenStage - Plataforma para músicos',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: siteConfig.creator,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}>
      <head>
        <OrganizationJsonLd />
        <WebsiteJsonLd />
      </head>
      <body className="min-h-full flex flex-col bg-zinc-950 font-sans">
        <Providers>{children}</Providers>
        <CookieConsentProvider />
      </body>
      <Analytics />
    </html>
  );
}
