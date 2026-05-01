import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { inquirySchema } from '@/lib/inquiry/schema'
import {
  buildInquirerEmailHtml,
  buildTfrEmailHtml,
  getResend,
} from '@/lib/resend'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const STORAGE_BUCKET = 'tfr-inquiry-uploads'
const MAX_FILES = 3
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024
const ALLOWED_MIME = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/heic',
  'image/heif',
])

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env vars missing')
  return createClient(url, key, { auth: { persistSession: false } })
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || ''
    let inquirerType = ''
    let detailsRaw = '{}'
    let contactRaw = '{}'
    let website = ''
    let files: File[] = []

    if (contentType.includes('multipart/form-data')) {
      const fd = await req.formData()
      inquirerType = String(fd.get('inquirerType') || '')
      detailsRaw = String(fd.get('details') || '{}')
      contactRaw = String(fd.get('contact') || '{}')
      website = String(fd.get('website') || '')
      const fileEntries = fd.getAll('files')
      files = fileEntries.filter((f): f is File => f instanceof File)
    } else {
      const body = await req.json()
      inquirerType = body.inquirerType ?? ''
      detailsRaw = JSON.stringify(body.details ?? {})
      contactRaw = JSON.stringify(body.contact ?? {})
      website = body.website ?? ''
    }

    let details: Record<string, unknown> = {}
    let contact: Record<string, unknown> = {}
    try {
      details = JSON.parse(detailsRaw)
      contact = JSON.parse(contactRaw)
    } catch {
      return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
    }

    const flaggedSpam = website.trim().length > 0

    // Validate non-spam payloads strictly. Spam still gets stored (flagged) but skips email.
    if (!flaggedSpam) {
      const parsed = inquirySchema.safeParse({ inquirerType, details, contact })
      if (!parsed.success) {
        return NextResponse.json(
          { ok: false, error: 'Validation failed', issues: parsed.error.flatten() },
          { status: 400 },
        )
      }
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json({ ok: false, error: 'Too many files' }, { status: 400 })
    }
    for (const f of files) {
      if (f.size > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json({ ok: false, error: 'File too large' }, { status: 400 })
      }
      if (f.type && !ALLOWED_MIME.has(f.type)) {
        // Allow heic with empty mime on iOS
        if (!f.name.match(/\.(pdf|jpe?g|png|heic|heif)$/i)) {
          return NextResponse.json({ ok: false, error: 'Unsupported file type' }, { status: 400 })
        }
      }
    }

    const supabase = getServiceClient()

    const fileUrls: string[] = []
    if (!flaggedSpam && files.length > 0) {
      for (const file of files) {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
        const path = `${Date.now()}-${crypto.randomUUID()}-${safeName}`
        const buf = Buffer.from(await file.arrayBuffer())
        const { error: uploadError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(path, buf, {
            contentType: file.type || 'application/octet-stream',
            upsert: false,
          })
        if (uploadError) {
          console.error('Upload error', uploadError)
          continue
        }
        const { data: signed } = await supabase.storage
          .from(STORAGE_BUCKET)
          .createSignedUrl(path, 60 * 60 * 24 * 30)
        if (signed?.signedUrl) fileUrls.push(signed.signedUrl)
      }
    }

    const contactName = String(contact.name ?? '').trim()
    const contactEmail = String(contact.email ?? '').trim()
    const contactPhone = String(contact.phone ?? '').trim()
    const contactCity = String(contact.city ?? '').trim()
    const howHeard = contact.howHeard ? String(contact.howHeard) : null
    const additionalNotes =
      typeof details.additionalNotes === 'string' && details.additionalNotes.trim()
        ? String(details.additionalNotes)
        : null

    const { error: insertError } = await supabase.from('tfr_inquiries').insert({
      inquirer_type: inquirerType,
      name: contactName || 'Unknown',
      email: contactEmail || 'unknown@unknown.invalid',
      phone: contactPhone || '',
      city: contactCity || 'unknown',
      how_heard: howHeard,
      details,
      file_urls: fileUrls,
      additional_notes: additionalNotes,
      flagged_spam: flaggedSpam,
    })

    if (insertError) {
      console.error('Supabase insert error', insertError)
      return NextResponse.json({ ok: false, error: 'Database error' }, { status: 500 })
    }

    if (flaggedSpam) {
      // Silent success for bots
      return NextResponse.json({ ok: true })
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
          replyTo: contactEmail,
          subject: `New TFR inquiry — ${labelForType(inquirerType)} — ${contactName}`,
          html: buildTfrEmailHtml({
            inquirerType,
            contact: {
              name: contactName,
              email: contactEmail,
              phone: contactPhone,
              city: contactCity,
              howHeard: howHeard ?? undefined,
            },
            details,
            fileUrls,
            createdAt,
          }),
        })

        await resend.emails.send({
          from: fromAddress,
          to: contactEmail,
          subject: 'We received your inquiry — The Front Row',
          html: buildInquirerEmailHtml(contactName),
        })
      } catch (mailErr) {
        console.error('Resend error', mailErr)
        // Don't fail the request — submission is in DB
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    console.error('inquire route error', err)
    const message = err instanceof Error ? err.message : 'Unexpected error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

function labelForType(type: string): string {
  switch (type) {
    case 'hotel':
      return 'Hotel or Property'
    case 'club':
      return 'Private Club'
    case 'brand':
      return 'Brand'
    case 'creative':
      return 'Creative / Model / Beauty'
    case 'community':
      return 'Community'
    default:
      return type
  }
}
