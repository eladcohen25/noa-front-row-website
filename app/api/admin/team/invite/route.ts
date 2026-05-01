import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { ALL_PERMISSIONS, type Permission, type PermissionsMap } from '@/lib/admin/permissions'
import { buildAdminInviteHtml, buildAdminInviteText, getResend } from '@/lib/resend'

export const runtime = 'nodejs'

interface InviteBody {
  email: string
  display_name?: string
  permissions: PermissionsMap
  owner_notes?: string
}

function generateTempPassword(): string {
  const charset = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = new Uint32Array(16)
  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
    crypto.getRandomValues(bytes)
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 0xffffffff)
  }
  let out = ''
  for (let i = 0; i < bytes.length; i++) out += charset[bytes[i] % charset.length]
  return `TFR-${out}`
}

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

export async function POST(req: NextRequest) {
  const auth = await requireOwner()
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status })

  const body = (await req.json().catch(() => null)) as InviteBody | null
  if (!body?.email || !body.email.includes('@')) {
    return NextResponse.json({ ok: false, error: 'Valid email required' }, { status: 400 })
  }

  const tempPassword = generateTempPassword()
  const service = createServiceClient()

  // Create the auth user (or look up existing).
  const { data: created, error: createErr } = await service.auth.admin.createUser({
    email: body.email,
    password: tempPassword,
    email_confirm: true,
  })

  let userId: string | null = created?.user?.id ?? null
  let isNewUser = !!created?.user

  if (createErr || !userId) {
    // Maybe user already exists — find them.
    const { data: list } = await service.auth.admin.listUsers({ page: 1, perPage: 200 })
    const existing = list?.users.find((u) => u.email?.toLowerCase() === body.email.toLowerCase())
    if (!existing) {
      return NextResponse.json(
        { ok: false, error: createErr?.message || 'Could not create user' },
        { status: 400 },
      )
    }
    userId = existing.id
    isNewUser = false
  }

  // Insert / upsert admin_users row.
  const permissions = sanitizePermissions(body.permissions)
  const { error: insertErr } = await service.from('admin_users').upsert(
    {
      id: userId,
      email: body.email,
      display_name: body.display_name ?? null,
      role: 'team_member',
      permissions,
      owner_notes: body.owner_notes ?? null,
    },
    { onConflict: 'id' },
  )

  if (insertErr) {
    return NextResponse.json(
      { ok: false, error: 'Could not save team member: ' + insertErr.message },
      { status: 500 },
    )
  }

  // Send the invite email if we created the user (or they explicitly asked).
  let emailSent = false
  let emailError: string | null = null
  try {
    if (isNewUser && process.env.RESEND_API_KEY && process.env.TFR_EMAIL_FROM) {
      const url = req.nextUrl
      const origin = url.origin
      const args = {
        displayName: body.display_name ?? '',
        email: body.email,
        tempPassword,
        loginUrl: `${origin}/admin/login`,
        invitedBy: auth.user.email ?? 'an admin',
      }
      const resend = getResend()
      await resend.emails.send({
        from: process.env.TFR_EMAIL_FROM!,
        to: body.email,
        subject: "You've been added to The Front Row admin",
        html: buildAdminInviteHtml(args),
        text: buildAdminInviteText(args),
      })
      emailSent = true
    }
  } catch (err) {
    emailError = err instanceof Error ? err.message : 'unknown'
  }

  return NextResponse.json({
    ok: true,
    userId,
    isNewUser,
    emailSent,
    emailError,
    // Returned ONLY for the immediate UI so the owner can copy/share
    // the temp password if email delivery fails. Never logged or stored.
    tempPassword: isNewUser ? tempPassword : null,
  })
}
