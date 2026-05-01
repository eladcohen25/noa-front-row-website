import type { SupabaseClient } from '@supabase/supabase-js'
import type { AdminProfile } from './permissions'

export async function listTeamMembers(supabase: SupabaseClient): Promise<AdminProfile[]> {
  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .order('role', { ascending: true })
    .order('created_at', { ascending: true })
  if (error) {
    console.error('listTeamMembers error', error)
    return []
  }
  return (data ?? []) as AdminProfile[]
}

export async function getTeamMember(
  supabase: SupabaseClient,
  id: string,
): Promise<AdminProfile | null> {
  const { data, error } = await supabase.from('admin_users').select('*').eq('id', id).maybeSingle()
  if (error) return null
  return (data as AdminProfile | null) ?? null
}
