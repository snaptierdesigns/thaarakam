import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isValidUrl = (url: string) => {
  return url && (url.startsWith('http://') || url.startsWith('https://'));
};

// Safe client-side Supabase instance that won't crash Next.js builds when env vars are placeholders
export const supabase = createClient(
  isValidUrl(supabaseUrl) ? supabaseUrl : 'https://placeholder-url.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

export function getSupabaseAdmin() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const currentUrl = isValidUrl(supabaseUrl) ? supabaseUrl : 'https://placeholder-url.supabase.co';
  
  if (!serviceRoleKey || !isValidUrl(supabaseUrl)) {
    console.warn('Supabase admin key or URL is missing; using a mock/limited client.');
  }

  return createClient(currentUrl, serviceRoleKey || 'placeholder-role-key', {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// Global logger helper to format Supabase errors into clear primitive string logs
export function logSupabaseError(context: string, error: any) {
  if (!error) return;
  const message = error.message || error.description || 'Unknown error message';
  const code = error.code || 'N/A';
  const details = error.details || 'No details provided';
  const hint = error.hint ? `(Hint: ${error.hint})` : '';
  console.error(`[Supabase Error] ${context} failed: "${message}" [Code: ${code}] [Details: ${details}] ${hint}`);
}
