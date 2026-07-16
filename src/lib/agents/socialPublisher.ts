import { Categoria, Noticia, CarouselSlide } from '@/types';
import { isSupabaseConfigured, supabaseAdmin } from '../supabase';
import { mockStore } from '../mockStore';
import { getBgImageForNews } from './mediaScraper';
import { createNewsSlide } from './sharpDesigner';
import fs from 'fs';
import path from 'path';

/**
 * Ensures that the Supabase storage bucket exists and is public
 */
async function ensureStorageBucket(log?: (m: string) => void): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabaseAdmin) return false;
  try {
    const bucketName = 'tiktok-carousel';
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
    if (listError) throw listError;

    const exists = buckets.some((b) => b.name === bucketName);
    if (!exists) {
      log?.(`[SocialPublisher] Creando el bucket público 'tiktok-carousel' en Supabase Storage...`);
      const { error: createError } = await supabaseAdmin.storage.createBucket(bucketName, {
        public: true,
        allowedMimeTypes: ['image/jpeg'],
        fileSizeLimit: 6291456 // 6MB
      });
      if (createError) throw createError;
      log?.(`[SocialPublisher] ✓ Bucket 'tiktok-carousel' creado con éxito.`);
    }
    return true;
  } catch (err: any) {
    log?.(`[SocialPublisher] ⚠ Error al asegurar el bucket de almacenamiento: ${err.message || err}`);
    return false;
  }
}

/**
 * Uploads a slide image to Supabase Storage or saves it locally as fallback
 */
async function saveSlideImage(
  noticia: Noticia,
  todayStr: string,
  buffer: Buffer,
  log?: (m: string) => void
): Promise<string | null> {
  const fileName = `slide_${noticia.categoria}_${noticia.id}_${todayStr}.jpg`;

  if (isSupabaseConfigured() && supabaseAdmin) {
    try {
      log?.(`[SocialPublisher] Subiendo imagen a Supabase Storage: ${fileName}...`);
      const { error } = await supabaseAdmin.storage
        .from('tiktok-carousel')
        .upload(fileName, buffer, {
          contentType: 'image/jpeg',
          upsert: true
        });
      if (error) throw error;

      const { data: { publicUrl } } = supabaseAdmin.storage
        .from('tiktok-carousel')
        .getPublicUrl(fileName);

      log?.(`[SocialPublisher] ✓ Subida exitosa. URL: ${publicUrl}`);
      return publicUrl;
    } catch (err: any) {
      log?.(`[SocialPublisher] ❌ Error subiendo a Supabase: ${err.message || err}. Usando fallback local...`);
    }
  }

  // Local fallback save
  try {
    const localDir = path.join(process.cwd(), 'public', 'carousel');
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    const localPath = path.join(localDir, fileName);
    fs.writeFileSync(localPath, buffer);
    const localUrl = `/carousel/${fileName}`;
    log?.(`[SocialPublisher] ✓ Imagen guardada en almacenamiento local del servidor: ${localUrl}`);
    return localUrl;
  } catch (err: any) {
    log?.(`[SocialPublisher] ❌ Error guardando imagen localmente: ${err.message || err}`);
    return null;
  }
}

/**
 * Registers the slide in the database (Supabase or mockStore)
 */
async function registerSlideInDatabase(
  noticia: Noticia,
  imageUrl: string,
  log?: (m: string) => void
): Promise<boolean> {
  if (isSupabaseConfigured() && supabaseAdmin) {
    try {
      log?.(`[SocialPublisher] Registrando slide en la tabla 'carousel_slides' de Supabase...`);
      
      // Delete existing slide for this news to avoid duplicates if re-run
      await supabaseAdmin
        .from('carousel_slides')
        .delete()
        .eq('noticia_id', noticia.id);

      const { error } = await supabaseAdmin.from('carousel_slides').insert({
        noticia_id: noticia.id,
        categoria: noticia.categoria,
        slide_order: 0,
        image_url: imageUrl
      });

      if (error) throw error;
      log?.(`[SocialPublisher] ✓ Slide registrado correctamente en Supabase.`);
      return true;
    } catch (err: any) {
      log?.(`[SocialPublisher] ❌ Error al registrar en Supabase: ${err.message || err}. Usando fallback local...`);
    }
  }

  // Local fallback save
  try {
    // Delete existing slide in local store
    const existing = mockStore.getCarouselSlides().filter((s) => s.noticia_id === noticia.id);
    if (existing.length > 0) {
      // Clean old slides
      const thresholdTime = Date.now() - 5 * 24 * 60 * 60 * 1000;
      mockStore.deleteOldCarouselSlides(thresholdTime);
    }
    
    mockStore.addCarouselSlide({
      noticia_id: noticia.id,
      categoria: noticia.categoria,
      slide_order: 0,
      image_url: imageUrl
    });
    log?.(`[SocialPublisher] ✓ Slide registrado en mockStore local.`);
    return true;
  } catch (err: any) {
    log?.(`[SocialPublisher] ❌ Error al registrar localmente: ${err.message || err}`);
    return false;
  }
}

/**
 * Posts to TikTok draft API if token is configured (Optional API Integration)
 */
async function postToTikTokDraft(
  title: string,
  imageUrl: string,
  log?: (msg: string, type?: 'info' | 'warning' | 'success' | 'error') => void
): Promise<boolean> {
  const token = process.env.TIKTOK_ACCESS_TOKEN;
  if (!token) {
    return true; // Silent skip
  }

  try {
    log?.(`[SocialPublisher] Enviando borrador de imagen a TikTok API...`, 'info');
    const res = await fetch('https://open.tiktokapis.com/v2/post/publish/content/init/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        post_info: {
          title: title,
          description: `${title} #corenews #sinclickbait #inteligencia`,
          privacy_level: 'MUTUAL_FOLLOWS_FRIENDS',
          disable_comment: false
        },
        media_info: {
          media_type: 'PHOTO',
          image_urls: [imageUrl],
          post_mode: 'MEDIA_UPLOAD'
        }
      })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(`TikTok API responded with status ${res.status}: ${JSON.stringify(data)}`);
    }

    log?.(`[SocialPublisher] ✓ TikTok aceptó el borrador de la noticia: ${noticiaTitleTruncated(title)}`, 'success');
    return true;
  } catch (err: any) {
    log?.(`[SocialPublisher] ❌ Error en el conector de TikTok: ${err.message || err}`, 'error');
    return false;
  }
}

function noticiaTitleTruncated(title: string): string {
  return title.length > 30 ? title.substring(0, 30) + '...' : title;
}

/**
 * Main entry point called by the Coordinator
 */
export async function publishTikTokCarousels(
  log: (msg: string, type?: 'info' | 'warning' | 'success' | 'error') => void
): Promise<{ success: boolean; error?: string }> {
  log('[SocialPublisher] Iniciando pipeline de imágenes individuales por noticia para TikTok...', 'info');

  const todayStr = new Date().toISOString().split('T')[0];
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  let noticias: Noticia[] = [];

  // 1. Fetch news from today (last 24 hours)
  if (isSupabaseConfigured() && supabaseAdmin) {
    try {
      log(`[SocialPublisher] Recuperando noticias de las últimas 24 horas de Supabase...`, 'info');
      const { data, error } = await supabaseAdmin
        .from('noticias')
        .select('*, fuentes(*)')
        .gte('fecha_actualizacion', oneDayAgo);
      if (error) throw error;
      noticias = (data || []) as Noticia[];
    } catch (err: any) {
      log(`[SocialPublisher] ⚠ Error al leer de Supabase: ${err.message || err}. Usando fallback local.`, 'warning');
      noticias = mockStore.getNoticias().filter(n => new Date(n.fecha_actualizacion).getTime() >= new Date(oneDayAgo).getTime());
    }
  } else {
    log('[SocialPublisher] Usando mockStore local...', 'info');
    noticias = mockStore.getNoticias().filter(n => new Date(n.fecha_actualizacion).getTime() >= new Date(oneDayAgo).getTime());
  }

  if (noticias.length === 0) {
    log('[SocialPublisher] No se encontraron noticias recientes publicadas hoy. Finalizando.', 'warning');
    return { success: true };
  }

  log(`[SocialPublisher] Encontradas ${noticias.length} noticias recientes para procesar.`, 'info');

  // Asegurar bucket de almacenamiento
  await ensureStorageBucket((m) => log(m, 'info'));

  // 2. Process all news in parallel to optimize execution time and avoid serverless timeouts
  const promises = noticias.map(async (noticia) => {
    try {
      log(`[SocialPublisher] Procesando noticia: "${noticiaTitleTruncated(noticia.titulo)}"`, 'info');

      // Step A: Generate/Scrape Background Image
      const bgBuffer = await getBgImageForNews(noticia, (m) => log(m, 'info'));

      // Step B: Composite Overlay and Title with Sharp
      const slideBuffer = await createNewsSlide(noticia, bgBuffer, (m) => log(m, 'info'));

      // Step C: Save (Upload to Supabase Storage or save local)
      const imageUrl = await saveSlideImage(noticia, todayStr, slideBuffer, (m) => log(m, 'info'));
      if (!imageUrl) {
        throw new Error('No se pudo guardar la imagen de la diapositiva.');
      }

      // Step D: Register in DB (Supabase or mockStore)
      await registerSlideInDatabase(noticia, imageUrl, (m) => log(m, 'info'));

      // Step E: Send to TikTok draft (optional, if configured)
      await postToTikTokDraft(noticia.titulo, imageUrl, log);

      log(`[SocialPublisher] ✓ Diapositiva completada con éxito para: "${noticiaTitleTruncated(noticia.titulo)}"`, 'success');
    } catch (err: any) {
      log(`[SocialPublisher] ❌ Error procesando noticia "${noticiaTitleTruncated(noticia.titulo)}": ${err.message || err}`, 'error');
    }
  });

  await Promise.all(promises);

  log('[SocialPublisher] ✓ Finalizada la generación de diapositivas de noticias.', 'success');
  return { success: true };
}
