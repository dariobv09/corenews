// Writer Agent: Polishes style, formats final JSON, and generates markdown reports
import OpenAI from 'openai';
import { Noticia, Fuente, Informe, Categoria } from '@/types';
import { DraftEvent } from './specialists';
import { VerificationResult } from './verifier';

export interface WriterOutput {
  noticias: {
    noticia: Omit<Noticia, 'id' | 'fecha_actualizacion' | 'fuentes'>;
    fuentes: Omit<Fuente, 'id' | 'noticia_id'>[];
  }[];
  informe: string; // Markdown content
}

// Curated high-resolution Unsplash images per category for editorial news articles
const CATEGORY_IMAGES: Record<Categoria, string[]> = {
  ia: [
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1024&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=1024&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507146426996-ef05306b995a?w=1024&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1024&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=1024&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=1024&auto=format&fit=crop&q=80'
  ],
  tecnologia: [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1024&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1024&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1024&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1024&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1024&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1512756290469-ec264b7fbf87?w=1024&auto=format&fit=crop&q=80'
  ],
  economia: [
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1024&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1024&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1024&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1024&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1024&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=1024&auto=format&fit=crop&q=80'
  ],
  politica: [
    'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?w=1024&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=1024&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1024&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1024&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1024&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1024&auto=format&fit=crop&q=80'
  ]
};

function getImageUrlForArticle(categoria: Categoria, index: number): string {
  const images = CATEGORY_IMAGES[categoria] || CATEGORY_IMAGES.ia;
  return images[index % images.length];
}

export async function runWriterAgent(
  categoria: Categoria,
  draftEvents: DraftEvent[],
  verifications: VerificationResult[],
  logCallback?: (msg: string) => void
): Promise<WriterOutput> {
  const agentName = 'Agente Redactor';
  logCallback?.(`Iniciando redacción final y formateo editorial en español para la categoría: ${categoria.toUpperCase()}...`);

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey === 'your-openai-api-key') {
    logCallback?.(`⚠ [Simulación] Ejecutando formateador editorial local.`);
    return runWriterSimulation(categoria, draftEvents, verifications, logCallback);
  }

  const openai = new OpenAI({ apiKey });

  const systemPrompt = `Eres el Editor en Jefe y Redactor Sénior de The Core News. Tu labor es transformar los datos técnicos y la verificación en un **Informe Estratégico en Profundidad (Deep Dive)** de alto valor (entre 800 y 1.500 palabras por artículo) y redactar la síntesis ejecutiva diaria.

### 👥 Personalidad y Tono de Voz (Estricto Periodismo Humano):
- **Humano, Riguroso y Natural:** Escribe como un corresponsal o analista sénior de geopolítica, economía o ciencia con años de experiencia sobre el terreno.
- **Cero Clichés de Inteligencia Artificial:** Está TERMINANTEMENTE PROHIBIDO usar fórmulas artificiales como:
  * ❌ "En el cambiante mundo de hoy..."
  * ❌ "Es crucial destacar que..."
  * ❌ "Nos sumergimos en las profundidades de..."
  * ❌ "Un abanico de posibilidades..."
  * ❌ "En conclusión, podemos decir que..."
- **Narrativa Clara y Fluida:** Explica los conceptos complejos con soltura, relacionando causas y efectos, citando a los protagonistas y aportando cifras directas.
- **Objetividad Absoluta:** No emitas juicios de valor, adjetivos partidistas ni opiniones personales. Presenta los hechos y las posturas de cada actor con total neutralidad.

### 🔍 Contrastación y Triangulación de Fuentes:
En la sección "contrastacion_fuentes", debes comparar con detalle:
- Qué afirman los organismos o agencias neutrales/internacionales.
- Qué postura defiende la parte A.
- Qué postura defiende la parte B u observadores independientes.
- Qué puntos están 100% demostrados y qué alegaciones siguen pendientes de verificación.

### 📊 Especificación del Formato JSON Requerido:
Debes retornar UNICAMENTE un objeto JSON válido con la siguiente estructura exacta:
{
  "noticias": [
    {
      "titulo": "Titular periodístico directo y de impacto",
      "subtitulo": "Frase de contexto inmediato que amplía el titular",
      "hecho_principal": "Descripción exhaustiva y profunda del hecho principal (mínimo 3-4 párrafos explicativos, destacando conceptos clave con negritas estratégicas)",
      "desarrollo": "Desarrollo cronológico y operativo minucioso de los acontecimientos (mínimo 3 párrafos)",
      "actores": "Actores clave implicados y sus respectivos intereses estratégicos o geopolíticos",
      "contexto": "Antecedentes históricos, técnicos o económicos que originaron la situación actual",
      "datos_verificables": "Datos numéricos exactos, registros oficiales, fechas, papers o documentos primarios",
      "estado_actual": "Situación operativa en el momento del cierre informativo",
      "declaraciones": "Citas textuales verificadas atribuidas a sus emisores legítimos",
      "contrastacion_fuentes": "Análisis comparativo y triangulación entre las diferentes fuentes consultadas (posturas neutrales vs partes involucradas)",
      "consecuencias": "Posibles consecuencias (en formato Markdown estructurado en: 1. Proyecciones a futuro, 2. Precedentes Históricos, 3. Efecto Dominó)",
      "importancia": "Alta" | "Media",
      "meta_description": "Breve descripción de menos de 150 caracteres para SEO",
      "fuentes": [
        {
          "nombre": "Nombre de la fuente",
          "url": "URL de la fuente",
          "tipo": "Tipo de fuente",
          "relevancia": "Alta" | "Media",
          "fecha_publicacion": "Fecha de publicación"
        }
      ]
    }
  ],
  "informe_sintesis": "Síntesis ejecutiva de alto valor en formato Markdown (de 250 a 350 palabras) resumiendo los puntos estratégicos clave del día."
}`;

  const userPrompt = `Borradores y datos recopilados:
${JSON.stringify(draftEvents, null, 2)}

Resultados de la Verificación y Contraste:
${JSON.stringify(verifications, null, 2)}

Genera el informe estratégico exhaustivo con contrastación de fuentes y tono periodístico humano.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3
    });

    const contentText = response.choices[0].message.content || '{}';
    const parsed = JSON.parse(contentText);

    if (!parsed.noticias || !Array.isArray(parsed.noticias) || !parsed.informe_sintesis) {
      throw new Error("Formato de respuesta JSON inválido. Faltan noticias o informe_sintesis.");
    }

    const outputNoticias = parsed.noticias.map((n: any, idx: number) => {
      const { fuentes, ...noticiaData } = n;
      return {
        noticia: {
          ...noticiaData,
          categoria,
          subtitulo:              noticiaData.subtitulo              || '',
          hecho_principal:        noticiaData.hecho_principal        || '',
          desarrollo:             noticiaData.desarrollo             || '',
          actores:                noticiaData.actores                || '',
          contexto:               noticiaData.contexto               || '',
          datos_verificables:     noticiaData.datos_verificables     || '',
          estado_actual:          noticiaData.estado_actual          || '',
          declaraciones:          noticiaData.declaraciones          || '',
          contrastacion_fuentes:  noticiaData.contrastacion_fuentes  || '',
          consecuencias:          noticiaData.consecuencias          || '',
          meta_description:       noticiaData.meta_description       || '',
          imagen_url:             noticiaData.imagen_url             || getImageUrlForArticle(categoria, idx),
          author_name:            noticiaData.author_name            || 'Darío Balado'
        },
        fuentes: fuentes || []
      };
    });

    logCallback?.(`✓ ${agentName} redactó los informes finales y el resumen diario en formato Markdown.`);
    return {
      noticias: outputNoticias,
      informe: parsed.informe_sintesis
    };
  } catch (error: any) {
    logCallback?.(`⚠ Error en el ${agentName}: ${error.message || error}. Usando formateador de simulación.`);
    return runWriterSimulation(categoria, draftEvents, verifications, logCallback);
  }
}

// Local simulation fallback
function runWriterSimulation(
  categoria: Categoria,
  draftEvents: DraftEvent[],
  verifications: VerificationResult[],
  logCallback?: (msg: string) => void
): WriterOutput {
  const noticias: WriterOutput['noticias'] = [];
  const dateStr = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });

  for (let i = 0; i < draftEvents.length; i++) {
    const draft = draftEvents[i];

    noticias.push({
      noticia: {
        categoria,
        titulo:                 draft.titulo,
        subtitulo:              draft.subtitulo_borrador,
        hecho_principal:        draft.hecho_principal_borrador,
        desarrollo:             draft.desarrollo_borrador,
        actores:                draft.actores_borrador,
        contexto:               draft.contexto_borrador,
        datos_verificables:     draft.datos_verificables_borrador,
        estado_actual:          draft.estado_actual_borrador,
        declaraciones:          draft.declaraciones_borrador,
        contrastacion_fuentes:  draft.contrastacion_fuentes_borrador || '',
        consecuencias:          draft.consecuencias_borrador,
        importancia:            draft.importancia,
        meta_description:       draft.meta_description || '',
        imagen_url:             getImageUrlForArticle(categoria, i),
        author_name:            'Darío Balado'
      },
      fuentes: draft.fuentes_propuestas.map(f => ({
        nombre: f.nombre,
        tipo: f.tipo,
        url: f.url,
        relevancia: f.relevancia,
        fecha_publicacion: f.fecha_publicacion
      }))
    });
  }

  // Generate markdown synthesis report
  let categoryTitle = '';
  if (categoria === 'ia') categoryTitle = 'Inteligencia Artificial';
  else if (categoria === 'tecnologia') categoryTitle = 'Tecnología e Innovación';
  else if (categoria === 'economia') categoryTitle = 'Economía Global y Mercados';
  else categoryTitle = 'Geopolítica y Seguridad Internacional';

  let markdown = `## Síntesis Diaria de ${categoryTitle} - ${dateStr}\n\n`;
  markdown += `Los acontecimientos más destacados recopilados hoy se detallan a continuación:\n\n`;

  for (const n of noticias) {
    markdown += `* **${n.noticia.titulo}:** ${n.noticia.subtitulo}\n`;
  }

  markdown += `\n*Síntesis generada por el sistema multiagente a partir de fuentes primarias contrastadas.*`;

  logCallback?.(`[Simulación] ✓ Redacción final y síntesis en Markdown terminadas.`);
  return {
    noticias,
    informe: markdown
  };
}
