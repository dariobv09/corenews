import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import AnalyticsClient from './AnalyticsClient';

export const metadata: Metadata = {
  title: 'Core News - Panel de Analítica',
  description: 'Métricas de visitas y usuarios activos en tiempo real',
  manifest: '/manifest-admin.json'
};

export const dynamic = 'force-dynamic';

/**
 * Server Action for handling authentication
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
  redirect('/admin/analytics');
}

/**
 * Server Action for logging out
 */
async function logoutAction() {
  'use server';
  const cookieStore = await cookies();
  cookieStore.delete('admin_password');
  redirect('/admin/analytics');
}

export default async function AnalyticsAdminPage() {
  // 1. Password check
  const cookieStore = await cookies();
  const passwordCookie = cookieStore.get('admin_password')?.value;
  const expectedPassword = process.env.ADMIN_PASSWORD || 'admin1234';

  const isAuthenticated = passwordCookie === expectedPassword;

  if (!isAuthenticated) {
    // Render simple and beautiful login form if not authenticated (matching carousels admin design)
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#000000',
        color: '#ffffff',
        fontFamily: 'Poppins, system-ui, sans-serif',
        padding: '24px'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: '#121214',
          border: '1px solid #27272a',
          borderRadius: '16px',
          padding: '40px 32px',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
              The Core News
            </h1>
            <p style={{ fontSize: '14px', color: '#a1a1aa', margin: 0 }}>
              Panel de Control de Analítica
            </p>
          </div>

          <form action={loginAction} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label htmlFor="password" style={{ fontSize: '13px', fontWeight: 600, color: '#a1a1aa' }}>
                Contraseña de Administrador
              </label>
              <input
                type="password"
                name="password"
                id="password"
                required
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  backgroundColor: '#1c1c1f',
                  border: '1px solid #27272a',
                  color: '#ffffff',
                  fontSize: '15px',
                  outline: 'none'
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

  return <AnalyticsClient logoutAction={logoutAction} />;
}
