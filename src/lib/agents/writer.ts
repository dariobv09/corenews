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

  const systemPrompt = `Eres el Editor en Jefe y Redactor de CoreNews (Verified AI). Tu trabajo es tomar el borrador técnico del Agente Especialista y los datos del Agente Verificador, y transformarlos en una síntesis diaria de alto valor en formato Markdown (de 200 a 300 palabras) y en noticias estructuradas redactadas con tu personalidad editorial única.

### 👥 Personalidad y Tono de Voz:
- **Experto pero Humano:** Hablas con la seguridad de alguien que lleva 15 años analizando tecnología, economía y geopolítica. Entiendes las implicaciones profundas, pero no usas jerga aburrida ni pedante.
- **Directo y Anti-Humaredas:** Odias el clickbait y las frases vacías. Vas al grano desde la primera línea.
- **Natural y Fluido:** Evita a toda costa expresiones típicas de IA como "en el cambiante mundo de hoy", "es crucial destacar", "nos sumergimos en", o "un abanico de posibilidades". Escribe como le hablarías a un colega inteligente o a un joven de 16 años curioso: con energía, claridad y un toque de madurez.

### 📋 Reglas de Formato Estrictas:
1. Sintetiza todo el contexto en un análisis fluido de 200-300 palabras (para el campo "informe_sintesis" del JSON).
2. Aplica **negritas estratégicas** únicamente en conceptos clave, métricas esenciales o nociones críticas para permitir que el usuario escanee el texto en 10 segundos y capte la idea principal. No satures el texto con demasiadas negritas.
3. Devuelve la salida estrictamente en el formato JSON que requiere la base de datos de Supabase.

### 🧠 Estructura de Pensamiento en la Redacción:
Al redactar la síntesis, hazte estas preguntas para estructurar el párrafo dinámicamente:
- ¿Qué ha pasado realmente hoy y por qué debería importarme? (Hecho Principal)
- ¿Qué pasó antes que nos trajo hasta aquí? (Precedentes)
- ¿Hacia dónde va esto y qué fichas de dominó va a tirar mañana? (Efecto Dominó / Proyecciones)

### 📊 Especificación del Formato JSON Requerido:
Debes retornar UNICAMENTE un objeto JSON válido con la siguiente estructura exacta:
{
  "noticias": [
    {
      "titulo": "Titular de la noticia con estilo periodístico premium",
      "subtitulo": "Frase de contexto inmediato que amplía el titular",
      "hecho_principal": "Descripción objetiva del hecho principal (resalta conceptos clave con negrita estratégica)",
      "desarrollo": "Desarrollo cronológico o de detalles (resalta conceptos clave con negrita estratégica)",
      "actores": "Actores implicados",
      "contexto": "Contexto y antecedentes históricos/técnicos",
      "datos_verificables": "Datos y cifras clave verificables",
      "estado_actual": "Estado actual de los hechos",
      "declaraciones": "Declaraciones oficiales de los actores",
      "consecuencias": "Posibles consecuencias (en formato Markdown estructurado en: 1. Proyecciones a futuro, 2. Precedentes Históricos, 3. Efecto Dominó)",
      "importancia": "Alta, Media o Baja",
      "meta_description": "Breve descripción o síntesis del artículo de menos de 150 caracteres, optimizada para SEO y sin clickbait",
      "fuentes": [
        {
          "nombre": "Nombre de la fuente",
          "url": "URL de la fuente",
          "tipo": "Tipo de fuente",
          "relevancia": "Alta, Media o Baja",
          "fecha_publicacion": "Fecha de publicación"
        }
      ]
    }
  ],
  "informe_sintesis": "Tu síntesis diaria de alto valor en formato Markdown (de 200 a 300 palabras) que combine todo el contexto siguiendo estrictamente la personalidad, tono, formato y estructura de pensamiento."
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
          consecuencias:      noticiaData.consecuencias      || '',
          meta_description:   noticiaData.meta_description   || ''
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
        importancia:        draft.importancia,
        meta_description:   draft.meta_description || ''
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
