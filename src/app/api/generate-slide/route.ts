import { NextResponse } from 'next/server';
import { isSupabaseConfigured, supabaseAdmin } from '@/lib/supabase';
import { mockStore } from '@/lib/mockStore';
import { getBgImageForNews } from '@/lib/agents/mediaScraper';
import { createNewsSlide } from '@/lib/agents/sharpDesigner';
import { ensureStorageBucket, saveSlideImage, registerSlideInDatabase } from '@/lib/agents/socialPublisher';
import { Noticia } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { 
      noticia_id, 
      custom_prompt, 
      manual_text, 
      overlay_text, 
      regenerate 
    } = await request.json();

    let noticia: Noticia | null = null;
    const logs: string[] = [];
    const log = (msg: string) => {
      console.log(msg);
      logs.push(msg);
    };

    if (noticia_id) {
      if (isSupabaseConfigured() && supabaseAdmin) {
        const { data } = await supabaseAdmin
          .from('noticias')
          .select('*')
          .eq('id', noticia_id)
          .maybeSingle();
        noticia = data;
      } else {
        noticia = mockStore.getNoticias().find(n => n.id === noticia_id) || null;
      }
    }

    if (!noticia && manual_text) {
      noticia = {
        id: `manual_${Date.now()}`,
        categoria: 'ia',
        importancia: 'Alta',
        titulo: overlay_text || manual_text.substring(0, 60),
        subtitulo: manual_text.substring(0, 120),
        hecho_principal: manual_text,
        desarrollo: manual_text,
        actores: 'General',
        contexto: manual_text,
        datos_verificables: 'N/A',
        estado_actual: 'N/A',
        declaraciones: 'N/A',
        consecuencias: 'N/A',
        fecha_actualizacion: new Date().toISOString()
      };
    }

    if (!noticia) {
      return NextResponse.json({ error: 'No se ha especificado ninguna noticia válida o texto manual.' }, { status: 400 });
    }

    log(`[ApiGenerate] Iniciando generación de slide para: "${noticia.titulo}"`);
    const todayStr = new Date().toISOString().split('T')[0];

    // Ensure bucket exists
    await ensureStorageBucket(log);

    // 1. Generate visual background using custom_prompt or auto prompt
    const bgBuffer = await getBgImageForNews(noticia, log, custom_prompt);

    // 2. Compose vertical 9:16 slide with text overlay
    const slideBuffer = await createNewsSlide(noticia, bgBuffer, log);

    // 3. Upload to Supabase Storage
    const imageUrl = await saveSlideImage(noticia, todayStr, slideBuffer, log);
    if (!imageUrl) {
      throw new Error('No se pudo guardar la imagen de la diapositiva en el CDN.');
    }

    // 4. Register in DB if real noticia_id exists
    if (noticia.id && !noticia.id.startsWith('manual_')) {
      await registerSlideInDatabase(noticia, imageUrl, log);
    }

    return NextResponse.json({
      success: true,
      imageUrl,
      slide: {
        id: noticia.id,
        noticia_id: noticia.id,
        categoria: noticia.categoria,
        slide_order: 0,
        image_url: imageUrl,
        created_at: new Date().toISOString(),
        noticia
      },
      logs
    });

  } catch (err: any) {
    console.error('Error generating slide:', err);
    return NextResponse.json({ error: err.message || err }, { status: 500 });
  }
}
