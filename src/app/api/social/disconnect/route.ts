import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { SocialPlatform } from '@/types/database';

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { bandId, platform } = await request.json();

  if (!bandId || !platform) {
    return NextResponse.json({ error: 'Missing bandId or platform' }, { status: 400 });
  }

  const { data: member } = await supabase
    .from('band_members')
    .select('role')
    .eq('band_id', bandId)
    .eq('user_id', user.id)
    .single();

  if (!member || member.role !== 'admin') {
    return NextResponse.json({ error: 'Only admins can disconnect platforms' }, { status: 403 });
  }

  const { error } = await supabase
    .from('social_connections')
    .delete()
    .eq('band_id', bandId)
    .eq('platform', platform as SocialPlatform);

  if (error) {
    console.error('Error disconnecting platform:', error);
    return NextResponse.json({ error: 'Failed to disconnect platform' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
