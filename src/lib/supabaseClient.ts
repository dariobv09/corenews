import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const isConfigured = 
  supabaseUrl !== '' &&
  supabaseUrl !== 'your-supabase-url' &&
  !supabaseUrl.includes('AQUÍ_PEGA') &&
  (supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://')) &&
  supabaseAnonKey !== '' &&
  supabaseAnonKey !== 'your-anon-key' &&
  !supabaseAnonKey.includes('AQUÍ_PEGA');

if (!isConfigured) {
  console.warn(
    'Warning: Supabase credentials are not fully configured or contain placeholders. ' +
    'Please update your .env file or Vercel Environment Variables.'
  );
}

// Cliente público para operaciones en el cliente y componentes de servidor
export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Cliente administrador para operaciones en el servidor que requieran privilegios especiales (Service Role)
export const supabaseAdmin = isConfigured && supabaseServiceRoleKey && !supabaseServiceRoleKey.includes('AQUÍ_PEGA')
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

export default supabase;
