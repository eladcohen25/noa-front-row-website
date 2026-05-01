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
export const maxDuration = 30

const STORAGE_BUCKET = 'tfr-model-photos'
const MAX_ADDITIONAL = 4

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env vars missing')
  return createClient(url, key, { auth: { persistSession: false } })
}

function isUuid(s: unknown): s is string {
  return typeof s === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null
    if (!body) {
      return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
    }

    const payload = body as Record<string, unknown>
    const submissionId = String(payload.submissionId ?? '')
    const photos = (payload.photos ?? {}) as {
      headshot?: string
      fullbody?: string
      profileLeft?: string
      profileRight?: string
      additional?: string[]
    }

    const flaggedSpam = String(payload.website ?? '').trim().length > 0

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

    if (!flaggedSpam && payload.isAdult !== true) {
      return NextResponse.json(
        { ok: false, error: 'You must confirm you are 18 or older.' },
        { status: 400 },
      )
    }

    if (!isUuid(submissionId)) {
      return NextResponse.json(
        { ok: false, error: 'Missing or invalid submissionId' },
        { status: 400 },
      )
    }

    if (
      !flaggedSpam &&
      (!photos.headshot ||
        !photos.fullbody ||
        !photos.profileLeft ||
        !photos.profileRight)
    ) {
      return NextResponse.json(
        { ok: false, error: 'All four required photo paths must be provided.' },
        { status: 400 },
      )
    }

    const allPaths = [
      photos.headshot,
      photos.fullbody,
      photos.profileLeft,
      photos.profileRight,
      ...(photos.additional ?? []).slice(0, MAX_ADDITIONAL),
    ].filter((p): p is string => typeof p === 'string' && p.length > 0)

    // Photo paths must live under the submissionId folder we issued URLs for.
    for (const p of allPaths) {
      if (!p.startsWith(`${submissionId}/`)) {
        return NextResponse.json(
          { ok: false, error: 'Photo path does not match this submission' },
          { status: 400 },
        )
      }
    }

    const supabase = getServiceClient()

    // Verify each photo actually exists in storage (i.e. the client uploaded it
    // before calling us). Cheap HEAD via createSignedUrl which fails on missing.
    if (!flaggedSpam) {
      const checks = await Promise.all(
        allPaths.map(async (p) => {
          const { data, error } = await supabase.storage
            .from(STORAGE_BUCKET)
            .createSignedUrl(p, 60)
          return { p, ok: !!data?.signedUrl, error }
        }),
      )
      const missing = checks.filter((c) => !c.ok)
      if (missing.length > 0) {
        return NextResponse.json(
          {
            ok: false,
            error: `Photos missing in storage: ${missing.map((m) => m.p).join(', ')}`,
          },
          { status: 400 },
        )
      }
    }

    const slotPaths: Record<string, string> = {
      headshot: photos.headshot ?? '',
      fullbody: photos.fullbody ?? '',
      'profile-left': photos.profileLeft ?? '',
      'profile-right': photos.profileRight ?? '',
    }
    const additionalPaths = (photos.additional ?? []).slice(0, MAX_ADDITIONAL)

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
      pronouns: null,
      gender_identity:
        payload.genderIdentity == null || payload.genderIdentity === ''
          ? null
          : payload.genderIdentity === 'Prefer to self-describe' && payload.genderIdentityOther
            ? `Self-described: ${payload.genderIdentityOther}`
            : String(payload.genderIdentity),
      city: String(payload.city ?? ''),
      state_region: null,
      country: 'United States',
      date_of_birth: dob,
      age_at_submission: ageFromDob(dob),
      is_adult: true,
      height_cm: Number(payload.heightCm),
      bust_cm:
        payload.bustUnsure || payload.bustCm == null
          ? null
          : Number(payload.bustCm),
      waist_cm:
        payload.waistUnsure || payload.waistCm == null
          ? null
          : Number(payload.waistCm),
      hips_cm:
        payload.hipsUnsure || payload.hipsCm == null
          ? null
          : Number(payload.hipsCm),
      size_tops: String(payload.sizeTops ?? ''),
      size_bottoms: String(payload.sizeBottoms ?? ''),
      size_dress_suit: String(payload.sizeDressSuit ?? ''),
      shoe_size_us: Number(payload.shoeSizeUs),
      hair_color: null,
      eye_color: null,
      heritage: null,
      modeling_experience: String(payload.modelingExperience ?? ''),
      has_agency: !!payload.hasAgency,
      agency_name: payload.hasAgency
        ? (payload.agencyName as string | null) || null
        : null,
      unions: [],
      special_skills: [],
      special_skills_notes: null,
      markings_notes: null,
      headshot_url: slotPaths['headshot'] || '',
      fullbody_url: slotPaths['fullbody'] || '',
      profile_left_url: slotPaths['profile-left'] || '',
      profile_right_url: slotPaths['profile-right'] || '',
      additional_photo_urls: additionalPaths,
      instagram_handle: igHandle,
      tiktok_handle: tiktokHandle,
      portfolio_url: portfolio,
      travel_availability: String(payload.travelAvailability ?? ''),
      earliest_available: null,
      why_tfr: ((payload.whyTfr as string | null) ?? '').trim() || null,
      how_heard:
        payload.howHeard === 'Other' && payload.howHeardOther
          ? `Other: ${payload.howHeardOther}`
          : String(payload.howHeard ?? ''),
      additional_notes: (payload.additionalNotes as string | null)?.trim() || null,
      flagged_spam: flaggedSpam,
    }

    const { error: insertError } = await supabase
      .from('tfr_model_submissions')
      .insert(insertRow)

    if (insertError) {
      console.error('insert error', insertError)
      const detail =
        insertError.message ||
        insertError.details ||
        insertError.hint ||
        'Database error'
      return NextResponse.json(
        { ok: false, error: `Database error: ${detail}` },
        { status: 500 },
      )
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
            location: insertRow.city,
            genderIdentity: insertRow.gender_identity,
            age: insertRow.age_at_submission,
            heightCm: insertRow.height_cm,
            bustCm: insertRow.bust_cm ?? null,
            waistCm: insertRow.waist_cm ?? null,
            hipsCm: insertRow.hips_cm ?? null,
            sizeTops: insertRow.size_tops,
            sizeBottoms: insertRow.size_bottoms,
            sizeDressSuit: insertRow.size_dress_suit,
            shoeSizeUs: insertRow.shoe_size_us,
            modelingExperience: insertRow.modeling_experience,
            hasAgency: insertRow.has_agency,
            agencyName: insertRow.agency_name,
            instagramHandle: insertRow.instagram_handle,
            travelAvailability: insertRow.travel_availability,
            whyTfr: insertRow.why_tfr,
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
