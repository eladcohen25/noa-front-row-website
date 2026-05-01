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

  const entries = Object.entries(body.values)
  if (entries.length === 0) {
    return NextResponse.json({ ok: true, updated: 0 })
  }

  // Per-row UPDATE rather than upsert — we only have key + value here,
  // and a bulk upsert would fail the NOT NULL check on page/label/type
  // even for rows that already exist (Postgres evaluates the INSERT
  // branch of `INSERT … ON CONFLICT DO UPDATE` first). The visual editor
  // only ever modifies pre-seeded keys, so plain UPDATE is correct.
  const failures: { key: string; error: string }[] = []
  let updated = 0
  for (const [key, value] of entries) {
    const { error: rowError, count } = await supabase
      .from('site_content')
      .update({ value, updated_by: profileResult.user.id }, { count: 'exact' })
      .eq('key', key)
    if (rowError) {
      failures.push({ key, error: rowError.message })
    } else {
      updated += count ?? 0
    }
  }
  if (failures.length > 0) {
    return NextResponse.json(
      {
        ok: false,
        error: `Failed to update ${failures.length} key(s): ${failures
          .map((f) => `${f.key} (${f.error})`)
          .join('; ')}`,
      },
      { status: 500 },
    )
  }

  const path = PAGE_TO_PATH[body.page]
  if (path) {
    try {
      revalidatePath(path)
    } catch {
      // best-effort
    }
  }

  return NextResponse.json({ ok: true, updated })
}
