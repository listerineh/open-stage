import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { DashboardTour } from '@/components/features/tours/dashboard-tour';
import { DashboardContent } from '@/components/features/dashboard/dashboard-content';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Panel de control de OpenStage para gestionar tu banda y contenido.',
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario';
  const firstName = fullName.split(' ')[0];

  return (
    <>
      <DashboardTour />
      <DashboardContent firstName={firstName} />
    </>
  );
}
