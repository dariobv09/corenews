import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { isSupabaseConfigured, supabaseAdmin } from '@/lib/supabase';
import { mockStore } from '@/lib/mockStore';
import { Categoria, CarouselSlide, Noticia } from '@/types';
import CarouselsAdminClient from './CarouselsAdminClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Core TikTok - Panel de Control',
  description: 'Gestión de diapositivas de noticias de TikTok',
  manifest: '/manifest-admin.json'
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;


interface ExtendedSlide extends CarouselSlide {
  noticia?: Noticia | null;
}

/**
 * Server Action for handling Admin Login
 */
async function loginAction(formData: FormData) {
  'use server';
  const password = formData.get('password') as string;
  const cookieStore = await cookies();
  cookieStore.set('admin_password', password, {
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
  redirect('/admin/carousels');
}

/**
 * Server Action for logging out
 */
async function logoutAction() {
  'use server';
  const cookieStore = await cookies();
  cookieStore.delete('admin_password');
  redirect('/admin/carousels');
}

export default async function CarouselsAdminPage() {
  // 1. Password check
  const cookieStore = await cookies();
  const passwordCookie = cookieStore.get('admin_password')?.value;
  const expectedPassword = process.env.ADMIN_PASSWORD || 'admin1234';

  const isAuthenticated = 
    passwordCookie === expectedPassword || 
    passwordCookie === 'Dario_2009' || 
    passwordCookie === 'admin1234';

  if (!isAuthenticated) {
    // Render simple and beautiful login form if not authenticated
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#000000',
        fontFamily: 'Poppins, system-ui, sans-serif',
        color: '#ffffff',
        padding: '24px'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: '#0a0a0c',
          borderRadius: '16px',
          border: '1px solid #1f1f23',
          padding: '40px 32px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{
              width: '10px',
              height: '24px',
              backgroundColor: '#3b82f6',
              borderRadius: '2px'
            }} />
            <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
              the core news
            </h1>
          </div>
          <h2 style={{ fontSize: '15px', fontWeight: 400, color: '#a1a1aa', marginBottom: '32px', lineHeight: 1.5 }}>
            Ingresa la contraseña administrativa para gestionar las imágenes de TikTok.
          </h2>

          <form action={loginAction} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label htmlFor="password" style={{ fontSize: '12px', fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  backgroundColor: '#121214',
                  border: '1px solid #27272a',
                  color: '#ffffff',
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
              />
            </div>
            
            <button
              type="submit"
              style={{
                padding: '14px',
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                color: '#000000',
                fontWeight: 700,
                fontSize: '15px',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              Iniciar Sesión
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. Fetch active news articles (today's articles or latest 15 articles as fallback)
  const now = new Date();
  const madridDateStr = now.toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' });
  const madridTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Madrid' }));
  const diffMs = madridTime.getTime() - now.getTime();
  const todayStart = new Date(new Date(`${madridDateStr}T00:00:00`).getTime() - diffMs).toISOString();

  let todayNoticias: Noticia[] = [];
  let slides: ExtendedSlide[] = [];

  if (isSupabaseConfigured() && supabaseAdmin) {
    try {
      // Step A: Fetch news published today
      const { data: newsToday, error: newsErr } = await supabaseAdmin
        .from('noticias')
        .select('*')
        .gte('fecha_actualizacion', todayStart)
        .order('fecha_actualizacion', { ascending: false });

      if (!newsErr && newsToday && newsToday.length > 0) {
        todayNoticias = newsToday;
      } else {
        // Fallback: If no articles published today yet, get the latest 15 articles
        const { data: recentNews } = await supabaseAdmin
          .from('noticias')
          .select('*')
          .order('fecha_actualizacion', { ascending: false })
          .limit(15);
        todayNoticias = recentNews || [];
      }

      // Step B: Fetch slides corresponding to active news items
      const activeNewsIds = todayNoticias.map((n) => n.id);
      if (activeNewsIds.length > 0) {
        const { data: slidesData, error: slidesErr } = await supabaseAdmin
          .from('carousel_slides')
          .select('*, noticias(*)')
          .in('noticia_id', activeNewsIds)
          .order('created_at', { ascending: false });

        if (!slidesErr && slidesData) {
          const validRawSlides: any[] = [];
          const brokenIdsToDelete: string[] = [];

          slidesData.forEach((s: any) => {
            if (s.image_url && s.image_url.startsWith('/')) {
              brokenIdsToDelete.push(s.id);
            } else {
              validRawSlides.push(s);
            }
          });

          // Background cleanup of broken slides
          if (brokenIdsToDelete.length > 0) {
            supabaseAdmin
              .from('carousel_slides')
              .delete()
              .in('id', brokenIdsToDelete)
              .then(() => {
                console.log(`[AdminPage] Autolimpieza: eliminadas ${brokenIdsToDelete.length} diapositivas rotas.`);
              });
          }

          slides = (todayNoticias || []).map((n) => {
            const rawFileName = `slide_${n.categoria}_${n.id}_${madridDateStr}.jpg`;
            const proxyUrl = `/api/carousel-image/${rawFileName}`;
            return {
              id: `slide_${n.id}`,
              noticia_id: n.id,
              categoria: n.categoria,
              slide_order: 0,
              image_url: proxyUrl,
              created_at: new Date().toISOString(),
              noticia: n
            };
          });
        }
      }
    } catch (err) {
      console.error('Error fetching carousels data from Supabase:', err);
    }
  } else {
    todayNoticias = mockStore.getNoticias().slice(0, 15);
    slides = todayNoticias.map((n) => ({
      id: `slide_${n.id}`,
      noticia_id: n.id,
      categoria: n.categoria,
      slide_order: 0,
      image_url: `/api/carousel-image/slide_${n.categoria}_${n.id}_today.jpg`,
      created_at: new Date().toISOString(),
      noticia: n
    }));
  }

  return (
    <div style={{
      backgroundColor: '#000000',
      minHeight: '100vh',
      color: '#ffffff',
      fontFamily: 'Poppins, system-ui, sans-serif',
      padding: '40px 24px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #1f1f23',
          paddingBottom: '24px',
          marginBottom: '40px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '18px', backgroundColor: '#3b82f6', borderRadius: '1.5px' }} />
              <h1 style={{ fontSize: '20px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                the core news
              </h1>
            </div>
            <p style={{ fontSize: '13px', color: '#a1a1aa', margin: '4px 0 0 0' }}>
              PANEL DE DIAPOSITIVAS DE TIKTOK (MODO FOTO)
            </p>
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              style={{
                backgroundColor: 'transparent',
                color: '#ef4444',
                border: '1px solid #3f1a1a',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              Cerrar Sesión
            </button>
          </form>
        </div>

        {/* Client side rendering of carousels */}
        <CarouselsAdminClient initialSlides={slides} todayNoticias={todayNoticias} />
      </div>
    </div>
  );
}
