import { createClient } from '@supabase/supabase-js';
export function database() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Store database is not configured. Please contact the store or use WhatsApp.');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
export function databaseConfigured() { return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY); }
