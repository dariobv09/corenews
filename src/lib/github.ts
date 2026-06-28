import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { getLatestNews } from './data';
import { mockStore } from './mockStore';
import { isSupabaseConfigured, supabaseAdmin } from './supabase';
import { Categoria, Informe } from '@/types';

/**
 * Exports the current database state (from Supabase or local memory)
 * to `src/lib/mockStore_data.json` so that it is always tracked by Git.
 */
export async function exportDatabaseToLocalFile(logCallback?: (msg: string) => void): Promise<void> {
  logCallback?.('Exportando estado de la base de datos a mockStore_data.json...');
  try {
    const categories: Categoria[] = ['ia', 'tecnologia', 'economia', 'politica'];
    
    // 1. Fetch all news (with nested sources)
    const rawNoticias = await getLatestNews();
    
    // 2. Extract sources and clean news objects
    const fuentes: any[] = [];
    const noticias = rawNoticias.map((n) => {
      const { fuentes: nFuentes, ...noticiaData } = n;
      if (nFuentes && Array.isArray(nFuentes)) {
        nFuentes.forEach((f) => {
          fuentes.push({
            ...f,
            noticia_id: n.id
          });
        });
      }
      return noticiaData;
    });

    // 3. Fetch latest reports (informes) for each category
    const informes: Informe[] = [];
    for (const cat of categories) {
      let report: Informe | null = null;
      if (isSupabaseConfigured() && supabaseAdmin) {
        const { data, error } = await supabaseAdmin
          .from('informes')
          .select('*')
          .eq('categoria', cat)
          .order('fecha_generacion', { ascending: false })
          .limit(1);
        if (!error && data && data.length > 0) {
          report = data[0] as Informe;
        }
      } else {
        const mockReports = mockStore.getInformes(cat);
        if (mockReports.length > 0) {
          report = mockReports[0];
        }
      }

      if (report) {
        informes.push(report);
      }
    }

    // 4. Save to mockStore_data.json
    const filePath = path.join(process.cwd(), 'src', 'lib', 'mockStore_data.json');
    const dataToSave = {
      noticias,
      fuentes,
      informes
    };

    fs.writeFileSync(filePath, JSON.stringify(dataToSave, null, 2), 'utf-8');
    logCallback?.(`✓ Base de datos exportada correctamente a ${filePath}`);
    
    // Update local mockStore in-memory cache to stay in sync
    if (typeof window === 'undefined') {
      try {
        const globalForStore = globalThis as unknown as {
          noticias: any[];
          fuentes: any[];
          informes: any[];
        };
        globalForStore.noticias = noticias;
        globalForStore.fuentes = fuentes;
        globalForStore.informes = informes;
      } catch (e) {
        // Safe to ignore
      }
    }
  } catch (error: any) {
    console.error('Error exportando base de datos a archivo local:', error);
    logCallback?.(`⚠ Error al exportar base de datos: ${error.message || error}`);
  }
}

/**
 * Commits mockStore_data.json and pushes it to the GitHub repository automatically.
 */
export async function syncToGitHub(logCallback?: (msg: string) => void): Promise<void> {
  logCallback?.('Iniciando sincronización automática con GitHub...');
  
  try {
    const cwd = process.cwd();
    
    // 1. Export database first to make sure mockStore_data.json is up-to-date
    await exportDatabaseToLocalFile(logCallback);

    // 2. Check if git is available and has remote
    try {
      execSync('git remote -v', { cwd, stdio: 'ignore' });
    } catch {
      logCallback?.('⚠ Git no está disponible o no tiene repositorios remotos configurados.');
      return;
    }

    // 3. Check git status to see if there are any changes in mockStore_data.json or other relevant files
    const status = execSync('git status --porcelain src/lib/mockStore_data.json', { cwd, encoding: 'utf8' });
    if (!status.trim()) {
      logCallback?.('No hay cambios en los artículos para enviar a GitHub (repositorio al día).');
      return;
    }

    logCallback?.('Cambios detectados en mockStore_data.json. Realizando git commit...');
    
    // 4. Add mockStore_data.json to index
    execSync('git add src/lib/mockStore_data.json', { cwd, stdio: 'ignore' });

    // 5. Commit
    const commitMessage = `Actualización automática de artículos: ${new Date().toISOString()}`;
    execSync(`git commit -m "${commitMessage}"`, { cwd, stdio: 'ignore' });

    logCallback?.('Enviando cambios a GitHub (git push origin main)...');
    
    // 6. Push
    execSync('git push origin main', { cwd, stdio: 'ignore' });
    logCallback?.('✓ Sincronización con GitHub completada con éxito.');
  } catch (error: any) {
    console.error('Error en la sincronización con GitHub:', error);
    logCallback?.(`❌ Error en la sincronización con GitHub: ${error.message || error}`);
  }
}
