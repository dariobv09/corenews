import { isSupabaseConfigured, supabaseAdmin } from '../src/lib/supabase';

async function diagnose() {
  console.log('=== DIAGNOSING PRODUCTION ADMIN PAGE & DATABASE ===');

  // 1. Fetch slides in DB
  const { data: slides, error: slidesErr } = await supabaseAdmin
    .from('carousel_slides')
    .select('*, noticias(*)');

  console.log('Slides in Supabase DB count:', slides?.length, 'Error:', slidesErr);

  if (slides && slides.length > 0) {
    for (let i = 0; i < Math.min(slides.length, 5); i++) {
      const s = slides[i];
      console.log(`\nSlide [${i + 1}]: ID=${s.id} | Noticia=${s.noticias?.titulo?.substring(0, 30)}`);
      console.log(`  image_url: ${s.image_url}`);
      try {
        const res = await fetch(s.image_url);
        console.log(`  HTTP Fetch Status: ${res.status} | Content-Type: ${res.headers.get('content-type')} | Length: ${res.headers.get('content-length')}`);
      } catch (err: any) {
        console.error(`  HTTP Fetch Error:`, err.message || err);
      }
    }
  }

  // 2. Fetch production admin page HTML
  console.log('\n--- FETCHING PRODUCTION HTML ---');
  const formData = new URLSearchParams();
  formData.append('password', 'Dario_2009');
  const resLogin = await fetch('https://thecorenews.info/admin/carousels', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString(),
    redirect: 'manual'
  });
  const cookie = resLogin.headers.get('set-cookie')?.split(';')[0];
  console.log('Cookie obtained:', cookie);

  if (cookie) {
    const resPage = await fetch('https://thecorenews.info/admin/carousels', {
      headers: { 'Cookie': cookie }
    });
    console.log('Page HTTP Status:', resPage.status);
    const html = await resPage.text();
    console.log('HTML total length:', html.length);
    console.log('Contains Supabase CDN URLs?:', html.includes('bnywcdwwqdcyztqguios.supabase.co'));
    console.log('Contains <img tags?:', html.includes('<img'));
    
    // Check if password prompt HTML was returned instead of admin dashboard
    console.log('Contains "Iniciar Sesión"?:', html.includes('Iniciar Sesión'));
  }
}

diagnose();
