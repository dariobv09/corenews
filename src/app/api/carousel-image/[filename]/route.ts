import { isSupabaseConfigured, supabaseAdmin } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

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
        console.error(`Supabase storage download error for ${filename}:`, error);
      } else if (data) {
        const buffer = Buffer.from(await data.arrayBuffer());
        return new Response(buffer, {
          headers: {
            'Content-Type': 'image/jpeg',
            'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=43200'
          }
        });
      }
    } catch (err) {
      console.error(`Exception downloading from Supabase storage in proxy for ${filename}:`, err);
    }
  }

  // Local fallback
  try {
    const filePath = path.join(process.cwd(), 'public', 'carousel', filename);
    if (fs.existsSync(filePath)) {
      const buffer = fs.readFileSync(filePath);
      return new Response(buffer, {
        headers: {
          'Content-Type': 'image/jpeg',
          'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=43200'
        }
      });
    }
  } catch (err) {
    console.error(`Exception reading local file in proxy for ${filename}:`, err);
  }

  return new Response('Not Found', { status: 404 });
}
