import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

const COOKIE_NAME = 'tfr_preview'
const MAX_AGE = 15 * 60 // 15 minutes

export async function POST(req: NextRequest) {
  const supabase = createServerClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await req.json().catch(() => null)) as
    | { page?: string; values?: Record<string, string> }
    | null
  if (!body?.page || !body.values || typeof body.values !== 'object') {
    return NextResponse.json({ ok: false, error: 'Bad request' }, { status: 400 })
  }

  const payload = JSON.stringify({ page: body.page, values: body.values })
  if (payload.length > 50_000) {
    return NextResponse.json({ ok: false, error: 'Preview payload too large' }, { status: 413 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set({
    name: COOKIE_NAME,
    value: payload,
    maxAge: MAX_AGE,
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
  return res
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set({
    name: COOKIE_NAME,
    value: '',
    maxAge: 0,
    path: '/',
  })
  return res
}
