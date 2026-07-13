import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Analytics Dashboard',
  description:
    'Visualiza métricas de Spotify, YouTube, Instagram y TikTok en un solo lugar. Gráficos de crecimiento, tendencias y métricas clave para tu banda.',
};

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
