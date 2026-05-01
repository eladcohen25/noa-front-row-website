import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'

/** Throws via redirect() if the user is not authenticated. */
export async function requireUser() {
  const supabase = createServerClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) {
    redirect('/admin/login')
  }
  return { user: data.user, supabase }
}

export async function getCurrentUser() {
  const supabase = createServerClient()
  const { data } = await supabase.auth.getUser()
  return data.user
}
