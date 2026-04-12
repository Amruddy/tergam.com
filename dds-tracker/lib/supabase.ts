import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let supabaseClient: SupabaseClient<any, 'public', any> | null = null

export function getSupabase(): SupabaseClient<any, 'public', any> | null {
  if (supabaseClient) return supabaseClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    if (typeof window !== 'undefined') {
      console.warn('Supabase env is not configured. Cloud sync is disabled.')
    }
    return null
  }

  supabaseClient = createClient(url, anonKey)
  return supabaseClient
}
