// Coordinator Agent: Orchestrates the entire multi-agent pipeline
import { Categoria, AgentLog } from '@/types';
import { searchCategoryNews } from './search';
import { runSpecialistAgent } from './specialists';
import { runVerifierAgent } from './verifier';
import { runWriterAgent } from './writer';
import { isSupabaseConfigured, supabaseAdmin } from '../supabase';
import { mockStore } from '../mockStore';
import { syncToGitHub } from '../github';
import { getLatestNews, getProcessedUrlsInLast5Days } from '../data';
import { DraftEvent } from './specialists';
import { VerificationResult } from './verifier';

// In-memory global logs to stream to the UI
const globalLogs = globalThis as unknown as {
  logs: AgentLog[];
  isUpdating: boolean;
  lastUpdated: string | null;
  lastCheckedTime?: number;
  processedUrls?: Set<string>;
};

if (!globalLogs.logs) {
  globalLogs.logs = [];
}
if (globalLogs.isUpdating === undefined) {
  globalLogs.isUpdating = false;
}
if (globalLogs.lastUpdated === undefined) {
  globalLogs.lastUpdated = null;
}
if (!globalLogs.processedUrls) {
  globalLogs.processedUrls = new Set<string>();
}

export function getAgentLogs() {
  return {
    logs: globalLogs.logs,
    isUpdating: globalLogs.isUpdating,
    lastUpdated: globalLogs.lastUpdated
  };
}

export function addAgentLog(
  agent: AgentLog['agent'],
  message: string,
  type: AgentLog['type'] = 'info'
) {
  const log: AgentLog = {
    timestamp: new Date().toISOString(),
    agent,
    message,
    type
  };
  globalLogs.logs.push(log);
  
  // Keep logs capped at last 500 lines to avoid memory leak
  if (globalLogs.logs.length > 500) {
    globalLogs.logs.shift();
  }
  
  console.log(`[${log.agent}] (${log.type.toUpperCase()}) ${log.message}`);
}

export function clearAgentLogs() {
  globalLogs.logs = [];
}

export function getPublicationTimestamp(): string {
  const now = new Date();
  
  // If run early in the morning before 8 AM (e.g. by cron at 7:45 AM),
  // we align the update timestamp to exactly 8:00 AM of today.
  // Otherwise, we use the current actual time.
  const hour = now.getHours();
  if (hour < 8) {
    const pubDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0, 0);
    return pubDate.toISOString();
  }
  return now.toISOString();
}

// Main orchestration task
export async function executeUpdatePipeline(): Promise<{ success: boolean; error?: string }> {
  if (globalLogs.isUpdating) {
    return { success: false, error: 'La actualización ya está en curso.' };
  }

  const isProd = process.env.NODE_ENV === 'production';
  if (isProd && !isSupabaseConfigured()) {
    addAgentLog('Coordinador', '❌ Error crítico: Supabase no está configurado en el entorno de producción. Se cancela el pipeline para evitar pérdida de datos.', 'error');
    return { success: false, error: 'Supabase no está configurado en el entorno de producción.' };
  }

  globalLogs.isUpdating = true;
  clearAgentLogs();
  addAgentLog('Coordinador', 'Iniciando ciclo completo de investigación y verificación multiagente en paralelo...', 'info');

  const categories: Categoria[] = ['ia', 'tecnologia', 'economia', 'politica'];
  const dbType = isSupabaseConfigured() ? 'Supabase' : 'Almacenamiento Local (Fallback)';
  addAgentLog('Sistema', `Destino de base de datos detectado: ${dbType}`, 'info');

  try {
    const promises = categories.map(async (cat) => {
      addAgentLog('Coordinador', `--- PROCESANDO CATEGORÍA: ${cat.toUpperCase()} ---`, 'info');

      // Step 1: Gather info
      const feedItems = await searchCategoryNews(cat, (msg) => {
        addAgentLog('Buscador', `[${cat.toUpperCase()}] ${msg}`, 'info');
      });

      if (feedItems.length === 0) {
        addAgentLog('Coordinador', `⚠ No se encontraron noticias ni semillas para la categoría ${cat}. Omitiendo.`, 'warning');
        return;
      }

      // Filter out duplicate articles processed in the last 5 days
      const processedUrls = await getProcessedUrlsInLast5Days(cat);
      const filteredFeedItems = feedItems.filter((item) => !processedUrls.includes(item.link));

      addAgentLog(
        'Buscador',
        `[${cat.toUpperCase()}] Se filtraron ${feedItems.length - filteredFeedItems.length} artículos duplicados (procesados en los últimos 5 días). Quedan ${filteredFeedItems.length} artículos nuevos.`,
        'info'
      );

      if (filteredFeedItems.length === 0) {
        addAgentLog(
          'Coordinador',
          `⚠ No hay artículos nuevos para procesar en la categoría ${cat} en los últimos 5 días. Omitiendo actualización de agentes para esta categoría.`,
          'warning'
        );
        return;
      }

      // Step 2: Specialists analyze & draft
      let agentName: AgentLog['agent'] = 'Agente IA';
      if (cat === 'tecnologia') agentName = 'Agente Tecnologia';
      else if (cat === 'economia') agentName = 'Agente Economia';
      else if (cat === 'politica') agentName = 'Agente Politica';

      const draftEvents = await runSpecialistAgent(cat, filteredFeedItems, (msg) => {
        addAgentLog(agentName, `[${cat.toUpperCase()}] ${msg}`, 'info');
      });

      if (draftEvents.length === 0) {
        addAgentLog('Coordinador', `⚠ El especialista no generó borradores para ${cat}. Omitiendo.`, 'warning');
        return;
      }

      // Step 3: Verifier checks drafts
      const verifications = await runVerifierAgent(cat, draftEvents, (msg) => {
        addAgentLog('Verificador', `[${cat.toUpperCase()}] ${msg}`, 'info');
      });

      // Step 4: Writer polishes & synthesizes
      const finalOutput = await runWriterAgent(cat, draftEvents, verifications, (msg) => {
        addAgentLog('Redactor', `[${cat.toUpperCase()}] ${msg}`, 'info');
      });

      // Step 5: Save results to Database
      addAgentLog('Coordinador', `Guardando informes y noticias validadas para ${cat} en base de datos...`, 'info');

      if (isSupabaseConfigured() && supabaseAdmin) {
        // Clear and Write everything transactionally via RPC
        addAgentLog('Sistema', `[Supabase] Actualizando base de datos de forma atómica para ${cat}...`, 'info');
        
        const pubDate = getPublicationTimestamp();
        const noticiasRpcData = finalOutput.noticias.map((item) => ({
          ...item.noticia,
          fuentes: item.fuentes || []
        }));

        const { error: rpcError } = await supabaseAdmin.rpc('guardar_datos_categoria', {
          p_categoria: cat,
          p_informe_contenido: finalOutput.informe,
          p_noticias: noticiasRpcData,
          p_fecha_actualizacion: pubDate
        });

        if (rpcError) {
          throw new Error(`Error guardando datos de ${cat} en Supabase vía RPC: ${rpcError.message}`);
        }

        addAgentLog('Sistema', `✓ [Supabase] Datos de ${cat} insertados y limitados exitosamente vía RPC.`, 'success');
      } else {
        // Fallback Local Storage Mode
        const pubDate = getPublicationTimestamp();
        // Write to mockStore
        for (const item of finalOutput.noticias) {
          const addedNoticia = mockStore.addNoticia({
            ...item.noticia,
            fecha_actualizacion: pubDate
          });
          const fuentesToInsert = item.fuentes.map((f) => ({
            ...f,
            noticia_id: addedNoticia.id
          }));
          mockStore.addFuentes(fuentesToInsert);
        }

        // Keep 5 days of history in mockStore and prune anything older
        const thresholdTime = Date.now() - 5 * 24 * 60 * 60 * 1000;
        const oldNewsIds = mockStore.getNoticias(cat)
          .filter((n) => new Date(n.fecha_actualizacion).getTime() < thresholdTime)
          .map((n) => n.id);

        if (oldNewsIds.length > 0) {
          addAgentLog('Sistema', `[MockStore] Depuración histórica: Eliminando ${oldNewsIds.length} noticias con más de 5 días de antigüedad...`, 'info');
          mockStore.deleteNoticias(oldNewsIds);
        }

        // Add daily report (informe) without deleting previous ones
        mockStore.addInforme({
          categoria: cat,
          contenido: finalOutput.informe,
          fecha_generacion: pubDate
        });

        // Prune old reports (> 5 days)
        mockStore.deleteOldInformes(cat, thresholdTime);

        addAgentLog('Sistema', `✓ [MockStore] Datos de ${cat} almacenados e histórico de 5 días depurado con éxito.`, 'success');
      }
    });

    // Execute all category pipelines in parallel
    await Promise.all(promises);

    // Sync current state to GitHub
    await syncToGitHub((msg) => addAgentLog('Sistema', msg, 'info'));

    globalLogs.lastUpdated = new Date().toISOString();
    addAgentLog('Coordinador', '★ Proceso de actualización diaria finalizado con éxito. Centro de inteligencia al día.', 'success');
    globalLogs.isUpdating = false;
    return { success: true };
  } catch (error: any) {
    const errorMsg = error.message || error;
    addAgentLog('Coordinador', `❌ Proceso cancelado debido a un error crítico: ${errorMsg}`, 'error');
    globalLogs.isUpdating = false;
    return { success: false, error: errorMsg };
  }
}

export async function executeRewritePipeline(): Promise<{ success: boolean; error?: string }> {
  if (globalLogs.isUpdating) {
    return { success: false, error: 'La actualización o re-redacción ya está en curso.' };
  }

  globalLogs.isUpdating = true;
  clearAgentLogs();
  addAgentLog('Coordinador', 'Iniciando proceso de re-redacción de todos los artículos existentes con el nuevo prompt...', 'info');

  const categories: Categoria[] = ['ia', 'tecnologia', 'economia', 'politica'];
  const dbType = isSupabaseConfigured() ? 'Supabase' : 'Almacenamiento Local (Fallback)';
  addAgentLog('Sistema', `Destino de base de datos detectado: ${dbType}`, 'info');

  try {
    // 1. Fetch all existing articles
    addAgentLog('Coordinador', 'Recuperando noticias existentes de la base de datos...', 'info');
    const existingNoticias = await getLatestNews();
    addAgentLog('Coordinador', `Se recuperaron ${existingNoticias.length} noticias para re-redactar.`, 'info');

    // 2. Process each category
    const promises = categories.map(async (cat) => {
      // Filter news belonging to the current category
      const catNews = existingNoticias.filter(n => n.categoria === cat);
      if (catNews.length === 0) {
        addAgentLog('Coordinador', `No hay noticias guardadas en la categoría ${cat.toUpperCase()} para re-redactar. Omitiendo.`, 'warning');
        return;
      }

      addAgentLog('Coordinador', `--- RE-REDACTANDO CATEGORÍA: ${cat.toUpperCase()} (${catNews.length} noticias) ---`, 'info');

      // 3. Map news to DraftEvents and VerificationResults
      const draftEvents: DraftEvent[] = catNews.map(n => ({
        titulo: n.titulo,
        subtitulo_borrador: n.subtitulo,
        hecho_principal_borrador: n.hecho_principal,
        desarrollo_borrador: n.desarrollo,
        actores_borrador: n.actores,
        contexto_borrador: n.contexto,
        datos_verificables_borrador: n.datos_verificables,
        estado_actual_borrador: n.estado_actual,
        declaraciones_borrador: n.declaraciones,
        consecuencias_borrador: n.consecuencias,
        importancia: n.importancia,
        fuentes_propuestas: (n.fuentes || []).map(f => ({
          nombre: f.nombre,
          url: f.url,
          tipo: f.tipo,
          relevancia: f.relevancia,
          fecha_publicacion: f.fecha_publicacion
        }))
      }));

      const verifications: VerificationResult[] = catNews.map(n => ({
        titulo: n.titulo,
        nivel_fiabilidad: 100,
        coincidencia_fuentes: 'Fuentes contrastadas y validadas en la publicación original.',
        contradicciones: [],
        porque_creemos: {
          evidencias: ['Validación y contraste de fuentes primarias en la primera redacción.'],
          descartado: [],
          formula_fiabilidad: 'Consenso editorial de la redacción de CoreNews.'
        }
      }));

      // 4. Run the Writer agent (which now uses the new Editor prompt!)
      const finalOutput = await runWriterAgent(cat, draftEvents, verifications, (msg) => {
        addAgentLog('Redactor', `[${cat.toUpperCase()}] ${msg}`, 'info');
      });

      // 5. Save results to Database
      addAgentLog('Coordinador', `Guardando noticias re-redactadas para ${cat} en la base de datos...`, 'info');

      if (isSupabaseConfigured() && supabaseAdmin) {
        addAgentLog('Sistema', `[Supabase] Actualizando base de datos de forma atómica para ${cat}...`, 'info');
        
        const noticiasRpcData = finalOutput.noticias.map((item) => ({
          ...item.noticia,
          fuentes: item.fuentes || []
        }));

        const { error: rpcError } = await supabaseAdmin.rpc('guardar_datos_categoria', {
          p_categoria: cat,
          p_informe_contenido: finalOutput.informe,
          p_noticias: noticiasRpcData
        });

        if (rpcError) {
          throw new Error(`Error guardando datos de ${cat} en Supabase vía RPC: ${rpcError.message}`);
        }

        addAgentLog('Sistema', `✓ [Supabase] Datos de ${cat} insertados y limitados exitosamente vía RPC.`, 'success');
      } else {
        // Fallback Local Storage Mode
        // Clear existing news/informes for this category in mockStore first to replace them
        mockStore.clearNoticiasByCategoria(cat);
        mockStore.clearInformesByCategoria(cat);

        for (const item of finalOutput.noticias) {
          const addedNoticia = mockStore.addNoticia(item.noticia);
          const fuentesToInsert = item.fuentes.map((f) => ({
            ...f,
            noticia_id: addedNoticia.id
          }));
          mockStore.addFuentes(fuentesToInsert);
        }

        mockStore.addInforme({
          categoria: cat,
          contenido: finalOutput.informe
        });

        addAgentLog('Sistema', `✓ [MockStore] Datos de ${cat} re-redactados y almacenados exitosamente.`, 'success');
      }
    });

    // Run rewriting in parallel for all categories
    await Promise.all(promises);

    // Sync changes to GitHub
    await syncToGitHub((msg) => addAgentLog('Sistema', msg, 'info'));

    globalLogs.lastUpdated = new Date().toISOString();
    addAgentLog('Coordinador', '★ Proceso de re-redacción y sincronización con GitHub finalizado con éxito.', 'success');
    globalLogs.isUpdating = false;
    return { success: true };
  } catch (error: any) {
    const errorMsg = error.message || error;
    addAgentLog('Coordinador', `❌ Proceso de re-redacción cancelado por error: ${errorMsg}`, 'error');
    globalLogs.isUpdating = false;
    return { success: false, error: errorMsg };
  }
}

export async function checkAndTriggerUpdateIfNeeded() {
  if (globalLogs.isUpdating) return;

  const now = Date.now();
  if (globalLogs.lastCheckedTime && now - globalLogs.lastCheckedTime < 2 * 60 * 1000) {
    return;
  }
  globalLogs.lastCheckedTime = now;

  try {
    console.log("[AutoUpdate] Iniciando comprobación de noticias nuevas...");
    const existingUrls = new Set<string>();

    if (isSupabaseConfigured() && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('fuentes')
        .select('url');
      if (!error && data) {
        data.forEach((f) => { if (f.url) existingUrls.add(f.url); });
      }
    } else {
      mockStore.getFuentes().forEach((f) => { if (f.url) existingUrls.add(f.url); });
    }

    const categories: Categoria[] = ['ia', 'tecnologia', 'economia', 'politica'];
    let hasNewNews = false;

    for (const cat of categories) {
      const feedItems = await searchCategoryNews(cat, () => {});
      for (const item of feedItems) {
        if (!item.link) continue;
        if (!existingUrls.has(item.link) && !globalLogs.processedUrls!.has(item.link)) {
          console.log(`[AutoUpdate] Nueva noticia relevante detectada en ${cat}: ${item.title}`);
          hasNewNews = true;
          globalLogs.processedUrls!.add(item.link);
        }
      }
    }

    if (hasNewNews) {
      console.log("[AutoUpdate] Nuevas noticias encontradas. Iniciando pipeline de agentes...");
      executeUpdatePipeline().catch((err) => {
        console.error("[AutoUpdate] Error en ejecución del pipeline de agentes:", err);
      });
    } else {
      console.log("[AutoUpdate] No se encontraron noticias nuevas.");
    }
  } catch (error) {
    console.error("[AutoUpdate] Error en la comprobación automática de noticias:", error);
  }
}
