import { createClient } from '@supabase/supabase-js';

const DEFAULT_URL = 'https://bzqbsdkbkfufuixndarb.supabase.co';
const DEFAULT_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6cWJzZGtia2Z1ZnVpeG5kYXJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2ODk4NTAsImV4cCI6MjA5OTI2NTg1MH0.EUQ_WyqpG5BgXLLzgqdoJ2R0ZW5mXZPN_6d9ilSng-A';
const DEFAULT_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6cWJzZGtia2Z1ZnVpeG5kYXJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzY4OTg1MCwiZXhwIjoyMDk5MjY1ODUwfQ.CvQO7u7KhVfYPaFWmB34PAaOJwovN_YsAiSKQY8m6b8';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_ANON_KEY;

const isValidUrl = (url: string) => {
  return url && (url.startsWith('http://') || url.startsWith('https://'));
};

// Safe client-side Supabase instance that won't crash Next.js builds when env vars are placeholders
export const supabase = createClient(
  isValidUrl(supabaseUrl) ? supabaseUrl : DEFAULT_URL,
  supabaseAnonKey || DEFAULT_ANON_KEY
);

export function getSupabaseAdmin() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || DEFAULT_SERVICE_ROLE_KEY;
  const currentUrl = isValidUrl(supabaseUrl) ? supabaseUrl : DEFAULT_URL;

  return createClient(currentUrl, serviceRoleKey, {
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
