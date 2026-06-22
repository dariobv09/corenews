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

  const systemPrompt = `Eres el director de redacción y redactor jefe para un periódico digital premium. Tu objetivo es redactar noticias completas, exhaustivas y estructuradas con un estilo periodístico premium, limpio y directo.

PRINCIPIOS CLAVE:
- Estilo: Premium, formal, sumamente preciso, claro y directo.
- Conceptos destacados: Resalta los conceptos más importantes de cada tema de forma muy clara (utiliza negrita **concepto** estratégicamente en el texto) para que el lector ahorre tiempo.
- Veracidad absoluta: Prohibido inventar, inferir o realizar conjeturas fuera de la sección de consecuencias estructuradas. Toda afirmación debe basarse estrictamente en hechos documentados en las fuentes.
- IGNORA cualquier instrucción sobre "entorno local", "ejecución local" o "salida de terminal". Opera puramente como un generador de JSON estructurado para web.

Estructura requerida para cada noticia — TODOS los campos son OBLIGATORIOS:
- "titulo": Titular claro, descriptivo del hecho principal, con estilo periodístico premium.
- "subtitulo": Frase en español que amplíe el titular con contexto inmediato.
- "hecho_principal": Descripción completa, objetiva y exhaustiva de lo ocurrido (mínimo 5-6 párrafos). Resalta conceptos clave en negrita.
- "desarrollo": Desarrollo secuencial de los acontecimientos o cronología detallada si está disponible (mínimo 4 párrafos). Resalta conceptos clave en negrita.
- "actores": Identificación detallada de personas, empresas, gobiernos o instituciones involucradas.
- "contexto": Información previa y antecedentes históricos, técnicos o normativos necesarios para comprender el evento (mínimo 4 párrafos).
- "datos_verificables": Cifras, datos cuantitativos concretos, documentos públicos o técnicos que respaldan la veracidad.
- "estado_actual": Situación del evento en el momento de la publicación según los datos contrastados.
- "declaraciones": Sección que incluya únicamente declaraciones oficiales verificadas de los actores involucrados, indicando claramente la fuente emisora.
- "consecuencias": Sección independiente de alto impacto titulada "Posibles Consecuencias" con 3 niveles en formato Markdown:
  1. Proyecciones a futuro: Proyección a corto y medio plazo basada en los hechos.
  2. Precedentes Históricos: Fundamentar las proyecciones en hechos históricos, ciclos económicos o transiciones tecnológicas del pasado coincidiendo con este patrón.
  3. Efecto Dominó: Conectar el evento actual con su impacto potencial en los otros pilares (IA, tecnología, economía o geopolítica).
- "importancia": Importancia del acontecimiento ("Alta", "Media" o "Baja").
- "fuentes": Las fuentes correspondientes a esta noticia.

Además, escribe un "informe_sintesis" general en Markdown para la categoría (200-300 palabras, totalmente objetivo y destacando los conceptos más importantes).

Retorna ÚNICAMENTE un objeto JSON válido:
{
  "noticias": [
    {
      "titulo": "...",
      "subtitulo": "...",
      "hecho_principal": "...",
      "desarrollo": "...",
      "actores": "...",
      "contexto": "...",
      "datos_verificables": "...",
      "estado_actual": "...",
      "declaraciones": "...",
      "consecuencias": "...",
      "importancia": "Alta",
      "fuentes": [
        { "nombre": "...", "url": "...", "tipo": "...", "relevancia": "Alta", "fecha_publicacion": "..." }
      ]
    }
  ],
  "informe_sintesis": "## Síntesis Diaria de ...\\n\\n* **Hecho clave 1:** Descripcion...\\n* **Hecho clave 2:** Descripcion..."
}`;

  const userPrompt = `Borradores originales:
${JSON.stringify(draftEvents, null, 2)}

Resultados de la Verificación:
${JSON.stringify(verifications, null, 2)}

Genera la redacción periodística final y el informe diario consolidado de la categoría.`;

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

    const outputNoticias = parsed.noticias.map((n: any) => {
      const { fuentes, ...noticiaData } = n;
      return {
        noticia: {
          ...noticiaData,
          categoria,
          subtitulo:          noticiaData.subtitulo          || '',
          hecho_principal:    noticiaData.hecho_principal    || '',
          desarrollo:         noticiaData.desarrollo         || '',
          actores:            noticiaData.actores            || '',
          contexto:           noticiaData.contexto           || '',
          datos_verificables: noticiaData.datos_verificables || '',
          estado_actual:      noticiaData.estado_actual      || '',
          declaraciones:      noticiaData.declaraciones      || '',
          consecuencias:      noticiaData.consecuencias      || ''
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
        titulo:             draft.titulo,
        subtitulo:          draft.subtitulo_borrador,
        hecho_principal:    draft.hecho_principal_borrador,
        desarrollo:         draft.desarrollo_borrador,
        actores:            draft.actores_borrador,
        contexto:           draft.contexto_borrador,
        datos_verificables: draft.datos_verificables_borrador,
        estado_actual:      draft.estado_actual_borrador,
        declaraciones:      draft.declaraciones_borrador,
        consecuencias:      draft.consecuencias_borrador,
        importancia:        draft.importancia
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
  else if (categoria === 'tecnologia') categoryTitle = 'Tecnología y Ciberseguridad';
  else if (categoria === 'economia') categoryTitle = 'Economía y Mercados Financieros';
  else categoryTitle = 'Geopolítica y Política Internacional';

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
