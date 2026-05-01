import { notFound } from 'next/navigation'
import InquiryDetail from '@/components/admin/InquiryDetail'
import { requireUser } from '@/lib/admin/auth'
import type { InquiryRow } from '@/lib/admin/inquiries'
import { effectivePermissions, getAdminProfile } from '@/lib/admin/permissions'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: { id: string }
}

const SIGNED_URL_TTL_SECONDS = 60 * 60 // 1 hour

function tryParseStoragePath(url: string): string | null {
  try {
    const u = new URL(url)
    const parts = u.pathname.split('/').filter(Boolean)
    // Common Supabase storage URL shapes:
    //   .../storage/v1/object/sign/<bucket>/<path>?token=...
    //   .../storage/v1/object/public/<bucket>/<path>
    //   .../storage/v1/object/<bucket>/<path>
    const bucketIdx = parts.findIndex((p) => p === 'tfr-inquiry-uploads')
    if (bucketIdx >= 0) {
      return parts.slice(bucketIdx + 1).join('/').split('?')[0]
    }
    return null
  } catch {
    return null
  }
}

export default async function InquiryDetailPage({ params }: PageProps) {
  const { supabase } = await requireUser()
  const profileResult = await getAdminProfile(supabase)
  const permissions = effectivePermissions(profileResult?.profile ?? null)
  const canEdit = permissions.edit_inquiries
  const { data, error } = await supabase
    .from('tfr_inquiries')
    .select('*')
    .eq('id', params.id)
    .maybeSingle()

  if (error || !data) notFound()
  const inquiry = data as InquiryRow

  // Re-sign attachment URLs (originals are short-lived signed URLs from submission time).
  const fileLinks: { url: string; name: string }[] = []
  for (const url of inquiry.file_urls ?? []) {
    const path = tryParseStoragePath(url)
    if (!path) {
      fileLinks.push({ url, name: url.split('/').pop()?.split('?')[0] ?? 'file' })
      continue
    }
    const { data: signed } = await supabase.storage
      .from('tfr-inquiry-uploads')
      .createSignedUrl(path, SIGNED_URL_TTL_SECONDS)
    fileLinks.push({
      url: signed?.signedUrl ?? url,
      name: path.split('/').pop() ?? 'file',
    })
  }

  return <InquiryDetail inquiry={inquiry} fileLinks={fileLinks} canEdit={canEdit} />
}
