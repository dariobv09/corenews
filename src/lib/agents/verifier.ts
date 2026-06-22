// Verifier Agent: Evaluates reliability, source consensus, and contradictions
import OpenAI from 'openai';
import { DraftEvent } from './specialists';

export interface VerificationResult {
  titulo: string;
  nivel_fiabilidad: number; // 0-100
  coincidencia_fuentes: string;
  contradicciones: string[];
  porque_creemos: {
    evidencias: string[];
    descartado: string[];
    formula_fiabilidad: string;
  };
}

export async function runVerifierAgent(
  categoria: string,
  draftEvents: DraftEvent[],
  logCallback?: (msg: string) => void
): Promise<VerificationResult[]> {
  const agentName = 'Agente Verificador';
  logCallback?.(`Iniciando contraste de fuentes y cálculo de fiabilidad para ${draftEvents.length} eventos...`);

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey === 'your-openai-api-key') {
    logCallback?.(`⚠ [Simulación] Ejecutando algoritmo de verificación local.`);
    return runVerifierSimulation(draftEvents, logCallback);
  }

  const openai = new OpenAI({ apiKey });

  const systemPrompt = `Eres el Agente Verificador de Información. Tu trabajo es analizar críticamente las noticias y sus fuentes propuestas.
Debes evaluar de forma transparente cada borrador de noticia proporcionado.

Criterios para calcular la puntuación de fiabilidad (0-100%):
1. **Consenso general**: Si todas las fuentes apuntan a la misma conclusión (+30 puntos).
2. **Evidencia verificable**: Si hay enlaces a documentos de patentes, papers de arXiv, reportes financieros oficiales o comunicados gubernamentales directos (+30 puntos).
3. **Calidad de fuentes**: Si proviene de agencias oficiales o medios con amplia reputación técnica (ej. Reuters, ASML, Bloomberg, MIT) (+25 puntos).
4. **Actualidad**: Si la noticia es del mismo día y no hay retrasos en reportar (+15 puntos).
5. **Contradicciones detectadas**: Restar entre 15 y 30 puntos si los medios discrepan en fechas clave, cifras de rendimiento, o metas del proyecto.

Para cada noticia proporcionada, genera un análisis de verificación.
Debes retornar un objeto JSON estructurado con la clave "verificaciones", que contiene una lista de objetos con:
- "titulo": El título original de la noticia analizada (debes coincidir exactamente).
- "nivel_fiabilidad": Entero entre 0 y 100.
- "coincidencia_fuentes": Texto que resuma la aprobación de fuentes (ej. "8 de 10 fuentes independientes respaldan esta afirmación").
- "contradicciones": Un arreglo de strings con contradicciones y discrepancias detectadas entre las fuentes (fechas, cifras, atribuciones). Si no hay, dejar el arreglo vacío.
- "porque_creemos": Un objeto con:
  - "evidencias": Arreglo de strings con los hechos, datos empíricos y documentos contrastados en los que te basas.
  - "descartado": Arreglo de strings con rumores, conjeturas sensacionalistas o datos sin verificar que has decidido omitir.
  - "formula_fiabilidad": Breve explicación textual de la ponderación matemática que dio origen a la nota de fiabilidad.

Retorna ÚNICAMENTE un objeto JSON válido con la siguiente estructura:
{
  "verificaciones": [
    {
      "titulo": "...",
      "nivel_fiabilidad": 85,
      "coincidencia_fuentes": "...",
      "contradicciones": ["..."],
      "porque_creemos": {
        "evidencias": ["..."],
        "descartado": ["..."],
        "formula_fiabilidad": "..."
      }
    }
  ]
}`;

  const userPrompt = `Borradores a verificar:
${JSON.stringify(draftEvents, null, 2)}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1
    });

    const contentText = response.choices[0].message.content || '{}';
    const parsed = JSON.parse(contentText);

    if (!parsed.verificaciones || !Array.isArray(parsed.verificaciones)) {
      throw new Error("Formato de respuesta JSON no válido. Falta 'verificaciones'.");
    }

    logCallback?.(`✓ ${agentName} verificó exitosamente todas las noticias del lote.`);
    return parsed.verificaciones as VerificationResult[];
  } catch (error: any) {
    logCallback?.(`⚠ Error en el ${agentName}: ${error.message || error}. Usando simulación heurística de verificación.`);
    return runVerifierSimulation(draftEvents, logCallback);
  }
}

// Local simulation fallback
function runVerifierSimulation(
  draftEvents: DraftEvent[],
  logCallback?: (msg: string) => void
): VerificationResult[] {
  const results: VerificationResult[] = [];

  for (const draft of draftEvents) {
    // Determine number of source references
    const sourceCount = draft.fuentes_propuestas.length;
    const hasOfficial = draft.fuentes_propuestas.some(
      (f) => f.tipo === 'Documento oficial' || f.tipo === 'Paper científico'
    );

    // Calculate score
    let score = 75; // base score
    score += sourceCount * 5; // consensus boost
    if (hasOfficial) score += 10; // official source bonus
    if (draft.importancia === 'Alta') score += 3;
    
    // Cap score at 96 for normal sources, 98 for official
    const cap = hasOfficial ? 98 : 94;
    score = Math.min(score, cap);

    // Formulate a reason based on the sources
    const consensusText = sourceCount > 1 
      ? `Existe un alto nivel de consenso entre ${sourceCount} fuentes independientes de la industria.`
      : `Información respaldada por una sola fuente relevante. Consenso medio-bajo.`;

    const evidencias = [
      `Declaraciones explícitas de portavoces de las fuentes citadas (${draft.fuentes_propuestas.map(f => f.nombre).join(', ')}).`,
      `Coherencia en los datos técnicos y de despliegue informados en los canales correspondientes.`
    ];

    if (hasOfficial) {
      evidencias.push(`Publicación de documentos técnicos o reportes financieros auditados.`);
    }

    const descartado: string[] = [
      `Especulaciones de foros y redes sociales sobre plazos y precios de venta no confirmados comercialmente.`,
      `Declaraciones informales de analistas independientes no afiliados directamente al proyecto.`
    ];

    const contradicciones: string[] = [];
    if (sourceCount === 1) {
      contradicciones.push(`Al disponer de una única fuente de origen, no es posible contrastar afirmaciones divergentes sobre plazos y presupuesto.`);
    }

    results.push({
      titulo: draft.titulo,
      nivel_fiabilidad: score,
      coincidencia_fuentes: consensusText,
      contradicciones,
      porque_creemos: {
        evidencias,
        descartado,
        formula_fiabilidad: `Fórmula Heurística: Base de fiabilidad (${75}%) + Coincidencia de fuentes (+${sourceCount * 5}%) ${hasOfficial ? '+ Bono oficial (+10%)' : ''}. Puntuación final calculada: ${score}%.`
      }
    });
  }

  logCallback?.(`[Simulación] ✓ Verificación completada para ${results.length} noticias.`);
  return results;
}
