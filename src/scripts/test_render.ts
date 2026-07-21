import { supabaseAdmin } from '../lib/supabase';

async function main() {
  console.log('--- SIMULANDO CONSULTA DE PÁGINA DE ADMINISTRACIÓN ---');
  try {
    const now = new Date();
    const madridDateStr = now.toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' });
    const madridTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Madrid' }));
    const diffMs = madridTime.getTime() - now.getTime();
    const todayStart = new Date(new Date(`${madridDateStr}T00:00:00`).getTime() - diffMs).toISOString();

    console.log(`Fecha inicio hoy (Madrid): ${todayStart}`);

    console.log('1. Consultando slides...');
    const { data: slidesData, error: slidesError } = await supabaseAdmin
      .from('carousel_slides')
      .select('*, noticias(*)')
      .gte('created_at', todayStart)
      .order('created_at', { ascending: false });

    if (slidesError) throw slidesError;

    console.log(`✓ Encontrados ${slidesData?.length || 0} slides.`);

    const slides = (slidesData || []).map((s: any) => ({
      id: s.id,
      noticia_id: s.noticia_id,
      categoria: s.categoria,
      slide_order: s.slide_order,
      image_url: s.image_url,
      created_at: s.created_at,
      noticia: s.noticias
    }));

    console.log('2. Consultando noticias...');
    const { data: noticiasData, error: noticiasError } = await supabaseAdmin
      .from('noticias')
      .select('*')
      .gte('fecha_actualizacion', todayStart)
      .order('fecha_actualizacion', { ascending: false });

    if (noticiasError) throw noticiasError;

    console.log(`✓ Encontradas ${noticiasData?.length || 0} noticias.`);

    console.log('3. Validando estructura de datos...');
    // Simulate slidesByCategory check
    const slidesByCategory: any = {
      ia: [],
      tecnologia: [],
      economia: [],
      politica: []
    };

    slides.forEach((slide) => {
      console.log(`- Procesando slide ID: ${slide.id}, Categoria: "${slide.categoria}"`);
      slidesByCategory[slide.categoria].push(slide);
    });

    console.log('✅ ¡Todo el proceso de consulta y formateo simulado se ejecutó con éxito sin errores!');
  } catch (err: any) {
    console.error('❌ ERROR DURANTE LA SIMULACIÓN:', err.message || err);
  }
}

main();
