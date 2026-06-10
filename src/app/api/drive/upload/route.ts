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
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const bandId = formData.get('bandId') as string;
    const clipName = formData.get('name') as string;
    const duration = parseInt(formData.get('duration') as string) || 0;
    const format = formData.get('format') as string;
    const aspectRatio = formData.get('aspectRatio') as string;

    if (!file || !bandId) {
      return NextResponse.json({ error: 'Missing file or bandId' }, { status: 400 });
    }

    // Get band info and verify user is member
    const { data: band, error: bandError } = await supabase
      .from('bands')
      .select('id, drive_folder_id, drive_folder_name')
      .eq('id', bandId)
      .single();

    if (bandError || !band) {
      return NextResponse.json({ error: 'Band not found' }, { status: 404 });
    }

    if (!band.drive_folder_id) {
      return NextResponse.json(
        { error: 'Google Drive not connected for this band' },
        { status: 400 }
      );
    }

    // Verify user is member of band
    const { data: member } = await supabase
      .from('band_members')
      .select('role')
      .eq('band_id', bandId)
      .eq('user_id', user.id)
      .single();

    if (!member) {
      return NextResponse.json({ error: 'Not a member of this band' }, { status: 403 });
    }

    // Get access token from cookie
    const accessToken = request.cookies.get('drive_access_token')?.value;
    const refreshToken = request.cookies.get('drive_refresh_token')?.value;

    let currentAccessToken = accessToken;

    // If no access token but we have refresh token, try to refresh
    if (!currentAccessToken && refreshToken) {
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_DRIVE_CLIENT_SECRET!,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (tokenResponse.ok) {
        const tokens = await tokenResponse.json();
        currentAccessToken = tokens.access_token;
      }
    }

    if (!currentAccessToken) {
      return NextResponse.json(
        { error: 'No valid Drive access token. Please reconnect Google Drive.' },
        { status: 401 }
      );
    }

    // Upload file to Google Drive
    const metadata = {
      name: clipName || file.name,
      parents: [band.drive_folder_id],
    };

    // Create multipart upload
    const boundary = '-------314159265358979323846';
    const delimiter = '\r\n--' + boundary + '\r\n';
    const closeDelimiter = '\r\n--' + boundary + '--';

    const fileBuffer = await file.arrayBuffer();
    const fileBytes = new Uint8Array(fileBuffer);

    const metadataString =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: ' +
      file.type +
      '\r\n\r\n';

    const metadataBytes = new TextEncoder().encode(metadataString);
    const closeBytes = new TextEncoder().encode(closeDelimiter);

    const body = new Uint8Array(metadataBytes.length + fileBytes.length + closeBytes.length);
    body.set(metadataBytes, 0);
    body.set(fileBytes, metadataBytes.length);
    body.set(closeBytes, metadataBytes.length + fileBytes.length);

    const uploadResponse = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink,thumbnailLink',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${currentAccessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: body,
      }
    );

    if (!uploadResponse.ok) {
      const error = await uploadResponse.text();
      console.error('Drive upload failed:', error);
      return NextResponse.json({ error: 'Failed to upload to Drive' }, { status: 500 });
    }

    const driveFile = await uploadResponse.json();

    // Save clip metadata to Supabase
    const { data: clip, error: clipError } = await supabase
      .from('clips')
      .insert({
        band_id: bandId,
        created_by: user.id,
        name: clipName || file.name,
        duration,
        format: format || 'unknown',
        aspect_ratio: aspectRatio || '9:16',
        drive_file_id: driveFile.id,
        drive_url: driveFile.webViewLink,
        thumbnail_url: driveFile.thumbnailLink,
      })
      .select()
      .single();

    if (clipError) {
      console.error('Error saving clip metadata:', clipError);
      // File was uploaded but metadata failed - still return success with drive info
      return NextResponse.json({
        success: true,
        driveFile,
        warning: 'Clip uploaded but metadata not saved',
      });
    }

    return NextResponse.json({
      success: true,
      clip,
      driveFile,
    });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
