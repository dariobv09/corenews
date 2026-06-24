// Coordinator Agent: Orchestrates the entire multi-agent pipeline
import { Categoria, AgentLog } from '@/types';
import { searchCategoryNews } from './search';
import { runSpecialistAgent } from './specialists';
import { runVerifierAgent } from './verifier';
import { runWriterAgent } from './writer';
import { isSupabaseConfigured, supabaseAdmin } from '../supabase';
import { mockStore } from '../mockStore';

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

      // Step 2: Specialists analyze & draft
      let agentName: AgentLog['agent'] = 'Agente IA';
      if (cat === 'tecnologia') agentName = 'Agente Tecnologia';
      else if (cat === 'economia') agentName = 'Agente Economia';
      else if (cat === 'politica') agentName = 'Agente Politica';

      const draftEvents = await runSpecialistAgent(cat, feedItems, (msg) => {
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
        // Write to mockStore
        for (const item of finalOutput.noticias) {
          const addedNoticia = mockStore.addNoticia(item.noticia);
          const fuentesToInsert = item.fuentes.map((f) => ({
            ...f,
            noticia_id: addedNoticia.id
          }));
          mockStore.addFuentes(fuentesToInsert);
        }

        // Limit count to 5 active news items in mockStore
        const allCatNews = mockStore.getNoticias(cat);
        const impMap: Record<string, number> = { 'Alta': 3, 'Media': 2, 'Baja': 1 };
        const sortedNews = [...allCatNews].sort((a, b) => {
          const impA = impMap[a.importancia] || 0;
          const impB = impMap[b.importancia] || 0;
          if (impA !== impB) return impB - impA;
          return new Date(b.fecha_actualizacion).getTime() - new Date(a.fecha_actualizacion).getTime();
        });

        if (sortedNews.length > 5) {
          const idsToDelete = sortedNews.slice(5).map((n) => n.id);
          addAgentLog('Sistema', `[MockStore] Limitando a 5 noticias. Eliminando ${idsToDelete.length} noticias sobrantes...`, 'info');
          mockStore.deleteNoticias(idsToDelete);
        }

        // Clear and add daily report (informe)
        mockStore.clearInformesByCategoria(cat);
        mockStore.addInforme({
          categoria: cat,
          contenido: finalOutput.informe
        });

        addAgentLog('Sistema', `✓ [MockStore] Datos de ${cat} almacenados y limitados exitosamente en memoria del servidor.`, 'success');
      }
    });

    // Execute all category pipelines in parallel
    await Promise.all(promises);

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
