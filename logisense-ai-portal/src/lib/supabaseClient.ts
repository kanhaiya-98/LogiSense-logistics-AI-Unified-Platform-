import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fail gracefully if env vars are missing so the UI can still load
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key missing in environment.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder_key'
);
