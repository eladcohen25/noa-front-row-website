import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

const PAGE_TO_PATH: Record<string, string> = {
  home: '/',
  about: '/about',
  services: '/services',
  fw26: '/lookbook',
  contact: '/contact',
}

export async function POST(req: NextRequest) {
  const supabase = createServerClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const page = (body?.page as string | undefined) ?? ''
  const path = PAGE_TO_PATH[page]
  if (!path) {
    return NextResponse.json({ ok: false, error: 'Unknown page' }, { status: 400 })
  }

  try {
    revalidatePath(path)
    return NextResponse.json({ ok: true, path })
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'Revalidation failed' },
      { status: 500 },
    )
  }
}
