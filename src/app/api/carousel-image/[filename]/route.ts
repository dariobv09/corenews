import { isSupabaseConfigured, supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;

  if (isSupabaseConfigured() && supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin.storage
        .from('tiktok-carousel')
        .download(filename);

      if (error) {
        console.error(`Proxy download error for ${filename}:`, error);
        return new Response('Not Found', { status: 404 });
      }

      const buffer = Buffer.from(await data.arrayBuffer());
      return new Response(buffer, {
        headers: {
          'Content-Type': 'image/jpeg',
          'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=43200'
        }
      });
    } catch (err: any) {
      console.error(`Exception in proxy for ${filename}:`, err);
      return new Response('Internal Server Error', { status: 500 });
    }
  }

  return new Response('Not Configured', { status: 500 });
}
