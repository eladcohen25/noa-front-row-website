import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { effectivePermissions, getAdminProfile } from '@/lib/admin/permissions'

export const runtime = 'nodejs'

const PAGE_TO_PATH: Record<string, string> = {
  home: '/',
  about: '/about',
  services: '/services',
  fw26: '/lookbook',
  contact: '/contact',
}

interface Body {
  page: string
  values: Record<string, string>
}

export async function POST(req: NextRequest) {
  const supabase = createServerClient()
  const profileResult = await getAdminProfile(supabase)
  if (!profileResult?.user) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }
  const perms = effectivePermissions(profileResult.profile)
  if (!perms.edit_content) {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 })
  }

  const body = (await req.json().catch(() => null)) as Body | null
  if (!body?.page || !body.values || typeof body.values !== 'object') {
    return NextResponse.json({ ok: false, error: 'Bad request' }, { status: 400 })
  }

  const updates = Object.entries(body.values).map(([key, value]) => ({
    key,
    value,
    updated_by: profileResult.user.id,
  }))
  if (updates.length === 0) {
    return NextResponse.json({ ok: true, updated: 0 })
  }

  const { error } = await supabase
    .from('site_content')
    .upsert(updates, { onConflict: 'key' })
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  const path = PAGE_TO_PATH[body.page]
  if (path) {
    try {
      revalidatePath(path)
    } catch {
      // best-effort
    }
  }

  return NextResponse.json({ ok: true, updated: updates.length })
}
