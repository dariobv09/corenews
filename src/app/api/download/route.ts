import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return NextResponse.json({ error: 'Falta el parámetro url' }, { status: 400 });
    }

    // Download the target image from Supabase Storage or external CDN
    const imageRes = await fetch(imageUrl);

    if (!imageRes.ok) {
      return NextResponse.json(
        { error: `No se pudo descargar la imagen. Status: ${imageRes.status}` },
        { status: imageRes.status }
      );
    }

    const arrayBuffer = await imageRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract filename or fallback
    const urlParts = imageUrl.split('/');
    const rawFileName = urlParts[urlParts.length - 1] || 'noticia-corenews.jpg';
    const cleanFileName = rawFileName.endsWith('.jpg') || rawFileName.endsWith('.jpeg')
      ? rawFileName
      : `${rawFileName}.jpg`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="${cleanFileName}"`,
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (err: any) {
    console.error('[ApiDownload] Error respondiendo descarga proxy:', err);
    return NextResponse.json({ error: err.message || 'Error interno al procesar la descarga.' }, { status: 500 });
  }
}
