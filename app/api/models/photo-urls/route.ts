import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const STORAGE_BUCKET = 'tfr-model-photos'
const MAX_ADDITIONAL = 4
const ALLOWED_EXT = new Set(['jpg', 'jpeg', 'png', 'heic', 'heif', 'webp'])

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env vars missing')
  return createClient(url, key, { auth: { persistSession: false } })
}

function safeExt(raw: unknown): string {
  const ext = String(raw ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 5)
  return ALLOWED_EXT.has(ext) ? ext : 'jpg'
}

interface SlotInput {
  ext?: string
}

interface RequestBody {
  headshot?: SlotInput
  fullbody?: SlotInput
  profileLeft?: SlotInput
  profileRight?: SlotInput
  additional?: SlotInput[]
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as RequestBody
    const { headshot, fullbody, profileLeft, profileRight, additional } = body
    if (!headshot || !fullbody || !profileLeft || !profileRight) {
      return NextResponse.json(
        { ok: false, error: 'All four required slots must be provided.' },
        { status: 400 },
      )
    }

    const supabase = getServiceClient()
    const submissionId = crypto.randomUUID()

    type Slot = { path: string; token: string; signedUrl: string }

    const sign = async (path: string): Promise<Slot> => {
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .createSignedUploadUrl(path)
      if (error || !data) {
        throw new Error(`Could not create signed upload URL for ${path}: ${error?.message ?? 'unknown'}`)
      }
      return { path: data.path, token: data.token, signedUrl: data.signedUrl }
    }

    const requiredPathFor = (slot: string, input: SlotInput) =>
      `${submissionId}/${slot}.${safeExt(input.ext)}`

    const [headshotSlot, fullbodySlot, profileLeftSlot, profileRightSlot] =
      await Promise.all([
        sign(requiredPathFor('headshot', headshot)),
        sign(requiredPathFor('fullbody', fullbody)),
        sign(requiredPathFor('profile-left', profileLeft)),
        sign(requiredPathFor('profile-right', profileRight)),
      ])

    const trimmed = (additional ?? []).slice(0, MAX_ADDITIONAL)
    const additionalSlots = await Promise.all(
      trimmed.map((a, i) => sign(`${submissionId}/additional-${i + 1}.${safeExt(a.ext)}`)),
    )

    return NextResponse.json({
      ok: true,
      submissionId,
      urls: {
        headshot: headshotSlot,
        fullbody: fullbodySlot,
        profileLeft: profileLeftSlot,
        profileRight: profileRightSlot,
        additional: additionalSlots,
      },
    })
  } catch (err: unknown) {
    console.error('photo-urls error', err)
    const message = err instanceof Error ? err.message : 'Unexpected error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
