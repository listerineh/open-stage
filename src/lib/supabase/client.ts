import { createBrowserClient } from '@supabase/ssr';
import { env, validateEnv } from '@/lib/env';

export function createClient() {
  validateEnv();
  return createBrowserClient(env.supabase.url, env.supabase.publishableKey);
}
