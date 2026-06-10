import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { bandId, folderId, folderName } = await request.json();

    if (!bandId || !folderId || !folderName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify user is admin of the band
    const { data: member } = await supabase
      .from('band_members')
      .select('role')
      .eq('band_id', bandId)
      .eq('user_id', user.id)
      .single();

    if (!member || member.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can connect Google Drive' }, { status: 403 });
    }

    // Update band with Drive folder info
    const { error } = await supabase
      .from('bands')
      .update({
        drive_folder_id: folderId,
        drive_folder_name: folderName,
        drive_connected_at: new Date().toISOString(),
        drive_connected_by: user.id,
      })
      .eq('id', bandId);

    if (error) {
      console.error('Error updating band:', error);
      return NextResponse.json({ error: 'Failed to save connection' }, { status: 500 });
    }

    // Clear the access token cookie (no longer needed)
    const response = NextResponse.json({ success: true });
    response.cookies.delete('drive_access_token');

    return response;
  } catch (err) {
    console.error('Error connecting Drive:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// Disconnect Google Drive from band
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { bandId } = await request.json();

    // Verify user is admin of the band
    const { data: member } = await supabase
      .from('band_members')
      .select('role')
      .eq('band_id', bandId)
      .eq('user_id', user.id)
      .single();

    if (!member || member.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can disconnect Google Drive' },
        { status: 403 }
      );
    }

    // Clear Drive connection
    const { error } = await supabase
      .from('bands')
      .update({
        drive_folder_id: null,
        drive_folder_name: null,
        drive_connected_at: null,
        drive_connected_by: null,
      })
      .eq('id', bandId);

    if (error) {
      console.error('Error updating band:', error);
      return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error disconnecting Drive:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
