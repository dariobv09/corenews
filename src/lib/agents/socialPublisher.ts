import OpenAI from 'openai';
import sharp from 'sharp';
import { Categoria, Noticia } from '@/types';
import { isSupabaseConfigured, supabaseAdmin } from '../supabase';
import { mockStore } from '../mockStore';

let poppinsBoldBase64 = '';
let poppinsRegularBase64 = '';

// Descargar fuentes Poppins dinámicamente de Google Fonts
async function loadFonts(log?: (msg: string) => void) {
  if (poppinsBoldBase64 && poppinsRegularBase64) return;
  try {
    log?.('Descargando fuentes Poppins Bold y Regular para Sharp...');
    const boldRes = await fetch('https://fonts.gstatic.com/s/poppins/v20/pxiByp8kv8JHgFVrLCz7Z1xlFd2JQEk.ttf');
    const boldBuf = await boldRes.arrayBuffer();
    poppinsBoldBase64 = Buffer.from(boldBuf).toString('base64');

    const regRes = await fetch('https://fonts.gstatic.com/s/poppins/v20/pxiEyp8kv8JHgFVrFJDUc1NECFo.ttf');
    const regBuf = await regRes.arrayBuffer();
    poppinsRegularBase64 = Buffer.from(regBuf).toString('base64');
    log?.('✓ Fuentes Poppins descargadas e inyectadas en base64 con éxito.');
  } catch (err: any) {
    log?.(`⚠ Error descargando fuentes Poppins: ${err.message || err}. Usando fallback estándar.`);
  }
}

// Crear fondo de gradiente con sharp
async function createGradientBackground(width: number, height: number, colorStart: string, colorEnd: string): Promise<Buffer> {
  return await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: colorStart
    }
  })
  .composite([{
    input: Buffer.from(`
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="${colorStart}" />
            <stop offset="100%" stop-color="${colorEnd}" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad)" />
      </svg>
    `),
    top: 0,
    left: 0
  }])
  .png()
  .toBuffer();
}

// Envoltura de texto para SVG
function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxChars) {
      currentLine = (currentLine + ' ' + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

// Escapar caracteres XML no válidos
function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

// Composición SVG con tipografía Poppins base64 e overlays oscuros
function createSvgOverlay(
  title: string,
  subtitle: string,
  width: number,
  height: number,
  isCover: boolean = false
): string {
  const titleLines = wrapText(title, 24);
  const subtitleLines = wrapText(subtitle, 35);

  let styleSection = '';
  if (poppinsBoldBase64 && poppinsRegularBase64) {
    styleSection = `
      @font-face {
        font-family: 'Poppins';
        src: url(data:font/truetype;charset=utf-8;base64,${poppinsRegularBase64}) format('truetype');
        font-weight: 400;
        font-style: normal;
      }
      @font-face {
        font-family: 'Poppins';
        src: url(data:font/truetype;charset=utf-8;base64,${poppinsBoldBase64}) format('truetype');
        font-weight: 700;
        font-style: normal;
      }
    `;
  }

  let textElements = '';
  let backgroundOverlay = '';

  if (isCover) {
    const cardHeight = 160 + titleLines.length * 55 + subtitleLines.length * 35;
    const startY = (height - cardHeight) / 2;

    backgroundOverlay = `
      <rect x="50" y="${startY}" width="${width - 100}" height="${cardHeight}" rx="28" fill="rgba(11, 11, 13, 0.88)" stroke="rgba(255, 255, 255, 0.15)" stroke-width="2" />
    `;

    const titleStartY = startY + 90;
    const titleSvg = titleLines.map((line, idx) => 
      `<text x="${width / 2}" y="${titleStartY + idx * 55}" class="title text-center">${escapeXml(line)}</text>`
    ).join('');

    const subtitleStartY = titleStartY + titleLines.length * 55 + 20;
    const subtitleSvg = subtitleLines.map((line, idx) => 
      `<text x="${width / 2}" y="${subtitleStartY + idx * 35}" class="subtitle text-center">${escapeXml(line)}</text>`
    ).join('');

    textElements = titleSvg + subtitleSvg;
  } else {
    backgroundOverlay = `
      <defs>
        <linearGradient id="overlayGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="rgba(11, 11, 13, 0)" />
          <stop offset="100%" stop-color="rgba(11, 11, 13, 0.98)" />
        </linearGradient>
      </defs>
      <rect x="0" y="${height - 750}" width="${width}" height="750" fill="url(#overlayGrad)" />
    `;

    const totalHeightText = titleLines.length * 52 + subtitleLines.length * 32;
    const textStartY = height - 120 - totalHeightText;

    const titleSvg = titleLines.map((line, idx) => 
      `<text x="80" y="${textStartY + idx * 52}" class="title">${escapeXml(line)}</text>`
    ).join('');

    const subtitleStartY = textStartY + titleLines.length * 52 + 30;
    const subtitleSvg = subtitleLines.map((line, idx) => 
      `<text x="80" y="${subtitleStartY + idx * 32}" class="subtitle">${escapeXml(line)}</text>`
    ).join('');

    textElements = titleSvg + subtitleSvg;
  }

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          ${styleSection}
          .title {
            font-family: 'Poppins', system-ui, sans-serif;
            font-weight: 700;
            font-size: ${isCover ? '46px' : '40px'};
            fill: #ffffff;
          }
          .subtitle {
            font-family: 'Poppins', system-ui, sans-serif;
            font-weight: 400;
            font-size: ${isCover ? '24px' : '22px'};
            fill: #cfcfdb;
          }
          .text-center {
            text-anchor: middle;
          }
        </style>
      </defs>
      ${backgroundOverlay}
      ${textElements}
    </svg>
  `;
}

// Subir imágenes al bucket público de Supabase
async function uploadToSupabaseStorage(
  fileName: string, 
  buffer: Buffer
): Promise<string | null> {
  if (!isSupabaseConfigured() || !supabaseAdmin) return null;
  try {
    const { data, error } = await supabaseAdmin.storage
      .from('tiktok-carousel')
      .upload(fileName, buffer, {
        contentType: 'image/jpeg',
        upsert: true
      });
    if (error) throw error;

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('tiktok-carousel')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (err) {
    console.error('Error uploading image to Supabase Storage:', err);
    return null;
  }
}

// Llamar a DALL-E 3
async function generateDallEImage(
  prompt: string, 
  apiKey: string,
  log?: (msg: string) => void
): Promise<Buffer | null> {
  if (!apiKey || apiKey === 'your-openai-api-key') {
    return null;
  }

  try {
    const openai = new OpenAI({ apiKey });
    log?.(`Llamando a DALL-E 3 con prompt: "${prompt.substring(0, 80)}..."`);
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1792"
    });

    const imageUrl = response.data?.[0]?.url;
    if (!imageUrl) throw new Error('DALL-E 3 no retornó URL.');

    const imgRes = await fetch(imageUrl);
    const arrayBuffer = await imgRes.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (err: any) {
    log?.(`⚠ Error en DALL-E 3: ${err.message || err}. Usando imagen de fallback.`);
    return null;
  }
}

// Conectar con la API de Borradores de TikTok
async function postToTikTokDraft(
  title: string,
  images: string[],
  log?: (msg: string, type?: 'info' | 'warning' | 'success' | 'error') => void
): Promise<boolean> {
  const token = process.env.TIKTOK_ACCESS_TOKEN;
  if (!token) {
    log?.('⚠ TIKTOK_ACCESS_TOKEN no configurado en entorno. Omitiendo llamada API real a TikTok (simulando éxito).', 'warning');
    return true;
  }

  try {
    log?.(`Enviando borrador de carrusel con ${images.length} imágenes a TikTok...`, 'info');
    const res = await fetch('https://open.tiktokapis.com/v2/post/publish/content/init/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        post_info: {
          title: title,
          description: `${title} #corenews #sinclickbait`,
          privacy_level: 'MUTUAL_FOLLOWS_FRIENDS',
          disable_comment: false
        },
        media_info: {
          media_type: 'PHOTO',
          image_urls: images,
          post_mode: 'MEDIA_UPLOAD'
        }
      })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(`TikTok API responded with status ${res.status}: ${JSON.stringify(data)}`);
    }

    log?.(`✓ TikTok aceptó el borrador del carrusel: ${JSON.stringify(data.data)}`, 'success');
    return true;
  } catch (err: any) {
    log?.(`❌ Error en el conector de TikTok: ${err.message || err}`, 'error');
    return false;
  }
}

// Función principal del publicador invocado por el coordinador
export async function publishTikTokCarousels(
  log: (msg: string, type?: 'info' | 'warning' | 'success' | 'error') => void
): Promise<{ success: boolean; error?: string }> {
  await loadFonts(log);

  const todayStr = new Date().toISOString().split('T')[0];
  let noticias: Noticia[] = [];

  if (isSupabaseConfigured() && supabaseAdmin) {
    log(`Buscando noticias de hoy (${todayStr}) en Supabase...`, 'info');
    try {
      const { data, error } = await supabaseAdmin
        .from('noticias')
        .select('*, fuentes(*)')
        .gte('fecha_actualizacion', `${todayStr}T00:00:00Z`)
        .lte('fecha_actualizacion', `${todayStr}T23:59:59Z`);
      if (error) throw error;
      noticias = (data || []) as Noticia[];
    } catch (err: any) {
      log(`Error leyendo de Supabase: ${err.message || err}. Usando mockStore local.`, 'warning');
      noticias = mockStore.getNoticias().filter(n => n.fecha_actualizacion.startsWith(todayStr));
    }
  } else {
    log('Usando base de datos mockStore local...', 'info');
    noticias = mockStore.getNoticias().filter(n => n.fecha_actualizacion.startsWith(todayStr));
  }

  if (noticias.length === 0) {
    log('No se encontraron noticias publicadas hoy. Abortando carruseles.', 'warning');
    return { success: true };
  }

  log(`Encontradas ${noticias.length} noticias publicadas hoy. Agrupando por categoría...`, 'info');

  const categories: Categoria[] = ['ia', 'tecnologia', 'economia', 'politica'];
  const CATEGORY_LABELS: Record<Categoria, string> = {
    ia: 'Inteligencia Artificial',
    tecnologia: 'Tecnología',
    economia: 'Economía',
    politica: 'Geopolítica'
  };

  const apiKey = process.env.OPENAI_API_KEY || '';

  const publishPromises = categories.map(async (cat) => {
    const catNews = noticias.filter(n => n.categoria === cat);
    if (catNews.length === 0) {
      log(`Sin noticias hoy para la categoría ${cat.toUpperCase()}. Omitiendo TikTok.`, 'info');
      return;
    }

    log(`Procesando carrusel para la categoría: ${CATEGORY_LABELS[cat]} (${catNews.length} noticias)...`, 'info');
    const imageUrls: string[] = [];

    // --- DIAPOSITIVA 1: PORTADA ---
    const coverTitle = `Lo que está pasando HOY en ${CATEGORY_LABELS[cat]}`;
    const coverSubtitle = "Análisis verificado sin clickbait ni especulaciones.";
    const coverBg = await createGradientBackground(1080, 1920, '#0b0b0d', '#1e1b4b');
    const coverSvg = createSvgOverlay(coverTitle, coverSubtitle, 1080, 1920, true);
    
    const coverImage = await sharp(coverBg)
      .composite([{ input: Buffer.from(coverSvg), top: 0, left: 0 }])
      .jpeg({ quality: 90 })
      .toBuffer();

    const coverUrl = await uploadToSupabaseStorage(`tiktok_${cat}_cover_${todayStr}.jpg`, coverImage);
    if (coverUrl) imageUrls.push(coverUrl);

    // --- DIAPOSITIVAS INTERMEDIAS ---
    for (let idx = 0; idx < catNews.length; idx++) {
      const noticia = catNews[idx];
      let visualPrompt = `A premium high-tech dynamic photo representing: ${noticia.titulo}. Photorealistic journalistic style, editorial award-winning photography, high contrast, clean composition.`;
      
      if (apiKey && apiKey !== 'your-openai-api-key') {
        try {
          const openai = new OpenAI({ apiKey });
          const promptRes = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'Eres un director de fotografía y artista generativo. Toma el título y contenido de la noticia y devuelve un prompt único en inglés optimizado para que DALL-E 3 genere una imagen periodística realista y evocativa del suceso. Retorna ÚNICAMENTE el texto del prompt, sin comentarios adicionales.'
              },
              {
                role: 'user',
                content: `Título: ${noticia.titulo}\nHecho Principal: ${noticia.hecho_principal}`
              }
            ],
            max_tokens: 120
          });
          const generatedPrompt = promptRes.choices[0]?.message.content?.trim();
          if (generatedPrompt) visualPrompt = generatedPrompt;
        } catch { /* fallback */ }
      }

      let bgBuffer = await generateDallEImage(visualPrompt, apiKey, (m) => log(m));
      if (!bgBuffer) {
        bgBuffer = await createGradientBackground(1080, 1920, '#111114', '#18181c');
      }

      const articleSvg = createSvgOverlay(noticia.titulo, noticia.subtitulo, 1080, 1920, false);
      const articleImage = await sharp(bgBuffer)
        .resize(1080, 1920, { fit: 'cover' })
        .composite([{ input: Buffer.from(articleSvg), top: 0, left: 0 }])
        .jpeg({ quality: 90 })
        .toBuffer();

      const articleUrl = await uploadToSupabaseStorage(`tiktok_${cat}_slide_${idx}_${todayStr}.jpg`, articleImage);
      if (articleUrl) imageUrls.push(articleUrl);
    }

    // --- DIAPOSITIVA FINAL: CIERRE ---
    const closeTitle = "Pasa de los bulos de las redes";
    const closeSubtitle = "Lee el análisis completo y el Efecto Dominó en https://thecorenews.info";
    const closeBg = await createGradientBackground(1080, 1920, '#0b0b0d', '#0f172a');
    const closeSvg = createSvgOverlay(closeTitle, closeSubtitle, 1080, 1920, true);

    const closeImage = await sharp(closeBg)
      .composite([{ input: Buffer.from(closeSvg), top: 0, left: 0 }])
      .jpeg({ quality: 90 })
      .toBuffer();

    const closeUrl = await uploadToSupabaseStorage(`tiktok_${cat}_close_${todayStr}.jpg`, closeImage);
    if (closeUrl) imageUrls.push(closeUrl);

    // --- tiktok_connector: Enviar borrador a TikTok ---
    if (imageUrls.length > 2) {
      await postToTikTokDraft(
        `Lo que está pasando HOY en ${CATEGORY_LABELS[cat]}`,
        imageUrls,
        (msg, type) => log(msg, type)
      );
    } else {
      log(`⚠ No hay suficientes imágenes válidas para publicar en ${CATEGORY_LABELS[cat]}.`, 'warning');
    }
  });

  await Promise.all(publishPromises);

  return { success: true };
}
