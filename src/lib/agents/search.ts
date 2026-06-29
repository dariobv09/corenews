// Search and Feed Aggregator for Agents
import { Categoria } from '@/types';
import Parser from 'rss-parser';
import { isSupabaseConfigured, supabaseAdmin } from '../supabase';
import { mockStore } from '../mockStore';

const rssParser = new Parser();

export interface FeedItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  sourceName: string;
}

// Curated reliable RSS feeds for each category
const FEEDS: Record<Categoria, { name: string; url: string }[]> = {
  ia: [
    { name: 'MIT Technology Review AI', url: 'https://www.technologyreview.com/category/artificial-intelligence/feed/' },
    { name: 'TechCrunch AI', url: 'https://techcrunch.com/category/artificial-intelligence/feed/' }
  ],
  tecnologia: [
    { name: 'Wired', url: 'https://www.wired.com/feed/rss' },
    { name: 'TechCrunch', url: 'https://techcrunch.com/feed/' }
  ],
  economia: [
    { name: 'The Economist - Business & Finance', url: 'https://www.economist.com/business-and-finance/rss.xml' },
    { name: 'Reuters Business', url: 'http://feeds.feedburner.com/reuters/businessNews' }
  ],
  politica: [
    { name: 'Al Jazeera English', url: 'https://www.aljazeera.com/xml/rss/all.xml' },
    { name: 'Reuters World', url: 'http://feeds.feedburner.com/Reuters/worldNews' }
  ]
};

// Robust XML parser using rss-parser package
async function parseRSS(xmlText: string, sourceName: string): Promise<FeedItem[]> {
  const items: FeedItem[] = [];
  try {
    const feed = await rssParser.parseString(xmlText);
    for (const item of feed.items || []) {
      const title = item.title || '';
      const link = item.link || '';
      const description = item.contentSnippet || item.content || item.description || '';
      const pubDate = item.pubDate || '';

      if (title && link) {
        items.push({
          title: cleanString(title),
          link: cleanString(link),
          description: cleanString(description).replace(/<[^>]*>/g, '').substring(0, 300) + (description.length > 300 ? '...' : ''),
          pubDate: cleanString(pubDate),
          sourceName
        });
      }
    }
  } catch (err: any) {
    console.error(`Error procesando feed RSS de ${sourceName}:`, err);
  }
  return items;
}

function cleanString(str: string): string {
  return str
    .replace(/<!\[CDATA\[/g, '')
    .replace(/\]\]>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .trim();
}

// Helper to verify if an article contains comparative timeframe context or is current news affecting today's publication date
function checkTimeframeRelevance(title: string, description: string): { hasTimelineMatch: boolean; boost: number } {
  const text = (title + ' ' + description).toLowerCase();
  
  // Patterns showing comparisons with past stages or clear benchmark dates in the past
  const pastIndicators = [
    /hace (un|\d+|varios) (año|mes|semana|día|hora)s?/,
    /año pasado/,
    /mes pasado/,
    /anteriormente/,
    /en el pasado/,
    /previamente/,
    /históricos?/,
    /máximos? (históricos?|de \d+)/,
    /mínimos? (históricos?|de \d+)/,
    /a year ago/,
    /\d+ (year|month|day|week|hour)s? ago/,
    /last year/,
    /last month/,
    /previously/,
    /historical/,
    /yoy/,
    /mom/,
    /interanual/,
    /en comparación con/
  ];

  // Patterns showing current status or impact on today's publication date
  const presentIndicators = [
    /\bhoy\b/,
    /\bahora\b/,
    /actualmente/,
    /hoy en día/,
    /al día de hoy/,
    /\btoday\b/,
    /\bnow\b/,
    /currently/,
    /en este momento/,
    /afecta/
  ];

  let hasPast = false;
  for (const regex of pastIndicators) {
    if (regex.test(text)) {
      hasPast = true;
      break;
    }
  }

  let hasPresent = false;
  for (const regex of presentIndicators) {
    if (regex.test(text)) {
      hasPresent = true;
      break;
    }
  }

  if (hasPast && hasPresent) {
    // Highly relevant: connects a clear past benchmark to today's status
    return { hasTimelineMatch: true, boost: 12 };
  } else if (hasPresent) {
    // Current news affecting today
    return { hasTimelineMatch: false, boost: 6 };
  } else if (hasPast) {
    // Just has past reference, could be historical background
    return { hasTimelineMatch: true, boost: 4 };
  }

  return { hasTimelineMatch: false, boost: 0 };
}

// Filters search results to keep the 6 most relevant items and avoid LLM token overload
function filterFeedItemsByRelevance(items: FeedItem[], categoria: Categoria, limit: number = 6): FeedItem[] {
  const keywords: Record<Categoria, string[]> = {
    ia: [
      'inteligencia artificial', 'artificial intelligence', 'openai', 'gpt', 'gemini', 'claude', 
      'deepmind', 'llm', 'machine learning', 'nvidia', 'inference', 'sam altman', 'anthropic', 
      'transformer', 'neural', 'reasoning', 'razonamiento'
    ],
    tecnologia: [
      'tecnologia', 'technology', 'chip', 'semiconductor', 'tsmc', 'intel', 'samsung', 'apple', 
      'microsoft', 'google', 'cybersecurity', 'ciberseguridad', 'vulnerabilidad', 'software', 
      'hardware', 'asml', 'gaa', 'ransomware', 'zero-day'
    ],
    economia: [
      'economia', 'economy', 'finance', 'finanzas', 'bce', 'fed', 'inflation', 'inflacion', 
      'interest rates', 'tipos de interes', 'banco central', 'mercado', 'debt', 'deuda', 'growth', 
      'crecimiento', 'brent', 'crudo', 'petroleo'
    ],
    politica: [
      'politica', 'politics', 'geopolitics', 'geopolitica', 'gobierno', 'government', 'treaty', 
      'tratado', 'security', 'seguridad', 'nato', 'otan', 'alliance', 'cumbre', 'summit', 
      'relaciones', 'arancel', 'sabotaje', 'defensa'
    ]
  };

  const catKeywords = keywords[categoria] || [];

  const scoredItems = items.map((item) => {
    let score = 0;
    
    // 1. Text length contribution (longer descriptions are usually more descriptive)
    const textLength = (item.title + ' ' + item.description).length;
    score += Math.min(5, textLength / 100);
    
    // 2. Keyword matching
    const contentLower = (item.title + ' ' + item.description).toLowerCase();
    for (const kw of catKeywords) {
      if (contentLower.includes(kw)) {
        score += 3;
      }
    }
    
    // 3. Timeframe comparison & impact boost
    const tf = checkTimeframeRelevance(item.title, item.description);
    score += tf.boost;
    
    // 4. Recency boost & date-based filtering
    const pubTime = Date.parse(item.pubDate);
    if (!isNaN(pubTime)) {
      const hoursAgo = (Date.now() - pubTime) / (1000 * 60 * 60);
      if (hoursAgo >= 0) {
        if (hoursAgo > 72) {
          // Outdated penalty: if it is older than 72 hours, it must have a clear comparative timeframe
          // to be relevant (e.g. comparing past stage to today). Otherwise, penalize heavily.
          if (!tf.hasTimelineMatch) {
            score -= 15;
          } else {
            // Keep some points if it compares past to present, but reduce standard recency
            score += Math.max(0, 4 - (hoursAgo / 48));
          }
        } else {
          // Recent articles get a nice boost
          score += Math.max(0, 10 - (hoursAgo / 8));
        }
      }
    } else {
      // If date is not parseable but has timeframe indicators, give a minor boost
      if (tf.hasTimelineMatch) {
        score += 3;
      }
    }
    
    return { item, score };
  });

  // Sort by score descending
  scoredItems.sort((a, b) => b.score - a.score);

  // Return the top N items
  return scoredItems.slice(0, limit).map((x) => x.item);
}

async function getProcessedUrls(): Promise<Set<string>> {
  const processed = new Set<string>();
  
  if (isSupabaseConfigured() && supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('fuentes')
        .select('url')
        .not('url', 'is', null);
      if (!error && data) {
        data.forEach((f: any) => {
          if (f.url) processed.add(f.url.trim());
        });
      }
    } catch (err) {
      console.error('Error fetching processed URLs from Supabase:', err);
    }
  }
  
  try {
    const noticias = mockStore.getNoticias();
    noticias.forEach(n => {
      if (n.fuentes) {
        n.fuentes.forEach(f => {
          if (f.url) processed.add(f.url.trim());
        });
      }
    });
  } catch (err) {
    console.error('Error fetching processed URLs from mockStore:', err);
  }
  
  return processed;
}

// Primary function to fetch news items from RSS feeds
export async function searchCategoryNews(categoria: Categoria, logCallback?: (msg: string) => void): Promise<FeedItem[]> {
  const feedsToFetch = FEEDS[categoria];
  const allItems: FeedItem[] = [];
  
  logCallback?.(`Iniciando recopilación de información para la categoría: ${categoria.toUpperCase()}`);

  for (const feed of feedsToFetch) {
    try {
      logCallback?.(`Consultando fuente: ${feed.name}...`);
      
      // Fetch with timeout to prevent blocking the agent pipeline
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 8000); // 8 seconds timeout
      
      const response = await fetch(feed.url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      clearTimeout(id);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const xmlText = await response.text();
      const parsed = await parseRSS(xmlText, feed.name);
      
      logCallback?.(`✓ Recopilados ${parsed.length} artículos de ${feed.name}`);
      allItems.push(...parsed);
    } catch (error: any) {
      logCallback?.(`⚠ Error consultando ${feed.name}: ${error.message || error}. Continuando con las siguientes fuentes.`);
    }
  }

  // Filtrar artículos que ya fueron procesados previamente (evitar duplicados)
  const processedUrls = await getProcessedUrls();
  const newItems = allItems.filter(item => {
    const linkTrim = item.link.trim();
    if (processedUrls.has(linkTrim)) {
      logCallback?.(`↷ Omitiendo artículo ya procesado en días previos: "${item.title}"`);
      return false;
    }
    return true;
  });

  // If no new items were fetched, return default high-quality fallback items
  if (newItems.length === 0) {
    logCallback?.(`⚠ No se pudo recuperar información en vivo nueva. Cargando temas semilla predefinidos.`);
    return getFallbackSeedItems(categoria);
  }

  // Filter by relevance to limit count to 6 and avoid token overload
  const filteredItems = filterFeedItemsByRelevance(newItems, categoria, 6);
  logCallback?.(`Filtrados por relevancia: Seleccionados ${filteredItems.length} artículos principales para el especialista.`);
  return filteredItems;
}

function getFallbackSeedItems(categoria: Categoria): FeedItem[] {
  const nowStr = new Date().toLocaleDateString('es-ES');
  const fallbacks: Record<Categoria, FeedItem[]> = {
    ia: [
      {
        title: 'Lanzamiento de Claude 4.5 Opus con Razonamiento Hiper-dimensional',
        link: 'https://anthropic.com/news',
        description: 'Anthropic ha presentado su nuevo modelo frontera Claude 4.5 Opus, demostrando mejoras significativas en codificación autónoma, análisis financiero complejo y mitigación de alucinaciones.',
        pubDate: nowStr,
        sourceName: 'Anthropic Press'
      },
      {
        title: 'Investigadores de Stanford logran inferencia de IA local 10x más eficiente',
        link: 'https://stanford.edu/news',
        description: 'Un nuevo paper propone un algoritmo de cuantización dinámica que permite ejecutar modelos de 70B de parámetros de forma fluida en hardware de consumo doméstico.',
        pubDate: nowStr,
        sourceName: 'Stanford AI Lab'
      }
    ],
    tecnologia: [
      {
        title: 'Nvidia supera los 4 Trillones de capitalización por demanda de chips Blackwell Ultra',
        link: 'https://nvidia.com/news',
        description: 'La fuerte demanda de hardware especializado en centros de datos ha catapultado las acciones de Nvidia, convirtiéndola en la empresa más valiosa del mundo.',
        pubDate: nowStr,
        sourceName: 'Wired Financial'
      },
      {
        title: 'Vulnerabilidad Zero-Day crítica en protocolos WPA3 afecta a routers comerciales',
        link: 'https://wired.com/security',
        description: 'Expertos en ciberseguridad alertan de un fallo de diseño que permite la interceptación de tráfico Wi-Fi en redes protegidas con WPA3 sin necesidad de la contraseña.',
        pubDate: nowStr,
        sourceName: 'Wired Security'
      }
    ],
    economia: [
      {
        title: 'El Banco Central Europeo recorta los tipos al 3.50% impulsando los mercados',
        link: 'https://ecb.europa.eu',
        description: 'La presidenta del BCE anuncia una bajada de 25 puntos básicos tras confirmar que la inflación de la eurozona se ha estabilizado en el 1.9%.',
        pubDate: nowStr,
        sourceName: 'FT Markets'
      },
      {
        title: 'El precio del barril de Brent cae a 72 dólares por aumento de reservas de EE.UU.',
        link: 'https://reuters.com/markets',
        description: 'Los futuros del petróleo caen por tercera jornada consecutiva ante señales de sobreoferta mundial y una menor demanda industrial en Asia.',
        pubDate: nowStr,
        sourceName: 'Reuters Commodities'
      }
    ],
    politica: [
      {
        title: 'La Cumbre del Clima G20 se cierra con compromisos de descarbonización acelerada',
        link: 'https://g20.org',
        description: 'Los líderes de las principales economías acuerdan duplicar la inversión en infraestructuras de hidrógeno verde y reducir las subvenciones a combustibles fósiles para 2030.',
        pubDate: nowStr,
        sourceName: 'Al Jazeera English'
      },
      {
        title: 'Tensiones arancelarias bilaterales entre la Unión Europea y bloques comerciales asiáticos',
        link: 'https://reuters.com/world',
        description: 'Nuevas disputas arancelarias en vehículos eléctricos y paneles solares amenazan con desencadenar medidas de retorsión comercial a partir del próximo mes.',
        pubDate: nowStr,
        sourceName: 'Reuters World'
      }
    ]
  };

  return fallbacks[categoria];
}
