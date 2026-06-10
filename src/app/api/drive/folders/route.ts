import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get('drive_access_token')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'No access token' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const parentId = searchParams.get('parentId') || 'root';

  try {
    // List folders in Drive
    const query =
      parentId === 'root'
        ? "mimeType='application/vnd.google-apps.folder' and 'root' in parents and trashed=false"
        : `mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`;

    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType)&orderBy=name`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Drive API error:', error);
      return NextResponse.json({ error: 'Failed to list folders' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('Error listing folders:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// Create a new folder in Drive
export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get('drive_access_token')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'No access token' }, { status: 401 });
  }

  try {
    const { name, parentId } = await request.json();

    const metadata = {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentId ? [parentId] : undefined,
    };

    const response = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Drive API error:', error);
      return NextResponse.json({ error: 'Failed to create folder' }, { status: response.status });
    }

    const folder = await response.json();
    return NextResponse.json(folder);
  } catch (err) {
    console.error('Error creating folder:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
