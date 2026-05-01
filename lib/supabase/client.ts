'use client'

import { createBrowserClient as createSSRClient } from '@supabase/ssr'

let cached: ReturnType<typeof createSSRClient> | null = null

/** Browser-side Supabase client (singleton). Use in Client Components. */
export function createBrowserClient() {
  if (cached) return cached
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) throw new Error('Supabase env vars missing')
  cached = createSSRClient(url, anonKey)
  return cached
}
