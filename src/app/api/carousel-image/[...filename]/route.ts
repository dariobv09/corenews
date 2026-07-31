import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getBgImageForNews } from '@/lib/agents/mediaScraper';
import { createNewsSlide } from '@/lib/agents/sharpDesigner';
import { saveSlideImage, registerSlideInDatabase } from '@/lib/agents/socialPublisher';

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

    const cleanFilename = fullFilename.split('?')[0];
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bnywcdwwqdcyztqguios.supabase.co';
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/tiktok-carousel/${cleanFilename}`;

    // 1. Try to fetch existing image from Supabase CDN
    const res = await fetch(publicUrl);
    if (res.ok) {
      const arrayBuffer = await res.arrayBuffer();
      return new Response(arrayBuffer, {
        headers: {
          'Content-Type': 'image/jpeg',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=43200'
        }
      });
    }

    // 2. Self-Healing Fallback: If image is missing, attempt auto-generation using noticia ID from filename
    console.log(`[ProxyImage] Image missing in storage: ${cleanFilename}. Attempting auto-generation...`);
    const match = cleanFilename.match(/slide_[^_]+_([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
    
    if (match && match[1] && supabaseAdmin) {
      const noticiaId = match[1];
      const { data: noticia } = await supabaseAdmin
        .from('noticias')
        .select('*')
        .eq('id', noticiaId)
        .maybeSingle();

      if (noticia) {
        console.log(`[ProxyImage] Auto-generating slide for noticia: "${noticia.titulo}"`);
        const todayStr = new Date().toISOString().split('T')[0];
        const bgBuffer = await getBgImageForNews(noticia);
        const slideBuffer = await createNewsSlide(noticia, bgBuffer);
        const cdnUrl = await saveSlideImage(noticia, todayStr, slideBuffer);

        if (cdnUrl) {
          await registerSlideInDatabase(noticia, cdnUrl);
        }

        return new Response(slideBuffer as unknown as BodyInit, {
          headers: {
            'Content-Type': 'image/jpeg',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=86400, s-maxage=86400'
          }
        });
      }
    }

    return new Response('Image Not Found', { status: 404 });
  } catch (err: any) {
    console.error(`[ProxyImage] Exception in image proxy:`, err);
    return new Response('Internal Server Error', { status: 500 });
  }
}
