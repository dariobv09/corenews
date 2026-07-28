export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string[] }> }
) {
  try {
    const rawParams = await params;
    const filenameArray = rawParams?.filename || [];
    const fullFilename = filenameArray.join('/');

    if (!fullFilename) {
      return new Response('Filename missing', { status: 400 });
    }

    // Strip any query string if present
    const cleanFilename = fullFilename.split('?')[0];
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bnywcdwwqdcyztqguios.supabase.co';
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/tiktok-carousel/${cleanFilename}`;

    console.log(`[ProxyImage] Proxying request for: ${cleanFilename} -> ${publicUrl}`);

    const res = await fetch(publicUrl);
    if (!res.ok) {
      console.error(`[ProxyImage] Supabase fetch returned HTTP ${res.status} for ${publicUrl}`);
      return new Response('Image Not Found', { status: 404 });
    }

    const arrayBuffer = await res.arrayBuffer();
    return new Response(arrayBuffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=43200'
      }
    });
  } catch (err: any) {
    console.error(`[ProxyImage] Exception proxying image:`, err);
    return new Response('Internal Error', { status: 500 });
  }
}
