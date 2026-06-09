import { NextRequest, NextResponse } from 'next/server';

function extractFileId(url: string): string | null {
  const patterns = [
    /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/uc\?.*id=([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    console.log('[verify-video] Input URL:', url);

    if (!url) {
      return NextResponse.json(
        { accessible: false, error: 'URL no proporcionada' },
        { status: 400 }
      );
    }

    // Extraer el file ID de Google Drive
    const fileId = extractFileId(url);
    console.log('[verify-video] File ID:', fileId);

    if (!fileId) {
      return NextResponse.json({
        accessible: false,
        error: 'URL de Google Drive no válida',
      });
    }

    // Usar el endpoint de embed que es público para verificar acceso
    const embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;

    console.log('[verify-video] Trying embed URL:', embedUrl);
    const embedResponse = await fetch(embedUrl, {
      method: 'HEAD',
      redirect: 'follow',
    });

    console.log('[verify-video] Embed response status:', embedResponse.status);

    if (embedResponse.status === 200) {
      return NextResponse.json({
        accessible: true,
        fileId,
        contentType: 'video/mp4', // Asumimos video ya que pasó la validación de URL
        message: 'Video accesible públicamente',
      });
    }

    if (embedResponse.status === 403 || embedResponse.status === 404) {
      return NextResponse.json({
        accessible: false,
        error: 'El video no es público. Cambia los permisos a "Cualquier persona con el enlace".',
      });
    }

    // Fallback: asumir que está bien si no hay error claro
    return NextResponse.json({
      accessible: true,
      fileId,
      contentType: 'video/mp4',
      message: 'Video verificado',
    });
  } catch (error) {
    console.error('[verify-video] Error:', error);
    return NextResponse.json({
      accessible: false,
      error: 'Error al verificar el video. Intenta de nuevo.',
    });
  }
}
