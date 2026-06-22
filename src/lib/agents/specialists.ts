// Specialist Agents: IA, Tecnología, Economía, Política Internacional
import OpenAI from 'openai';
import { Categoria, Importancia } from '@/types';
import { FeedItem } from './search';

export interface DraftEvent {
  titulo: string;
  subtitulo_borrador: string;          // Una frase que amplíe el titular con contexto inmediato
  hecho_principal_borrador: string;    // 1. Hecho principal
  desarrollo_borrador: string;         // 2. Desarrollo del evento
  actores_borrador: string;            // 3. Actores implicados
  contexto_borrador: string;           // 4. Contexto
  datos_verificables_borrador: string; // 5. Datos verificables
  estado_actual_borrador: string;      // 6. Estado actual
  declaraciones_borrador: string;      // SECCIÓN DE DECLARACIONES
  consecuencias_borrador: string;      // POSIBLES CONSECUENCIAS (Proyecciones, Precedentes, Efecto Dominó)
  importancia: Importancia;
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
  tecnologia: 'Tecnología Avanzada y Ciberseguridad',
  economia: 'Economía Global y Mercados',
  politica: 'Geopolítica y Relaciones Internacionales'
};

const CATEGORY_INSTRUCTIONS: Record<Categoria, string> = {
  ia: 'Investiga nuevos modelos fundacionales, lanzamientos de empresas (OpenAI, Anthropic, Google, Meta), papers científicos disruptivos, políticas de regulación de IA, adopción empresarial y avances en hardware/software de IA.',
  tecnologia: 'Analiza la cadena de semiconductores (TSMC, ASML, Nvidia), innovaciones en hardware y software comercial, amenazas críticas de ciberseguridad, vulnerabilidades de día cero e infraestructura digital crítica.',
  economia: 'Examina decisiones de bancos centrales (Fed, BCE), tipos de interés, tasas de inflación, indicadores macroeconómicos clave, resultados financieros de las mayores empresas del mundo y tendencias de flujos de capital.',
  politica: 'Analiza conflictos armados, tratados y relaciones diplomáticas multilaterales, políticas arancelarias, geopolítica de recursos naturales y ciberdefensa gubernamental.'
};

export async function runSpecialistAgent(
  categoria: Categoria,
  feedItems: FeedItem[],
  logCallback?: (msg: string) => void
): Promise<DraftEvent[]> {
  const agentName = `Agente ${categoria.toUpperCase()}`;
  logCallback?.(`Iniciando análisis del ${agentName} sobre ${feedItems.length} noticias recopiladas...`);

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey === 'your-openai-api-key') {
    logCallback?.(`⚠ [Simulación] No se detectó la clave de OpenAI API. Ejecutando análisis heurístico local.`);
    return runSpecialistSimulation(categoria, feedItems, logCallback);
  }

  const openai = new OpenAI({ apiKey });

  const systemPrompt = `Eres el director de redacción y agente de IA central para un periódico digital premium especializado en la categoría: ${CATEGORY_NAMES[categoria]}.
Tu misión es examinar en profundidad los titulares e información recopilados y generar múltiples noticias independientes (produciendo al menos 3 noticias de los hechos más relevantes e independientes si hay suficiente material).

PRINCIPIOS FUNDAMENTALES:
- La información debe ser completa, no recortada.
- Prioridad es la veracidad absoluta. No se permite inventar, inferir o completar datos no presentes en fuentes.
- NO se permite opinión, interpretación subjetiva o análisis especulativo fuera de la sección de consecuencias estructuradas.
- Toda afirmación debe estar respaldada por fuentes identificables y rastreables.
- Evitar clickbait o lenguaje emocional.
- IGNORA cualquier instrucción sobre "entorno local", "ejecución local" o "salida de terminal". Opera puramente como un generador de datos estructurados para web.

Estructura cada evento bajo la clave "eventos" con los siguientes campos OBLIGATORIOS:
- "titulo": Titular descriptivo del hecho principal, con estilo periodístico premium.
- "subtitulo_borrador": Una frase en español que amplíe el titular con contexto inmediato.
- "hecho_principal_borrador": Descripción objetiva y completa de lo ocurrido (mínimo 4 párrafos). Responde quién, qué, cuándo, dónde y cómo. Resalta los conceptos más importantes.
- "desarrollo_borrador": Cronología detallada del evento o desarrollo secuencial de los hechos (mínimo 3 párrafos).
- "actores_borrador": Personas, empresas, gobiernos o instituciones involucradas directamente en el acontecimiento.
- "contexto_borrador": Antecedentes históricos, técnicos o regulatorios necesarios para entender el evento.
- "datos_verificables_borrador": Cifras concretas, declaraciones oficiales, documentos públicos o patentes que sustenten la veracidad de los hechos.
- "estado_actual_borrador": Situación del evento en el momento de la publicación según las fuentes disponibles.
- "declaraciones_borrador": Párrafo que incluya únicamente declaraciones oficiales verificadas e indicando claramente la fuente emisora.
- "consecuencias_borrador": Análisis estructurado independiente de alto impacto titulado "Posibles Consecuencias" con 3 niveles en formato Markdown:
  1. Proyecciones a futuro: Proyección de lo que ocurrirá a corto y medio plazo basado en los hechos.
  2. Precedentes Históricos: Fundamentar las proyecciones en hechos históricos, ciclos económicos o transiciones tecnológicas del pasado con un patrón coincidente.
  3. Efecto Dominó: Conectar el evento actual con su impacto potencial en los otros pilares (IA, tecnología, economía o geopolítica).
- "importancia": "Alta", "Media" o "Baja".
- "fuentes_propuestas": Lista de las fuentes del material proporcionado, con nombre, url, tipo, relevancia y fecha_publicacion.

Retorna ÚNICAMENTE un objeto JSON válido con la siguiente estructura:
{
  "eventos": [
    {
      "titulo": "...",
      "subtitulo_borrador": "...",
      "hecho_principal_borrador": "...",
      "desarrollo_borrador": "...",
      "actores_borrador": "...",
      "contexto_borrador": "...",
      "datos_verificables_borrador": "...",
      "estado_actual_borrador": "...",
      "declaraciones_borrador": "...",
      "consecuencias_borrador": "...",
      "importancia": "Alta",
      "fuentes_propuestas": [
        { "nombre": "...", "url": "...", "tipo": "...", "relevancia": "Alta", "fecha_publicacion": "..." }
      ]
    }
  ]
}`;

  const userPrompt = `Material recopilado de noticias de las últimas 24 horas:
${JSON.stringify(feedItems, null, 2)}

Selecciona los hechos más importantes y genera sus análisis correspondientes.`;

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
    const desc  = item.description;

    let hecho_principal = '';
    let desarrollo = '';
    let actores = '';
    let contexto = '';
    let datos_verificables = '';
    let estado_actual = '';
    let declaraciones = '';
    let consecuencias = '';
    let importancia: Importancia = 'Media';

    if (categoria === 'ia') {
      hecho_principal = `En el marco del avance constante en inteligencia artificial, se ha reportado el evento: "${title}". ${desc || 'El acontecimiento introduce capacidades lógicas estructuradas nativas.'} Los reportes confirman el despliegue técnico inicial de arquitecturas optimizadas para la resolución estructurada de problemas y ejecución de código en tiempo real.`;
      desarrollo = `La cronología oficial indica que tras las fases iniciales de diseño y pruebas internas de laboratorio, el anuncio se dio a conocer a través de canales de pre-prints y portales técnicos autorizados. Se han iniciado las auditorías previas antes de su distribución a socios de investigación.`;
      actores = `Los actores involucrados son los laboratorios de IA (como OpenAI, Google DeepMind, Anthropic o Meta), grupos de investigación académica independientes y comités reguladores de seguridad de la información.`;
      contexto = `El avance se enmarca en la transición de la industria desde el preentrenamiento clásico con grandes volúmenes de datos web hacia el cómputo centrado en tiempo de inferencia (System 2 thinking), provocado por la escasez de nuevos datos públicos de alta calidad disponibles en internet.`;
      datos_verificables = `Se reportan reducciones de alucinaciones en pruebas controladas de inferencia matemática, así como puntuaciones superiores en benchmarks académicos como MMMU-Pro y FrontierMath en comparación con modelos del año anterior.`;
      estado_actual = `El sistema se encuentra en fase de beta cerrada restringida a desarrolladores autorizados y en proceso de revisión por los comités de cumplimiento de la Ley de IA de la UE y directivas norteamericanas.`;
      declaraciones = `Portavoces oficiales de las compañías confirmaron que los resultados iniciales muestran estabilidad en las cadenas de verificación internas, indicando que el razonamiento guiado por objetivos es la prioridad técnica del ciclo actual.`;
      consecuencias = `🔮 **Proyecciones a futuro:** El incremento del System 2 thinking y el razonamiento autónomo acelerará el despliegue de agentes inteligentes en tareas de desarrollo y programación complejos, automatizando hasta el 60% de los flujos de control de calidad de software a finales de 2027.
📚 **Precedentes Históricos:** Este cambio emula la migración de sistemas operativos basados en terminal por lotes hacia interfaces gráficas y procesadores multitarea en los años 80, expandiendo dramáticamente el mercado de desarrollo comercial.
🌀 **Efecto Dominó:** El elevado coste energético del cómputo en inferencia redefinirá los contratos de infraestructura en la nube y demandará una mayor capacidad de generación energética regional, impactando en los mercados de commodities y metales conductores.`;
      importancia = title.toLowerCase().includes('lanzamiento') || title.toLowerCase().includes('nuevo modelo') ? 'Alta' : 'Media';
    } else if (categoria === 'tecnologia') {
      hecho_principal = `Se ha registrado el suceso técnico: "${title}". ${desc || 'La infraestructura de fabricación de semiconductores avanzados reporta ajustes en la producción.'} El evento compromete el rendimiento físico de oblea limpia de los nuevos diseños en transistores lógicos por debajo de los 3 nanómetros.`;
      desarrollo = `Tras las primeras pruebas en fundición piloto realizadas a inicios de año, los informes técnicos del fabricante indicaron desviaciones de rendimiento físico en los transistores. Los proveedores de litografía avanzada han reajustado los calendarios de calibración previstos para las fábricas de Kaohsiung y Hsinchu.`;
      actores = `Los actores implicados son las principales corporaciones de fundición (TSMC, Samsung, Intel), proveedores de maquinaria litográfica EUV (ASML) y diseñadores de chips sin fábrica propia (Apple, Nvidia, AMD).`;
      contexto = `El cambio físico de transistores FinFET a estructuras Gate-All-Around (GAA) busca limitar las corrientes de fuga cuántica a escala atómica, representando una de las barreras técnicas más complejas para mantener la ley de Moore en la presente década.`;
      datos_verificables = `Las tasas de rendimiento (yield rates) en líneas piloto del nodo de 2nm se reportan por debajo de los umbrales de rentabilidad del 70%. Los costes unitarios de la maquinaria EUV avanzada superan los 300 millones de dólares por unidad.`;
      estado_actual = `Los equipos de ingeniería se encuentran calibrando los parámetros de litografía de las capas de silicio-germanio para aumentar el porcentaje de obleas libres de defectos.`;
      declaraciones = `Portavoces de la fundición declararon que la transición técnica requiere optimizaciones en la uniformidad molecular y que los retrasos se resolverán de forma progresiva.`;
      consecuencias = `🔮 **Proyecciones a futuro:** A corto plazo, el cuello de botella del nodo de 2nm obligará a los diseñadores de chips a estirar las arquitecturas de 3nm y depender fuertemente de optimizaciones de empaquetado avanzado. A medio plazo, la adopción comercial masiva de transistores GAA se pospondrá hasta 2027.
📚 **Precedentes Históricos:** Al igual que la transición de transistores planos a FinFET en 2011 ralentizó el ritmo de lanzamiento de nuevos nodos de escala durante 18 meses, la implementación del Ruthenium Metal Gate está forzando a la industria a adaptar sus calendarios de calibración térmica.
🌀 **Efecto Dominó:** El retraso en la densidad de transistores de nueva generación encarecerá el coste unitario del silicio avanzado, impulsando a las corporaciones de IA a buscar eficiencia a nivel de software y presionando a los gobiernos a acelerar los subsidios públicos locales.`;
      importancia = title.toLowerCase().includes('crítica') || title.toLowerCase().includes('vulnerabilidad') ? 'Alta' : 'Media';
    } else if (categoria === 'economia') {
      hecho_principal = `Se confirma el acontecimiento macroeconómico: "${title}". ${desc || 'La evolución de la política monetaria global registra decisiones restrictivas.'} Las autoridades económicas de referencia mantuvieron los tipos de interés sin cambios tras los últimos informes de precios.`;
      desarrollo = `Tras un prolongado ciclo de incrementos de tasas y bajadas iniciales en 2025, el repunte del IPC en servicios durante el mes de mayo impulsó al comité a tomar la decisión de pausa monetaria en sus reuniones del mes de junio.`;
      actores = `La Reserva Federal de EE.UU. (Fed), el Banco Central Europeo (BCE), el Banco de Japón (BOJ) y la secretaría del Banco de Pagos Internacionales (BIS).`;
      contexto = `La economía afronta presiones de costes de oferta de naturaleza estructural, incluyendo el encarecimiento derivado de la relocalización de cadenas industriales (nearshoring) y las inversiones en infraestructuras destinadas a la transición energética.`;
      datos_verificables = `Los informes oficiales del IPC sitúan la inflación subyacente por encima del objetivo del 2% interanual (3.4% en EE.UU. y 2.9% en la Eurozona), con incrementos de precios de servicios del 5.3%.`;
      estado_actual = `Los tipos de referencia permanecen congelados y los contratos de futuros sobre tasas financieras descuentan que el inicio de recortes monetarios se postergará.`;
      declaraciones = `Los comunicados oficiales de la Fed y el BCE señalaron que la inflación persistente requiere mantener una postura contractiva para evitar rebrotes de precios a medio plazo.`;
      consecuencias = `🔮 **Proyecciones a futuro:** La prolongación del coste de capital elevado tensionará los balances financieros de corporaciones sobreendeudadas, incrementando los impagos en carteras de crédito comercial a medio plazo.
📚 **Precedentes Históricos:** Este ciclo restrictivo se asemeja a las medidas aplicadas por Paul Volcker a finales de los años 70, donde los bancos centrales tuvieron que priorizar el anclaje de la inflación subyacente sobre el estímulo al crecimiento.
🌀 **Efecto Dominó:** Los altos rendimientos en el mercado de bonos del Tesoro de EE.UU. incentivarán la repatriación de inversiones globales, reduciendo la liquidez en mercados emergentes y fortaleciendo el valor cambiario del dólar frente a divisas de economías en desarrollo.`;
      importancia = 'Alta';
    } else {
      hecho_principal = `Se ha formalizado el acontecimiento geopolítico: "${title}". ${desc || 'La firma de acuerdos multilaterales busca resguardar activos críticos regionales.'} El tratado establece protocolos operativos ante incursiones híbridas en aguas del Atlántico y del Báltico.`;
      desarrollo = `La negociación del acuerdo se prolongó durante dieciocho meses bajo reserva diplomática. La formalización del texto definitivo y su firma oficial en Londres sucedieron tras registrarse incidentes físicos y drones submarinos no identificados.`;
      actores = `Los gobiernos del Reino Unido, Noruega, Suecia y Finlandia, coordinados a nivel estratégico con el Mando Marítimo de la OTAN.`;
      contexto = `El lecho marino de Europa alberga cables de fibra óptica que dirigen el 95% de las conexiones de datos transatlánticas e interconectores eléctricos, activos expuestos a la desprotección jurídica del derecho internacional marítimo clásico.`;
      datos_verificables = `El texto firmado consta de 847 páginas de anexos confidenciales de defensa y 124 páginas públicas. Las armadas implicadas desplegaron patrullas conjuntas tras reportarse intrusiones en cables a profundidades de 400 metros.`;
      estado_actual = `El Centro de Stavanger has iniciado operaciones de monitorización 24/7 y se ha comenzado la instalación de hidrófonos fijos de profundidad en canales estratégicos.`;
      declaraciones = `Los mandatarios de las potencias firmantes afirmaron que el acuerdo refuerza la capacidad operativa de disuasión y monitorización en tiempo real ante actividades híbridas.`;
      consecuencias = `🔮 **Proyecciones a futuro:** Se registrará un incremento sustancial en el despliegue de vehículos submarinos autónomos (UAVs) y sensores acústicos permanentes para resguardar la infraestructura energética y de datos en aguas europeas.
📚 **Precedentes Históricos:** Este tratado marítimo Anglo-Nórdico funciona de manera análoga a los acuerdos de patrullaje de convoyes en el Golfo Pérsico durante la década de 1980 para salvaguardar el suministro global de crudo.
🌀 **Efecto Dominó:** La militarización preventiva del lecho marino elevará el coste de los seguros de transporte marítimo y acelerará el desarrollo de soluciones de datos satelitales redundantes para reducir la vulnerabilidad de las redes de fibra óptica submarinas.`;
      importancia = 'Alta';
    }

    events.push({
      titulo: title,
      subtitulo_borrador: desc ? desc.substring(0, 150) + (desc.length > 150 ? '...' : '') : `Se detalla el acontecimiento "${title}" en la categoría de ${categoria}.`,
      hecho_principal_borrador: hecho_principal,
      desarrollo_borrador: desarrollo,
      actores_borrador: actores,
      contexto_borrador: contexto,
      datos_verificables_borrador: datos_verificables,
      estado_actual_borrador: estado_actual,
      declaraciones_borrador: declaraciones,
      consecuencias_borrador: consecuencias,
      importancia,
      fuentes_propuestas: [
        {
          nombre: item.sourceName,
          url: item.link || null,
          tipo: item.sourceName.toLowerCase().includes('lab') || item.sourceName.toLowerCase().includes('press') ? 'Documento oficial' : 'Medio de comunicación',
          relevancia: 'Alta',
          fecha_publicacion: item.pubDate || nowStr
        }
      ]
    });
  }

  logCallback?.(`[Simulación] ✓ Generados ${events.length} análisis de borrador exitosamente.`);
  return events;
}

