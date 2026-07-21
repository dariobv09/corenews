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
    const { noticia_id, regenerate } = await request.json();
    if (!noticia_id) {
      return NextResponse.json({ error: 'Missing noticia_id' }, { status: 400 });
    }

    let noticia: Noticia | null = null;
    const logs: string[] = [];
    const log = (msg: string) => {
      console.log(msg);
      logs.push(msg);
    };

    if (isSupabaseConfigured() && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('noticias')
        .select('*')
        .eq('id', noticia_id)
        .maybeSingle();
      
      if (error) throw error;
      noticia = data;
    } else {
      noticia = mockStore.getNoticias().find(n => n.id === noticia_id) || null;
    }

    if (!noticia) {
      return NextResponse.json({ error: 'Noticia no encontrada' }, { status: 404 });
    }

    log(`[ApiGenerate] Iniciando generación de slide para: "${noticia.titulo}"`);

    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Check if slide already exists to prevent duplicate generation unless regenerate=true
    if (!regenerate) {
      let existingSlide = null;
      if (isSupabaseConfigured() && supabaseAdmin) {
        const { data } = await supabaseAdmin
          .from('carousel_slides')
          .select('*')
          .eq('noticia_id', noticia_id)
          .maybeSingle();
        existingSlide = data;
      } else {
        existingSlide = mockStore.getCarouselSlides().find(s => s.noticia_id === noticia_id);
      }

      if (existingSlide) {
        log(`[ApiGenerate] Slide ya existe para esta noticia. Omitiendo.`);
        return NextResponse.json({ success: true, slide: existingSlide, alreadyExists: true, logs });
      }
    }

    // Asegurar bucket de almacenamiento
    await ensureStorageBucket(log);

    // 2. Get background image (DALL-E 3 -> Wikimedia -> fallback)
    const bgBuffer = await getBgImageForNews(noticia, log);

    // 3. Compose slide image with text overlay
    const slideBuffer = await createNewsSlide(noticia, bgBuffer, log);

    // 4. Save/Upload slide
    const imageUrl = await saveSlideImage(noticia, todayStr, slideBuffer, log);
    if (!imageUrl) {
      throw new Error('No se pudo guardar la imagen de la diapositiva.');
    }

    // 5. Register slide in DB
    await registerSlideInDatabase(noticia, imageUrl, log);

    log(`[ApiGenerate] ✓ Slide generado y guardado correctamente.`);
    
    // Retrieve the newly created slide to return it
    let newSlide = null;
    if (isSupabaseConfigured() && supabaseAdmin) {
      const { data } = await supabaseAdmin
        .from('carousel_slides')
        .select('*')
        .eq('noticia_id', noticia_id)
        .maybeSingle();
      newSlide = data;
    } else {
      newSlide = mockStore.getCarouselSlides().find(s => s.noticia_id === noticia_id);
    }

    return NextResponse.json({
      success: true,
      slide: newSlide,
      logs
    });

  } catch (err: any) {
    console.error('Error generating slide:', err);
    return NextResponse.json({ error: err.message || err }, { status: 500 });
  }
}
