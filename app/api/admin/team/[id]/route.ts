import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { ALL_PERMISSIONS, type Permission, type PermissionsMap } from '@/lib/admin/permissions'

export const runtime = 'nodejs'

async function requireOwner() {
  const supabase = createServerClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return { ok: false as const, status: 401, error: 'Unauthorized' }

  const { data: profile } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', userData.user.id)
    .maybeSingle()

  if (!profile || profile.role !== 'owner') {
    return { ok: false as const, status: 403, error: 'Forbidden' }
  }
  return { ok: true as const, user: userData.user }
}

function sanitizePermissions(input: unknown): PermissionsMap {
  const out: PermissionsMap = {
    view_inquiries: false,
    edit_inquiries: false,
    view_models: false,
    edit_models: false,
    view_content: false,
    edit_content: false,
    manage_team: false,
  }
  if (!input || typeof input !== 'object') return out
  for (const perm of ALL_PERMISSIONS) {
    if ((input as Record<Permission, unknown>)[perm] === true) out[perm] = true
  }
  return out
}

interface PatchBody {
  display_name?: string | null
  permissions?: PermissionsMap
  owner_notes?: string | null
}

export async function PATCH(req: NextRequest, ctx: { params: { id: string } }) {
  const auth = await requireOwner()
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status })

  const id = ctx.params.id
  if (id === auth.user.id) {
    return NextResponse.json(
      { ok: false, error: 'Edit your own account from /admin/settings.' },
      { status: 400 },
    )
  }

  const body = (await req.json().catch(() => ({}))) as PatchBody
  const update: Record<string, unknown> = {}
  if (body.display_name !== undefined) update.display_name = body.display_name
  if (body.owner_notes !== undefined) update.owner_notes = body.owner_notes
  if (body.permissions) update.permissions = sanitizePermissions(body.permissions)

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ ok: false, error: 'Nothing to update' }, { status: 400 })
  }

  const service = createServiceClient()
  const { error } = await service.from('admin_users').update(update).eq('id', id)
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, ctx: { params: { id: string } }) {
  const auth = await requireOwner()
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status })

  const id = ctx.params.id
  if (id === auth.user.id) {
    return NextResponse.json(
      { ok: false, error: 'Owners cannot remove themselves.' },
      { status: 400 },
    )
  }

  const service = createServiceClient()
  // Delete the auth user — cascades to admin_users via the FK ON DELETE CASCADE.
  const { error } = await service.auth.admin.deleteUser(id)
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
