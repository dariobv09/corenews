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

  globalLogs.isUpdating = true;
  clearAgentLogs();
  addAgentLog('Coordinador', 'Iniciando ciclo completo de investigación y verificación multiagente...', 'info');

  const categories: Categoria[] = ['ia', 'tecnologia', 'economia', 'politica'];
  const dbType = isSupabaseConfigured() ? 'Supabase' : 'Almacenamiento Local (Fallback)';
  addAgentLog('Sistema', `Destino de base de datos detectado: ${dbType}`, 'info');

  try {
    for (const cat of categories) {
      addAgentLog('Coordinador', `--- PROCESANDO CATEGORÍA: ${cat.toUpperCase()} ---`, 'info');

      // Step 1: Gather info
      const feedItems = await searchCategoryNews(cat, (msg) => {
        addAgentLog('Buscador', msg, 'info');
      });

      if (feedItems.length === 0) {
        addAgentLog('Coordinador', `⚠ No se encontraron noticias ni semillas para la categoría ${cat}. Omitiendo.`, 'warning');
        continue;
      }

      // Step 2: Specialists analyze & draft
      let agentName: AgentLog['agent'] = 'Agente IA';
      if (cat === 'tecnologia') agentName = 'Agente Tecnologia';
      else if (cat === 'economia') agentName = 'Agente Economia';
      else if (cat === 'politica') agentName = 'Agente Politica';

      const draftEvents = await runSpecialistAgent(cat, feedItems, (msg) => {
        addAgentLog(agentName, msg, 'info');
      });

      if (draftEvents.length === 0) {
        addAgentLog('Coordinador', `⚠ El especialista no generó borradores para ${cat}. Omitiendo.`, 'warning');
        continue;
      }

      // Step 3: Verifier checks drafts
      const verifications = await runVerifierAgent(cat, draftEvents, (msg) => {
        addAgentLog('Verificador', msg, 'info');
      });

      // Step 4: Writer polishes & synthesizes
      const finalOutput = await runWriterAgent(cat, draftEvents, verifications, (msg) => {
        addAgentLog('Redactor', msg, 'info');
      });

      // Step 5: Save results to Database
      addAgentLog('Coordinador', `Guardando informes y noticias validadas para ${cat} en base de datos...`, 'info');

      if (isSupabaseConfigured() && supabaseAdmin) {
        // Clear previous category records
        addAgentLog('Sistema', `[Supabase] Limpiando noticias e informes previos de ${cat}...`, 'info');
        
        // Deleting from noticias cascades to fuentes
        const { error: delNoticiasError } = await supabaseAdmin
          .from('noticias')
          .delete()
          .eq('categoria', cat);
          
        if (delNoticiasError) throw new Error(`Error limpiando noticias de Supabase: ${delNoticiasError.message}`);

        const { error: delInformesError } = await supabaseAdmin
          .from('informes')
          .delete()
          .eq('categoria', cat);
          
        if (delInformesError) throw new Error(`Error limpiando informes de Supabase: ${delInformesError.message}`);

        // Write final news and sources
        for (const item of finalOutput.noticias) {
          const { noticia, fuentes } = item;
          
          // Insert noticia
          const { data: noticiaData, error: newsInsertError } = await supabaseAdmin
            .from('noticias')
            .insert([noticia])
            .select()
            .single();

          if (newsInsertError) {
            throw new Error(`Error insertando noticia: ${newsInsertError.message}`);
          }

          // Insert fuentes
          if (fuentes && fuentes.length > 0) {
            const fuentesToInsert = fuentes.map((f) => ({
              ...f,
              noticia_id: noticiaData.id
            }));
            
            const { error: fuentesInsertError } = await supabaseAdmin
              .from('fuentes')
              .insert(fuentesToInsert);

            if (fuentesInsertError) {
              addAgentLog('Sistema', `⚠ Error insertando fuentes para la noticia "${noticia.titulo}": ${fuentesInsertError.message}`, 'error');
            }
          }
        }

        // Insert daily report (informe)
        const { error: reportInsertError } = await supabaseAdmin
          .from('informes')
          .insert([{ categoria: cat, contenido: finalOutput.informe }]);

        if (reportInsertError) {
          throw new Error(`Error insertando informe de categoría: ${reportInsertError.message}`);
        }

        addAgentLog('Sistema', `✓ [Supabase] Datos de ${cat} insertados exitosamente.`, 'success');
      } else {
        // Fallback Local Storage Mode
        addAgentLog('Sistema', `[MockStore] Limpiando noticias e informes previos de ${cat}...`, 'info');
        mockStore.clearNoticiasByCategoria(cat);
        mockStore.clearInformesByCategoria(cat);

        // Write to mockStore
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

        addAgentLog('Sistema', `✓ [MockStore] Datos de ${cat} almacenados exitosamente en memoria del servidor.`, 'success');
      }
    }

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
