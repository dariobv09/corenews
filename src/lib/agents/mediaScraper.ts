import OpenAI from 'openai';
import { Noticia, Categoria } from '@/types';

// Fallback images (premium high-resolution photos on Unsplash)
const CATEGORY_FALLBACKS: Record<Categoria, string> = {
  ia: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=1024&auto=format&fit=crop&q=80',
  tecnologia: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1024&auto=format&fit=crop&q=80',
  economia: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1024&auto=format&fit=crop&q=80',
  politica: 'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?w=1024&auto=format&fit=crop&q=80'
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

  // Intentar DALL-E 3 como método principal
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
      log?.(`[MediaScraper] [DALL-E 3] ⚠ Falló la generación. Detalle: ${err.message || err}. Iniciando cascada de fallbacks...`);
    }
  }

  // Fallback 1: Buscar en Unsplash
  if (openai) {
    const keywords = await extractKeywords(noticia, openai, log);
    const unsplashBuffer = await searchUnsplash(keywords, log);
    if (unsplashBuffer) return unsplashBuffer;

    // Fallback 2: Buscar en Google Custom Search
    const googleBuffer = await searchGoogle(keywords, log);
    if (googleBuffer) return googleBuffer;
  }

  // Fallback 3: Imagen estática curada por categoría
  log?.(`[MediaScraper] [Fallback] Usando imagen estática para la categoría: ${noticia.categoria.toUpperCase()}`);
  const fallbackUrl = CATEGORY_FALLBACKS[noticia.categoria];
  try {
    return await downloadImage(fallbackUrl, log);
  } catch (err: any) {
    log?.(`[MediaScraper] ❌ Error crítico al descargar imagen de fallback: ${err.message || err}`);
    throw err;
  }
}
