import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    // Extract file ID from various Google Drive URL formats
    let fileId: string | null = null;

    // Format: drive.google.com/file/d/FILE_ID/...
    const fileMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileMatch) {
      fileId = fileMatch[1];
    }

    // Format: drive.google.com/uc?export=download&id=FILE_ID (only if not found above)
    if (!fileId) {
      const ucMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (ucMatch) {
        fileId = ucMatch[1];
      }
    }

    // Also try to extract from any URL with id parameter
    if (!fileId) {
      try {
        const idParam = new URL(url).searchParams.get('id');
        if (idParam) {
          fileId = idParam;
        }
      } catch {
        // URL parsing failed, continue
      }
    }

    if (!fileId) {
      return NextResponse.json(
        { error: 'Invalid Google Drive URL - could not extract file ID' },
        { status: 400 }
      );
    }

    // Try multiple download methods
    const userAgent =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

    // Method 1: Direct download with confirm=t (bypass virus scan)
    const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`;

    let response = await fetch(downloadUrl, {
      headers: {
        'User-Agent': userAgent,
        Accept: '*/*',
      },
      redirect: 'follow',
    });

    // Check if we got HTML (need to extract confirm token)
    let contentType = response.headers.get('content-type') || '';

    if (contentType.includes('text/html')) {
      const html = await response.text();

      // Try to find various confirm patterns
      const patterns = [
        /confirm=([a-zA-Z0-9_-]+)/,
        /download_warning[^"]*confirm=([^&"]+)/,
        /id="uc-download-link"[^>]*href="[^"]*confirm=([^&"]+)/,
        /name="confirm"[^>]*value="([^"]+)"/,
      ];

      let confirmToken = null;
      for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match) {
          confirmToken = match[1];
          break;
        }
      }

      if (confirmToken) {
        const confirmUrl = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=${confirmToken}`;

        response = await fetch(confirmUrl, {
          headers: {
            'User-Agent': userAgent,
            Accept: '*/*',
          },
          redirect: 'follow',
        });

        contentType = response.headers.get('content-type') || '';
      }

      // If still HTML, try the direct download link format
      if (contentType.includes('text/html')) {
        const directUrl = `https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=t`;

        response = await fetch(directUrl, {
          headers: {
            'User-Agent': userAgent,
            Accept: '*/*',
          },
          redirect: 'follow',
        });

        contentType = response.headers.get('content-type') || '';
      }
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch video: ${response.status}` },
        { status: response.status }
      );
    }

    // Final check - if still HTML, we failed
    if (contentType.includes('text/html')) {
      return NextResponse.json(
        {
          error:
            'Could not download video - file may require authentication or is not publicly accessible',
        },
        { status: 400 }
      );
    }

    // Stream the video response
    const videoData = await response.arrayBuffer();

    return new NextResponse(videoData, {
      headers: {
        'Content-Type': contentType || 'video/mp4',
        'Content-Length': videoData.byteLength.toString(),
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const maxDuration = 60;
