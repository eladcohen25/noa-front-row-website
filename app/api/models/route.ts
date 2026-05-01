import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  isAgeValid,
  modelSubmissionSchema,
  normalizeInstagramHandle,
  normalizeUrl,
} from '@/lib/models/schema'
import {
  buildModelSubmitterEmailHtml,
  buildModelTfrEmailHtml,
  getResend,
} from '@/lib/resend'
import { ageFromDob } from '@/lib/models/units'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const STORAGE_BUCKET = 'tfr-model-photos'
const MAX_BYTES = 10 * 1024 * 1024
const MAX_ADDITIONAL = 4
const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/heic',
  'image/heif',
  'image/webp',
])

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env vars missing')
  return createClient(url, key, { auth: { persistSession: false } })
}

function checkFile(file: File): string | null {
  if (file.size > MAX_BYTES) return 'Photo over 10 MB'
  if (file.type && !ALLOWED_MIME.has(file.type)) {
    if (!file.name.match(/\.(jpe?g|png|heic|heif|webp)$/i)) return 'Unsupported photo format'
  }
  return null
}

export async function POST(req: NextRequest) {
  try {
    const fd = await req.formData()
    const payloadRaw = String(fd.get('payload') || '{}')
    let payload: Record<string, unknown> = {}
    try {
      payload = JSON.parse(payloadRaw)
    } catch {
      return NextResponse.json({ ok: false, error: 'Invalid JSON payload' }, { status: 400 })
    }

    const headshot = fd.get('headshot') as File | null
    const fullbody = fd.get('fullbody') as File | null
    const profileLeft = fd.get('profileLeft') as File | null
    const profileRight = fd.get('profileRight') as File | null
    const additional = fd
      .getAll('additional')
      .filter((f): f is File => f instanceof File)
      .slice(0, MAX_ADDITIONAL)

    const flaggedSpam = String(payload.website ?? '').trim().length > 0

    // Validate Zod payload (skipped for spam; we still log them flagged).
    if (!flaggedSpam) {
      const parsed = modelSubmissionSchema.safeParse(payload)
      if (!parsed.success) {
        return NextResponse.json(
          { ok: false, error: 'Validation failed', issues: parsed.error.flatten() },
          { status: 400 },
        )
      }
    }

    const dob = String(payload.dateOfBirth ?? '')
    if (!flaggedSpam && !isAgeValid(dob)) {
      return NextResponse.json(
        { ok: false, error: 'You must be 18 or older to submit.' },
        { status: 400 },
      )
    }

    if (!flaggedSpam) {
      if (!headshot || !fullbody || !profileLeft || !profileRight) {
        return NextResponse.json(
          { ok: false, error: 'All four required photos must be provided.' },
          { status: 400 },
        )
      }
      for (const f of [headshot, fullbody, profileLeft, profileRight, ...additional]) {
        const err = checkFile(f)
        if (err) return NextResponse.json({ ok: false, error: err }, { status: 400 })
      }
    }

    const supabase = getServiceClient()
    const submissionId = crypto.randomUUID()

    // Upload photos under {submissionId}/{slot}.{ext}
    const slotUploads: { slot: string; file: File }[] = []
    if (headshot) slotUploads.push({ slot: 'headshot', file: headshot })
    if (fullbody) slotUploads.push({ slot: 'fullbody', file: fullbody })
    if (profileLeft) slotUploads.push({ slot: 'profile-left', file: profileLeft })
    if (profileRight) slotUploads.push({ slot: 'profile-right', file: profileRight })

    const slotPaths: Record<string, string> = {}
    for (const { slot, file } of slotUploads) {
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
      const path = `${submissionId}/${slot}.${ext}`
      const buf = Buffer.from(await file.arrayBuffer())
      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, buf, { contentType: file.type || 'image/jpeg', upsert: false })
      if (error) {
        console.error('photo upload error', slot, error)
        return NextResponse.json(
          { ok: false, error: 'Photo upload failed.' },
          { status: 500 },
        )
      }
      slotPaths[slot] = path
    }
    const additionalPaths: string[] = []
    for (let i = 0; i < additional.length; i++) {
      const file = additional[i]
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
      const path = `${submissionId}/additional-${i + 1}.${ext}`
      const buf = Buffer.from(await file.arrayBuffer())
      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, buf, { contentType: file.type || 'image/jpeg', upsert: false })
      if (error) {
        console.error('additional photo upload error', i, error)
        continue
      }
      additionalPaths.push(path)
    }

    const igHandle = normalizeInstagramHandle(String(payload.instagramHandle ?? ''))
    const tiktokHandle = payload.tiktokHandle
      ? normalizeInstagramHandle(String(payload.tiktokHandle))
      : null
    const portfolio = normalizeUrl(payload.portfolioUrl as string | null | undefined)

    const insertRow = {
      id: submissionId,
      full_name: String(payload.fullName ?? ''),
      email: String(payload.email ?? ''),
      phone: String(payload.phone ?? ''),
      gender_identity:
        payload.genderIdentity === 'Prefer to self-describe' && payload.genderIdentityOther
          ? `Self-described: ${payload.genderIdentityOther}`
          : String(payload.genderIdentity ?? ''),
      city: String(payload.city ?? ''),
      date_of_birth: dob,
      age_at_submission: ageFromDob(dob),
      height_cm: Number(payload.heightCm),
      bust_cm: Number(payload.bustCm),
      waist_cm: Number(payload.waistCm),
      hips_cm: Number(payload.hipsCm),
      size_tops: String(payload.sizeTops ?? ''),
      size_bottoms: String(payload.sizeBottoms ?? ''),
      size_dress_suit: String(payload.sizeDressSuit ?? ''),
      shoe_size_us: Number(payload.shoeSizeUs),
      hair_color:
        payload.hairColor === 'Other' && payload.hairColorOther
          ? `Other: ${payload.hairColorOther}`
          : String(payload.hairColor ?? ''),
      eye_color:
        payload.eyeColor === 'Other' && payload.eyeColorOther
          ? `Other: ${payload.eyeColorOther}`
          : String(payload.eyeColor ?? ''),
      modeling_experience: String(payload.modelingExperience ?? ''),
      has_agency: !!payload.hasAgency,
      agency_name: payload.hasAgency
        ? (payload.agencyName as string | null) || null
        : null,
      headshot_url: slotPaths['headshot'] || '',
      fullbody_url: slotPaths['fullbody'] || '',
      profile_left_url: slotPaths['profile-left'] || '',
      profile_right_url: slotPaths['profile-right'] || '',
      additional_photo_urls: additionalPaths,
      instagram_handle: igHandle,
      tiktok_handle: tiktokHandle,
      portfolio_url: portfolio,
      travel_availability: String(payload.travelAvailability ?? ''),
      why_tfr: (payload.whyTfr as string | null)?.trim() || null,
      how_heard:
        payload.howHeard === 'Other' && payload.howHeardOther
          ? `Other: ${payload.howHeardOther}`
          : String(payload.howHeard ?? ''),
      additional_notes: (payload.additionalNotes as string | null) || null,
      flagged_spam: flaggedSpam,
    }

    const { error: insertError } = await supabase
      .from('tfr_model_submissions')
      .insert(insertRow)

    if (insertError) {
      console.error('insert error', insertError)
      return NextResponse.json({ ok: false, error: 'Database error' }, { status: 500 })
    }

    if (flaggedSpam) {
      return NextResponse.json({ ok: true })
    }

    // Build signed URLs for the email so TFR can click through.
    const photoLinks: { label: string; url: string }[] = []
    const labelMap: Record<string, string> = {
      headshot: 'Headshot',
      fullbody: 'Full body',
      'profile-left': 'Profile left',
      'profile-right': 'Profile right',
    }
    for (const [slot, path] of Object.entries(slotPaths)) {
      const { data } = await supabase.storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(path, 60 * 60 * 24 * 14)
      if (data?.signedUrl) photoLinks.push({ label: labelMap[slot] ?? slot, url: data.signedUrl })
    }
    for (let i = 0; i < additionalPaths.length; i++) {
      const { data } = await supabase.storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(additionalPaths[i], 60 * 60 * 24 * 14)
      if (data?.signedUrl)
        photoLinks.push({ label: `Additional ${i + 1}`, url: data.signedUrl })
    }

    const fromAddress = process.env.TFR_EMAIL_FROM
    const tfrTo = process.env.TFR_EMAIL_TO
    if (fromAddress && tfrTo) {
      try {
        const resend = getResend()
        const createdAt = new Date().toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })
        await resend.emails.send({
          from: fromAddress,
          to: tfrTo,
          replyTo: insertRow.email,
          subject: `New model submission — ${insertRow.full_name}`,
          html: buildModelTfrEmailHtml({
            fullName: insertRow.full_name,
            email: insertRow.email,
            phone: insertRow.phone,
            city: insertRow.city,
            age: insertRow.age_at_submission,
            heightCm: insertRow.height_cm,
            bustCm: insertRow.bust_cm,
            waistCm: insertRow.waist_cm,
            hipsCm: insertRow.hips_cm,
            sizeTops: insertRow.size_tops,
            sizeBottoms: insertRow.size_bottoms,
            sizeDressSuit: insertRow.size_dress_suit,
            shoeSizeUs: insertRow.shoe_size_us,
            hairColor: insertRow.hair_color,
            eyeColor: insertRow.eye_color,
            modelingExperience: insertRow.modeling_experience,
            hasAgency: insertRow.has_agency,
            agencyName: insertRow.agency_name,
            instagramHandle: insertRow.instagram_handle,
            travelAvailability: insertRow.travel_availability,
            whyTfr: insertRow.why_tfr ?? '',
            photoUrls: photoLinks,
            createdAt,
          }),
        })
        await resend.emails.send({
          from: fromAddress,
          to: insertRow.email,
          subject: 'We received your submission — The Front Row',
          html: buildModelSubmitterEmailHtml(insertRow.full_name),
        })
      } catch (mailErr) {
        console.error('Resend error', mailErr)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    console.error('models route error', err)
    const message = err instanceof Error ? err.message : 'Unexpected error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
