// Unified Data Access Layer (Supabase / local mockStore)
import { Noticia, Informe, Categoria } from '@/types';
import { isSupabaseConfigured, supabaseAdmin } from './supabase';
import { mockStore } from './mockStore';

// Retrieve all fact-checked news items for a category
export async function getLatestNews(categoria?: Categoria): Promise<Noticia[]> {
  if (isSupabaseConfigured() && supabaseAdmin) {
    try {
      let query = supabaseAdmin
        .from('noticias')
        .select('*, fuentes(*)');

      if (categoria) {
        query = query.eq('categoria', categoria);
      }

      // Order by update date descending
      const { data, error } = await query.order('fecha_actualizacion', { ascending: false });

      if (error) throw error;
      return (data || []) as Noticia[];
    } catch (err) {
      console.error('Error recuperando noticias de Supabase, recurriendo a mockStore:', err);
      return mockStore.getNoticias(categoria);
    }
  }

  // Fallback to local memory store
  return mockStore.getNoticias(categoria);
}

// Retrieve a specific news item with its sources
export async function getNewsById(id: string): Promise<Noticia | null> {
  if (isSupabaseConfigured() && supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('noticias')
        .select('*, fuentes(*)')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Noticia;
    } catch (err) {
      console.error(`Error recuperando noticia ${id} de Supabase, recurriendo a mockStore:`, err);
      return mockStore.getNoticiaById(id) || null;
    }
  }

  return mockStore.getNoticiaById(id) || null;
}

// Retrieve daily reports/synthesis for each category
export async function getLatestReports(): Promise<Record<Categoria, Informe | null>> {
  const categories: Categoria[] = ['ia', 'tecnologia', 'economia', 'politica'];
  const reports: Record<Categoria, Informe | null> = {
    ia: null,
    tecnologia: null,
    economia: null,
    politica: null
  };

  for (const cat of categories) {
    reports[cat] = await getLatestReportByCategory(cat);
  }

  return reports;
}

export async function getLatestReportByCategory(categoria: Categoria): Promise<Informe | null> {
  if (isSupabaseConfigured() && supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('informes')
        .select('*')
        .eq('categoria', categoria)
        .order('fecha_generacion', { ascending: false })
        .limit(1);

      if (error) throw error;
      return data && data.length > 0 ? (data[0] as Informe) : null;
    } catch (err) {
      console.error(`Error recuperando informe ${categoria} de Supabase, recurriendo a mockStore:`, err);
      const mockReports = mockStore.getInformes(categoria);
      return mockReports.length > 0 ? mockReports[0] : null;
    }
  }

  const mockReports = mockStore.getInformes(categoria);
  return mockReports.length > 0 ? mockReports[0] : null;
}

export async function getProcessedUrlsInLast5Days(categoria: Categoria): Promise<string[]> {
  const threshold = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
  
  if (isSupabaseConfigured() && supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('noticias')
        .select('fuentes(url)')
        .eq('categoria', categoria)
        .gte('fecha_actualizacion', threshold);

      if (error) throw error;
      
      const urls = data?.flatMap(n => 
        (n.fuentes as { url: string }[] || [])
          .map(f => f.url)
          .filter(Boolean)
      ) || [];
      
      return urls;
    } catch (err) {
      console.error('Error recuperando URLs procesadas de Supabase, recurriendo a mockStore:', err);
    }
  }

  // Fallback to local memory store
  const thresholdTime = Date.now() - 5 * 24 * 60 * 60 * 1000;
  const noticias = mockStore.getNoticias(categoria)
    .filter(n => new Date(n.fecha_actualizacion).getTime() >= thresholdTime);
  const urls = noticias.flatMap(n => 
    mockStore.getFuentes(n.id)
      .map(f => f.url || '')
      .filter(Boolean)
  );
  return urls;
}

