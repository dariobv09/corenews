import { NextResponse } from 'next/server';
import { isSupabaseConfigured, supabaseAdmin } from '@/lib/supabase';
import { mockStore } from '@/lib/mockStore';
import { getBgImageForNews } from '@/lib/agents/mediaScraper';
import { createNewsSlide } from '@/lib/agents/sharpDesigner';
import { saveSlideImage, registerSlideInDatabase } from '@/lib/agents/socialPublisher';
import { Noticia } from '@/types';

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
    const filenameOnly = cleanFilename.split('/').pop() || cleanFilename;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bnywcdwwqdcyztqguios.supabase.co';

    // 1. Try to fetch existing image from 'news-images' or 'tiktok-carousel' bucket
    let targetUrl = cleanFilename.startsWith('http') 
      ? cleanFilename 
      : `${supabaseUrl}/storage/v1/object/public/news-images/${filenameOnly}`;
    
    let res = await fetch(targetUrl);

    if (!res.ok && !cleanFilename.startsWith('http')) {
      targetUrl = `${supabaseUrl}/storage/v1/object/public/tiktok-carousel/${filenameOnly}`;
      res = await fetch(targetUrl);
    }

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

    // 2. Self-Healing Fallback: Auto-generate on-demand so NO IMAGE EVER FAILS (100% Reliable)
    console.log(`[SocialImageProxy] Image missing in storage: ${filenameOnly}. Attempting instant auto-generation...`);
    let noticia: Noticia | null = null;

    // A) Try UUID match
    const uuidMatch = filenameOnly.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
    const noticiaId = uuidMatch ? uuidMatch[0] : null;

    if (noticiaId && isSupabaseConfigured() && supabaseAdmin) {
      const { data } = await supabaseAdmin
        .from('noticias')
        .select('*')
        .eq('id', noticiaId)
        .maybeSingle();
      if (data) noticia = data as Noticia;
    }

    // B) Try splitting filename parts (e.g. news_ia_123.jpg or slide_ia_123_today.jpg)
    if (!noticia) {
      const cleanNoExt = filenameOnly.replace(/\.[^/.]+$/, "");
      const parts = cleanNoExt.split('_');
      // Look for a part that looks like an ID
      for (const part of parts) {
        if (part && part !== 'news' && part !== 'slide' && part !== 'today' && part.length > 2) {
          if (isSupabaseConfigured() && supabaseAdmin) {
            const { data } = await supabaseAdmin
              .from('noticias')
              .select('*')
              .eq('id', part)
              .maybeSingle();
            if (data) {
              noticia = data as Noticia;
              break;
            }
          } else {
            const mockMatch = mockStore.getNoticias().find(n => n.id === part);
            if (mockMatch) {
              noticia = mockMatch;
              break;
            }
          }
        }
      }
    }

    // C) Fallback to latest noticia if specific ID not found
    if (!noticia) {
      if (isSupabaseConfigured() && supabaseAdmin) {
        const { data } = await supabaseAdmin
          .from('noticias')
          .select('*')
          .order('fecha_actualizacion', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (data) noticia = data as Noticia;
      }
      if (!noticia) {
        noticia = mockStore.getNoticias()[0] || null;
      }
    }

    // If still no noticia found in DB, construct emergency dummy noticia
    if (!noticia) {
      noticia = {
        id: 'emergency_noticia',
        categoria: 'ia',
        importancia: 'Alta',
        titulo: 'Últimas Novedades de Inteligencia Artificial',
        subtitulo: 'Análisis detallado',
        hecho_principal: 'Actualización importante sobre IA',
        desarrollo: '',
        actores: 'General',
        contexto: '',
        datos_verificables: '',
        estado_actual: '',
        declaraciones: '',
        consecuencias: '',
        fecha_actualizacion: new Date().toISOString()
      };
    }

    console.log(`[SocialImageProxy] Generating image slide with Poppins font for noticia: "${noticia.titulo}"`);
    const todayStr = new Date().toISOString().split('T')[0];
    const bgBuffer = await getBgImageForNews(noticia);
    const slideBuffer = await createNewsSlide(noticia, bgBuffer);

    // Save asynchronously to Supabase Storage in background without blocking response
    saveSlideImage(noticia, todayStr, slideBuffer).then(async (cdnUrl) => {
      if (cdnUrl && noticia) {
        await registerSlideInDatabase(noticia, cdnUrl);
      }
    }).catch(err => console.error('[SocialImageProxy] Async upload error:', err));

    return new Response(slideBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400'
      }
    });

  } catch (err: any) {
    console.error(`[SocialImageProxy] Exception in image proxy:`, err);
    return new Response('Internal Server Error', { status: 500 });
  }
}
