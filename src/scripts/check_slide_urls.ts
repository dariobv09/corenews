import { supabaseAdmin } from '../lib/supabase';

async function main() {
  console.log('--- REVISANDO URLS DE DIAPOSITIVAS EN SUPABASE ---');
  try {
    const { data: slides, error } = await supabaseAdmin
      .from('carousel_slides')
      .select('*, noticias(*)')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    console.log(`Encontradas ${slides?.length || 0} diapositivas en total:`);
    for (const slide of (slides || [])) {
      const isLocal = slide.image_url.startsWith('/');
      console.log(`ID: ${slide.id}`);
      console.log(`- Noticia: "${slide.noticias?.titulo?.substring(0, 50)}..."`);
      console.log(`- URL: "${slide.image_url}" (Local fallback: ${isLocal ? 'SÍ' : 'NO'})`);
      
      try {
        const res = await fetch(isLocal ? `https://thecorenews.info${slide.image_url}` : slide.image_url, { method: 'HEAD' });
        console.log(`- Status HTTP: ${res.status} (${res.ok ? 'VÁLIDO' : 'ROTO'})`);
      } catch (err: any) {
        console.log(`- Status HTTP: ERROR (${err.message})`);
      }
      console.log('------------------------------------------------');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
