import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { isSupabaseConfigured, supabaseAdmin } from '@/lib/supabase';
import { mockStore } from '@/lib/mockStore';
import { Categoria, CarouselSlide, Noticia } from '@/types';
import CarouselsAdminClient from './CarouselsAdminClient';

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

  const isAuthenticated = passwordCookie === expectedPassword;

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

  // 2. Fetch slides generated in the last 24 hours
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  let slides: ExtendedSlide[] = [];

  if (isSupabaseConfigured() && supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('carousel_slides')
        .select('*, noticias(*)')
        .gte('created_at', oneDayAgo)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      slides = (data || []).map((s: any) => ({
        id: s.id,
        noticia_id: s.noticia_id,
        categoria: s.categoria,
        slide_order: s.slide_order,
        image_url: s.image_url,
        created_at: s.created_at,
        noticia: s.noticias as Noticia | null
      }));
    } catch (err) {
      console.error('Error fetching slides from Supabase:', err);
    }
  } else {
    // Fallback Mock Store
    const localSlides = mockStore.getCarouselSlides().filter(
      (s) => new Date(s.created_at).getTime() >= Date.now() - 24 * 60 * 60 * 1000
    );
    slides = localSlides.map((s) => {
      const newsItem = s.noticia_id ? mockStore.getNoticias().find(n => n.id === s.noticia_id) : null;
      return {
        ...s,
        noticia: newsItem
      };
    });
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
        <CarouselsAdminClient initialSlides={slides} />
      </div>
    </div>
  );
}
