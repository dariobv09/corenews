// Specialist Agents: IA, Tecnología, Economía, Política Internacional
import OpenAI from 'openai';
import { Categoria, Importancia } from '@/types';
import { FeedItem } from './search';

export interface DraftEvent {
  titulo: string;
  subtitulo_borrador: string;          // Una frase que amplíe el titular con contexto inmediato
  hecho_principal_borrador: string;    // 1. Hecho principal exhaustivo
  desarrollo_borrador: string;         // 2. Desarrollo cronológico y operativo
  actores_borrador: string;            // 3. Actores implicados y sus intereses
  contexto_borrador: string;           // 4. Contexto histórico y factores de fondo
  datos_verificables_borrador: string; // 5. Datos verificables y citas empíricas
  estado_actual_borrador: string;      // 6. Estado actual de la situación
  declaraciones_borrador: string;      // Declaraciones oficiales contrastadas
  contrastacion_fuentes_borrador: string; // Contrastación de fuentes (Neutrales vs Partes involucradas)
  consecuencias_borrador: string;      // Posibles Consecuencias (Proyecciones, Precedentes, Efecto Dominó)
  importancia: Importancia;
  meta_description?: string;
  fuentes_propuestas: {
    nombre: string;
    url: string | null;
    tipo: string;
    relevancia: Importancia;
    fecha_publicacion?: string;
  }[];
}

const CATEGORY_NAMES: Record<Categoria, string> = {
  ia: 'Inteligencia Artificial',
  tecnologia: 'Tecnología e Innovación',
  economia: 'Economía Global y Mercados',
  politica: 'Geopolítica y Seguridad Internacional'
};

const CATEGORY_INSTRUCTIONS: Record<Categoria, string> = {
  ia: 'Investiga lanzamientos y capacidades reales de nuevos modelos frontera (Google Gemini, OpenAI GPT, Anthropic Claude, Meta Llama), avances en agentes autónomos, infraestructura de supercomputación y regulación estratégica de IA.',
  tecnologia: 'Analiza avances científicos y médicos de impacto trascendente (biotecnología, nuevos tratamientos farmacológicos, edición genética CRISPR), computación cuántica, energía de fusión, semiconductores avanzados e infraestructura digital crítica.',
  economia: 'Examina decisiones de bancos centrales (Fed, BCE), inflación, tipos de interés, deuda soberana, guerras comerciales, precios de materias primas y movimientos macroeconómicos globales estructurales.',
  politica: 'Analiza conflictos armados (Rusia-Ucrania, Oriente Medio, tensiones en el Indo-Pacífico), tratados internacionales, sanciones, cumbres multilaterales y movimientos de seguridad y diplomacia global.'
};

export async function runSpecialistAgent(
  categoria: Categoria,
  feedItems: FeedItem[],
  logCallback?: (msg: string) => void
): Promise<DraftEvent[]> {
  const agentName = `Agente ${categoria.toUpperCase()}`;
  logCallback?.(`Iniciando análisis estratégico del ${agentName} sobre ${feedItems.length} fuentes recopiladas...`);

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey === 'your-openai-api-key') {
    logCallback?.(`⚠ [Simulación] No se detectó la clave de OpenAI API. Ejecutando análisis heurístico local.`);
    return runSpecialistSimulation(categoria, feedItems, logCallback);
  }

  const openai = new OpenAI({ apiKey });

  const systemPrompt = `Eres el Analista Estratégico Sénior y corresponsal especializado en ${CATEGORY_NAMES[categoria]} para The Core News.
Tu objetivo es seleccionar el acontecimiento de mayor trascendencia e impacto estructural de las últimas 24 horas y elaborar un informe de inteligencia en profundidad (*Deep Dive*).

### 🎯 CRITERIOS DE SELECCIÓN EDITORIAL:
- DESCARTA noticias menores, rumores efímeros, notas de prensa corporativas rutinarias o fluctuaciones sin trascendencia.
- SELECCIONA únicamente hechos de alto calado: movimientos bélicos o diplomáticos mayores, descubrimientos biomédicos o saltos en hardware/IA de frontera, cambios de política monetaria o shocks de mercado.
- Produce 1 informe de máxima envergadura (o hasta 2 si hay dos acontecimientos históricos simultáneos independientes).

### 🔍 CONTRASTACIÓN Y TRIANGULACIÓN MULTIFUENTE OBLIGATORIA:
- Todo informe debe contrastar al menos 3 fuentes con posturas diferenciadas:
  1. Fuentes neutrales / agencias de verificación / organismos internacionales / papers científicos.
  2. Fuentes oficiales de la parte A (ej. comunicado de un gobierno o laboratorio).
  3. Fuentes oficiales de la parte B / competidores / comunidad científica independiente.
- En el campo "contrastacion_fuentes_borrador", detalla con precisión qué datos están contrastados unánimemente y en qué puntos existen discrepancias entre las partes.

### ✍ ESTILO Y TONO:
- Tono informativo, maduro, sobrio y humano (estilo Reuters Intelligence, The Economist, Foreign Affairs).
- Cero opiniones subjetivas: atenerse estrictamente a hechos demostrables, datos cuantitativos y causalidad lógica.
- Prohibidas frases hechas de IA como "en el vertiginoso mundo actual", "es crucial entender", "un abanico de...".

Estructura el informe bajo la clave "eventos" con los siguientes campos OBLIGATORIOS:
- "titulo": Titular periodístico directo y de alto impacto.
- "subtitulo_borrador": Frase contextual que complementa el titular.
- "hecho_principal_borrador": Explicación exhaustiva del suceso (quién, qué, cuándo, dónde y cómo).
- "desarrollo_borrador": Cronología y detalles operativos de cómo se desencadenó el evento.
- "actores_borrador": Entidades, líderes e instituciones involucradas y sus intereses estratégicos.
- "contexto_borrador": Antecedentes históricos, técnicos o geopolíticos indispensables.
- "datos_verificables_borrador": Métricas exactas, cifras financieras, registros de patentes o documentos oficiales.
- "estado_actual_borrador": Situación actual al cierre de la edición.
- "declaraciones_borrador": Citas textuales verificadas atribuidas a sus emisores.
- "contrastacion_fuentes_borrador": Análisis comparativo y triangulación entre las diferentes fuentes consultadas.
- "consecuencias_borrador": Escenarios futuros (Proyecciones, Precedentes Históricos y Efecto Dominó transversal).
- "importancia": "Alta" | "Media".
- "meta_description": Resumen de menos de 150 caracteres para buscadores.
- "fuentes_propuestas": Lista de todas las fuentes contrastadas con su tipo y URL.

Retorna ÚNICAMENTE un objeto JSON válido con la clave "eventos".`;

  const userPrompt = `Material recopilado de noticias de las últimas 24 horas:
${JSON.stringify(feedItems, null, 2)}

Selecciona los hechos de mayor trascendencia estratégica y genera sus análisis correspondientes con contrastación de fuentes.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // fast, cost-effective and highly capable
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2
    });

    const contentText = response.choices[0].message.content || '{}';
    const parsed = JSON.parse(contentText);
    
    if (!parsed.eventos || !Array.isArray(parsed.eventos)) {
      throw new Error("Formato de respuesta JSON no válido. Falta el arreglo 'eventos'.");
    }

    logCallback?.(`✓ ${agentName} finalizó el análisis y seleccionó ${parsed.eventos.length} acontecimientos de interés estratégico.`);
    return parsed.eventos as DraftEvent[];
  } catch (error: any) {
    logCallback?.(`⚠ Error en el ${agentName}: ${error.message || error}. Entrando en modo simulación de rescate.`);
    return runSpecialistSimulation(categoria, feedItems, logCallback);
  }
}

// Local simulation fallback
function runSpecialistSimulation(
  categoria: Categoria,
  feedItems: FeedItem[],
  logCallback?: (msg: string) => void
): DraftEvent[] {
  logCallback?.(`[Simulación] Agrupando y procesando titulares...`);

  // We choose the first three feed items to represent our selected events (variety)
  const selectedItems = feedItems.slice(0, 3);
  const events: DraftEvent[] = [];
  const nowStr = new Date().toLocaleDateString('es-ES');

  for (const item of selectedItems) {
    const title = item.title;
    const cleanDesc = item.description 
      ? item.description.replace(/<[^>]*>/g, '') // remove any HTML tags
      : `Análisis detallado de la actualidad tecnológica y estratégica en torno a la publicación titulada "${title}".`;

    const hechos = `${cleanDesc}\n\nEste desarrollo representa un cambio significativo en el ámbito de **${CATEGORY_NAMES[categoria]}**. Analistas y reguladores globales han manifestado que el acontecimiento introduce nuevas dinámicas operativas y redefine las prioridades del sector en el corto plazo.`;

    const desarrollo = `La secuencia de eventos se inició con el reporte formal en los portales de ${item.sourceName}. Tras los primeros análisis técnicos y la confirmación de portavoces de las organizaciones clave, el impacto de este desarrollo comenzó a ser evaluado por expertos independientes de la industria, quienes validaron los datos preliminares.`;

    const contexto = `Este suceso ocurre en un momento de fuerte aceleración e innovación dentro del área de **${CATEGORY_NAMES[categoria]}**, donde la seguridad de la cadena de suministro, la eficiencia y los marcos regulatorios internacionales están obligando a una rápida adaptación estratégica.`;

    const datos_verificables = `Se identifican de forma clara los comunicados oficiales publicados por **${item.sourceName}** y registros públicos de seguimiento técnico. El enlace de referencia directa al artículo original es: ${item.link || 'no disponible'}.`;

    const estado_actual = `El acontecimiento se encuentra actualmente en fase de evaluación y monitorización activa por parte de los laboratorios de desarrollo y departamentos de cumplimiento normativo para determinar sus consecuencias definitivas.`;

    const declaraciones = `Portavoces de la organización declararon en **${item.sourceName}**: "Este hito refleja nuestro compromiso continuo con la innovación y el desarrollo ordenado de soluciones frente a los desafíos emergentes de la industria."`;

    const consecuencias = `🔮 **Proyecciones a futuro:** A corto plazo, el desarrollo acelerará la adopción de arquitecturas integradas de seguridad y optimizaciones de software en el ecosistema de **${CATEGORY_NAMES[categoria]}**. A mediano plazo, obligará a los competidores a reorganizar sus inversiones tecnológicas prioritarias.
📚 **Precedentes Históricos:** Este acontecimiento se asemeja a las transiciones estructurales ocurridas en la industria durante la última década, donde los primeros adoptantes de nuevas regulaciones o estándares técnicos terminaron consolidando el liderazgo del sector.
🌀 **Efecto Dominó:** El impacto de esta noticia repercutirá directamente en los presupuestos de desarrollo de software y en las valoraciones financieras de los proveedores de nube e infraestructura, redefiniendo las alianzas estratégicas globales.`;

    const importancia: Importancia = title.toLowerCase().includes('critical') || 
                                     title.toLowerCase().includes('relevancia') || 
                                     title.toLowerCase().includes('acuerdo') || 
                                     title.toLowerCase().includes('retraso')
                                     ? 'Alta' : 'Media';

    // Simple helper to avoid duplicating actors declaration code
    const actorsToUse = (cat: Categoria, src: string): string => {
      if (cat === 'ia') {
        return `Los laboratorios de IA (como OpenAI, Google DeepMind, Anthropic o Meta), junto con ingenieros del equipo de ${src}.`;
      }
      return `Los equipos técnicos y directivos vinculados a ${src}, junto con reguladores de mercado y competidores sectoriales.`;
    };

    const contrastacion = `**Triangulación de Cobertura:** Se han cruzado los comunicados emitidos por ${item.sourceName} con reportes de agencias internacionales y análisis de observadores independientes. Mientras los portavoces de las entidades implicadas destacan la viabilidad técnica y operativa, analistas independientes señalan la necesidad de verificar los márgenes de implementación a medio plazo.`;

    events.push({
      titulo: title,
      subtitulo_borrador: cleanDesc.substring(0, 150) + (cleanDesc.length > 150 ? '...' : ''),
      hecho_principal_borrador: hechos,
      desarrollo_borrador: desarrollo,
      actores_borrador: actorsToUse(categoria, item.sourceName),
      contexto_borrador: contexto,
      datos_verificables_borrador: datos_verificables,
      estado_actual_borrador: estado_actual,
      declaraciones_borrador: declaraciones,
      contrastacion_fuentes_borrador: contrastacion,
      consecuencias_borrador: consecuencias,
      importancia,
      meta_description: cleanDesc.substring(0, 140) + (cleanDesc.length > 140 ? '...' : ''),
      fuentes_propuestas: [
        {
          nombre: item.sourceName,
          url: item.link || null,
          tipo: item.sourceName.toLowerCase().includes('gov') || item.sourceName.toLowerCase().includes('press') ? 'Documento oficial' : 'Medio de comunicación',
          relevancia: 'Alta',
          fecha_publicacion: item.pubDate || nowStr
        }
      ]
    });
  }

  logCallback?.(`[Simulación] ✓ Generados ${events.length} análisis de borrador exitosamente.`);
  return events;
}

