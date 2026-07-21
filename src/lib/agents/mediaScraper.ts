import OpenAI from 'openai';
import { Noticia, Categoria } from '@/types';

// Fallback images (premium high-resolution photos on Unsplash)
const CATEGORY_FALLBACKS: Record<Categoria, string[]> = {
  ia: [
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1024&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507146426996-ef05306b995a?w=1024&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1024&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=1024&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1024&auto=format&fit=crop&q=80'
  ],
  tecnologia: [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1024&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1024&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=1024&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1024&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1024&auto=format&fit=crop&q=80'
  ],
  economia: [
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1024&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1024&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1024&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1024&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1024&auto=format&fit=crop&q=80'
  ],
  politica: [
    'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?w=1024&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=1024&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1024&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1024&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1024&auto=format&fit=crop&q=80'
  ]
};

/**
 * Extracts 3-4 keywords in English representing the news using GPT-4o-mini
 */
async function extractKeywords(noticia: Noticia, openai: OpenAI, log?: (m: string) => void): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a metadata assistant. Extract 3 to 4 visual, highly specific keywords in English that represent the visual theme of the news. Separate them with commas. Do NOT include introductory text, explanations, or quotes. Example: "semiconductor cleanroom, microchip silicon wafer".'
        },
        {
          role: 'user',
          content: `Título: ${noticia.titulo}\nHecho Principal: ${noticia.hecho_principal}`
        }
      ],
      max_tokens: 50
    });

    const keywords = response.choices[0]?.message.content?.trim();
    if (keywords) {
      log?.(`[MediaScraper] Palabras clave extraídas en inglés: "${keywords}"`);
      return keywords;
    }
  } catch (err: any) {
    log?.(`[MediaScraper] ⚠ Error al extraer palabras clave: ${err.message || err}`);
  }
  
  // Default keywords if AI extraction fails
  const defaults: Record<Categoria, string> = {
    ia: 'artificial intelligence brain data server',
    tecnologia: 'technology chip hardware future',
    economia: 'finance charts money growth stocks',
    politica: 'geopolitics world map summit politics'
  };
  return defaults[noticia.categoria];
}

/**
 * Refines the prompt for DALL-E 3 using GPT-4o-mini
 */
async function refineDallEPrompt(noticia: Noticia, openai: OpenAI, log?: (m: string) => void): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Eres un director de fotografía y artista conceptual. Toma el título y contenido de la noticia y escribe un prompt único en inglés para que DALL-E 3 genere una fotografía realista y evocativa del suceso. Pide un estilo periodístico, fotografía de prensa, composición limpia, sin textos ni leyendas en la imagen. Retorna ÚNICAMENTE el prompt.'
        },
        {
          role: 'user',
          content: `Título: ${noticia.titulo}\nHecho Principal: ${noticia.hecho_principal}`
        }
      ],
      max_tokens: 120
    });

    const prompt = response.choices[0]?.message.content?.trim();
    if (prompt) {
      return prompt;
    }
  } catch (err: any) {
    log?.(`[MediaScraper] ⚠ Error al refinar prompt de DALL-E: ${err.message || err}`);
  }
  return `A realistic, high-quality press photography depicting: ${noticia.titulo}. Cinematic lighting, highly detailed.`;
}

/**
 * Downloads an image from a URL and returns it as a Buffer
 */
async function downloadImage(url: string, log?: (m: string) => void): Promise<Buffer> {
  log?.(`[MediaScraper] Descargando imagen desde URL: ${url}`);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download image: HTTP status ${res.status}`);
  }
  const arrayBuf = await res.arrayBuffer();
  return Buffer.from(arrayBuf);
}

/**
 * Searches Unsplash for a relevant image
 */
async function searchUnsplash(query: string, log?: (m: string) => void): Promise<Buffer | null> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    log?.('[MediaScraper] ⚠ UNSPLASH_ACCESS_KEY no configurado en entorno.');
    return null;
  }

  try {
    log?.(`[MediaScraper] Buscando en Unsplash para: "${query}"...`);
    const searchUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=5&client_id=${accessKey}`;
    const res = await fetch(searchUrl);
    if (!res.ok) {
      throw new Error(`Unsplash responded with status ${res.status}`);
    }

    const data = await res.json();
    const results = data.results || [];
    if (results.length === 0) {
      log?.(`[MediaScraper] No se encontraron resultados en Unsplash para: "${query}"`);
      return null;
    }

    // Select a random image from the top results to avoid repetition
    const randomIndex = Math.floor(Math.random() * Math.min(results.length, 5));
    const imageUrl = results[randomIndex].urls.regular;
    log?.(`[MediaScraper] ✓ Imagen seleccionada de Unsplash (índice ${randomIndex})`);
    
    return await downloadImage(imageUrl, log);
  } catch (err: any) {
    log?.(`[MediaScraper] ⚠ Error buscando en Unsplash: ${err.message || err}`);
    return null;
  }
}

/**
 * Searches Google Custom Search for a relevant image
 */
async function searchGoogle(query: string, log?: (m: string) => void): Promise<Buffer | null> {
  const apiKey = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY;
  const cx = process.env.GOOGLE_SEARCH_ENGINE_ID;
  if (!apiKey || !cx) {
    log?.('[MediaScraper] ⚠ GOOGLE_CUSTOM_SEARCH_API_KEY o GOOGLE_SEARCH_ENGINE_ID no configurados.');
    return null;
  }

  try {
    log?.(`[MediaScraper] Buscando en Google Custom Search para: "${query}"...`);
    const searchUrl = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&searchType=image&num=5&key=${apiKey}&cx=${cx}`;
    const res = await fetch(searchUrl);
    if (!res.ok) {
      throw new Error(`Google Search responded with status ${res.status}`);
    }

    const data = await res.json();
    const items = data.items || [];
    if (items.length === 0) {
      log?.(`[MediaScraper] No se encontraron resultados en Google para: "${query}"`);
      return null;
    }

    // Select a random image from the top results
    const randomIndex = Math.floor(Math.random() * Math.min(items.length, 5));
    const imageUrl = items[randomIndex].link;
    log?.(`[MediaScraper] ✓ Imagen seleccionada de Google (índice ${randomIndex})`);
    
    return await downloadImage(imageUrl, log);
  } catch (err: any) {
    log?.(`[MediaScraper] ⚠ Error buscando en Google: ${err.message || err}`);
    return null;
  }
}

/**
 * Extracts keywords offline from the news title (fallback when OpenAI is unavailable/billing-limited)
 */
function extractKeywordsOffline(title: string): string {
  const stopWords = new Set([
    'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'de', 'del', 'y', 'o', 'e', 'u', 'en', 'a', 'para', 'por', 'con', 'sin', 'sobre', 'tras', 'durante', 'mediante', 'que', 'se', 'su', 'sus', 'al', 'lo', 'como', 'mas', 'pero', 'este', 'esta', 'estos', 'estas', 'del', 'al', 'sus', 'sus', 'como', 'para', 'una', 'con', 'las', 'los', 'sobre', 'se', 'contra', 'entre', 'hacia', 'hasta', 'desde'
  ]);
  
  // Clean and split title
  const words = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "")
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopWords.has(w));
  
  // Return the first 2 cleaned words (broader search matches)
  return words.slice(0, 2).join(' ');
}

/**
 * Searches Wikimedia Commons for a query (keyless, completely free public images)
 */
async function searchWikimedia(query: string, log?: (m: string) => void): Promise<Buffer | null> {
  try {
    log?.(`[MediaScraper] [Wikimedia Fallback] Buscando en Wikimedia Commons para: "${query}"...`);
    const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=8&prop=imageinfo&iiprop=url&format=json&origin=*`;
    const res = await fetch(searchUrl);
    if (!res.ok) {
      throw new Error(`Wikimedia responded with status ${res.status}`);
    }

    const data = await res.json();
    const pages = data.query?.pages || {};
    const urls: string[] = [];

    for (const pageId of Object.keys(pages)) {
      const page = pages[pageId];
      const imageUrl = page.imageinfo?.[0]?.url;
      // Accept only common image extensions
      if (imageUrl && (imageUrl.endsWith('.png') || imageUrl.endsWith('.jpg') || imageUrl.endsWith('.jpeg') || imageUrl.endsWith('.webp'))) {
        urls.push(imageUrl);
      }
    }

    if (urls.length === 0) {
      log?.(`[MediaScraper] [Wikimedia Fallback] No se encontraron imágenes en Wikimedia para: "${query}"`);
      return null;
    }

    // Return the first working image URL
    for (const imgUrl of urls) {
      try {
        const testRes = await fetch(imgUrl, { method: 'HEAD' });
        if (testRes.ok) {
          log?.(`[MediaScraper] [Wikimedia Fallback] ✓ Encontrada imagen válida: ${imgUrl}`);
          return await downloadImage(imgUrl, log);
        }
      } catch (e) {
        // Skip and try next
      }
    }
  } catch (err: any) {
    log?.(`[MediaScraper] [Wikimedia Fallback] ⚠ Error en búsqueda de Wikimedia: ${err.message || err}`);
  }
  return null;
}

/**
 * Main entry point: Generates or scrapes a background image for a given news item
 */
export async function getBgImageForNews(
  noticia: Noticia,
  log?: (m: string) => void
): Promise<Buffer> {
  const apiKey = process.env.OPENAI_API_KEY || '';
  let openai: OpenAI | null = null;
  
  if (apiKey && apiKey !== 'your-openai-api-key') {
    openai = new OpenAI({ apiKey });
  }

  // 1. Intentar DALL-E 3
  if (openai) {
    try {
      const visualPrompt = await refineDallEPrompt(noticia, openai, log);
      log?.(`[MediaScraper] [DALL-E 3] Generando imagen de fondo para: "${noticia.titulo.substring(0, 50)}..."`);
      
      const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt: visualPrompt,
        n: 1,
        size: '1024x1792',
        quality: 'standard'
      });

      const imageUrl = response.data?.[0]?.url;
      if (imageUrl) {
        log?.('[MediaScraper] [DALL-E 3] ✓ Imagen generada exitosamente.');
        return await downloadImage(imageUrl, log);
      }
    } catch (err: any) {
      log?.(`[MediaScraper] [DALL-E 3] ⚠ Falló la generación. Detalle: ${err.message || err}.`);
    }
  }

  // 2. Extraer palabras clave para la búsqueda de imágenes
  let keywords = '';
  if (openai) {
    keywords = await extractKeywords(noticia, openai, log);
  } else {
    keywords = extractKeywordsOffline(noticia.titulo);
    log?.(`[MediaScraper] [Offline] Palabras clave extraídas sin IA: "${keywords}"`);
  }

  // 3. Fallback 1: Buscar en Unsplash API (si está configurada)
  if (process.env.UNSPLASH_ACCESS_KEY) {
    const unsplashBuffer = await searchUnsplash(keywords, log);
    if (unsplashBuffer) return unsplashBuffer;
  }

  // 4. Fallback 2: Buscar en Google Custom Search API (si está configurada)
  if (process.env.GOOGLE_CUSTOM_SEARCH_API_KEY && process.env.GOOGLE_SEARCH_ENGINE_ID) {
    const googleBuffer = await searchGoogle(keywords, log);
    if (googleBuffer) return googleBuffer;
  }

  // 5. Fallback 3: Buscar en Wikimedia Commons (Completamente gratuito y público)
  const wikimediaBuffer = await searchWikimedia(keywords, log);
  if (wikimediaBuffer) return wikimediaBuffer;

  // 6. Fallback 4: Imagen estática curada por categoría
  log?.(`[MediaScraper] [Fallback] Usando imagen estática para la categoría: ${noticia.categoria.toUpperCase()}`);
  const fallbacks = CATEGORY_FALLBACKS[noticia.categoria];
  const fallbackUrl = fallbacks[Math.floor(Math.random() * fallbacks.length)];
  try {
    return await downloadImage(fallbackUrl, log);
  } catch (err: any) {
    log?.(`[MediaScraper] ❌ Error crítico al descargar imagen de fallback: ${err.message || err}`);
    throw err;
  }
}
