// Client-safe types and constants. NO server-only imports here.
// Server helpers (getAdminProfile, getCurrentPermissions) live in
// lib/admin/permissions.ts and pull in next/headers.

export type Permission =
  | 'view_inquiries'
  | 'edit_inquiries'
  | 'view_models'
  | 'edit_models'
  | 'view_content'
  | 'edit_content'
  | 'manage_team'

export const ALL_PERMISSIONS: Permission[] = [
  'view_inquiries',
  'edit_inquiries',
  'view_models',
  'edit_models',
  'view_content',
  'edit_content',
  'manage_team',
]

export const PERMISSION_LABELS: Record<Permission, string> = {
  view_inquiries: 'View inquiries',
  edit_inquiries: 'Manage inquiries (status, notes, tags, archive)',
  view_models: 'View model submissions',
  edit_models: 'Manage model submissions (status, notes, tags, archive)',
  view_content: 'View site content',
  edit_content: 'Edit site content (CMS + visual editor)',
  manage_team: 'Manage team members',
}

export type PermissionsMap = Record<Permission, boolean>

export interface AdminProfile {
  id: string
  email: string
  display_name: string | null
  role: 'owner' | 'team_member'
  permissions: PermissionsMap
  owner_notes: string | null
  created_at: string | null
  last_sign_in_at: string | null
}

export const FULL_PERMS: PermissionsMap = {
  view_inquiries: true,
  edit_inquiries: true,
  view_models: true,
  edit_models: true,
  view_content: true,
  edit_content: true,
  manage_team: true,
}

export const DEFAULT_TEAM_PERMS: PermissionsMap = {
  view_inquiries: true,
  edit_inquiries: true,
  view_models: true,
  edit_models: true,
  view_content: true,
  edit_content: true,
  manage_team: false,
}

const NO_PERMS: PermissionsMap = {
  view_inquiries: false,
  edit_inquiries: false,
  view_models: false,
  edit_models: false,
  view_content: false,
  edit_content: false,
  manage_team: false,
}

export function effectivePermissions(profile: AdminProfile | null): PermissionsMap {
  if (!profile) return NO_PERMS
  if (profile.role === 'owner') return FULL_PERMS
  // Backfill any missing keys from the stored permissions so older rows
  // that pre-date a permission key (e.g. view_models) default to false
  // rather than `undefined`.
  return { ...NO_PERMS, ...profile.permissions }
}

export function hasPermission(perms: PermissionsMap | null, perm: Permission): boolean {
  if (!perms) return false
  return !!perms[perm]
}
