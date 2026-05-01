import type { SupabaseClient, User } from '@supabase/supabase-js'
import { createServerClient } from '@/lib/supabase/server'
import {
  effectivePermissions,
  type AdminProfile,
  type PermissionsMap,
} from './permissionTypes'

// Re-export the client-safe types/constants so existing server-only callers
// can keep importing from this module.
export * from './permissionTypes'

/**
 * Looks up the admin_users row for the current session. Returns null if
 * the user is not signed in, or { user, profile: null } if they are signed
 * in but have no admin_users record yet.
 */
export async function getAdminProfile(
  client?: SupabaseClient,
): Promise<{ user: User; profile: AdminProfile | null } | null> {
  const supabase = client ?? createServerClient()
  const { data: userData, error: userErr } = await supabase.auth.getUser()
  if (userErr || !userData.user) return null

  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('id', userData.user.id)
    .maybeSingle()

  if (error) {
    console.error('getAdminProfile error', error)
    return { user: userData.user, profile: null }
  }
  return { user: userData.user, profile: (data as AdminProfile | null) ?? null }
}

export async function getCurrentPermissions(): Promise<PermissionsMap | null> {
  const result = await getAdminProfile()
  if (!result) return null
  return effectivePermissions(result.profile)
}
