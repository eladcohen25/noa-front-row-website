import Link from 'next/link'
import { notFound } from 'next/navigation'
import ModelDetail from '@/components/admin/ModelDetail'
import { requireUser } from '@/lib/admin/auth'
import { getModelSubmission, signPhotoUrls } from '@/lib/admin/models'
import { effectivePermissions, getAdminProfile } from '@/lib/admin/permissions'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: { id: string }
}

export default async function ModelDetailPage({ params }: PageProps) {
  const { supabase } = await requireUser()
  const profileResult = await getAdminProfile(supabase)
  const permissions = effectivePermissions(profileResult?.profile ?? null)

  const submission = await getModelSubmission(supabase, params.id)
  if (!submission) notFound()

  const allPaths = [
    submission.headshot_url,
    submission.fullbody_url,
    submission.profile_left_url,
    submission.profile_right_url,
    ...(submission.additional_photo_urls ?? []),
  ].filter(Boolean)

  const signedUrls = await signPhotoUrls(supabase, allPaths)

  return (
    <div>
      <Link
        href="/admin/models"
        className="text-xs text-zinc-500 hover:text-black inline-flex items-center gap-1 mb-2"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path
            d="M6 2L3 5L6 8"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        All models
      </Link>
      <h1 className="text-xl font-semibold mb-1">{submission.full_name}</h1>
      <p className="text-xs text-zinc-500 mb-6">
        Age {submission.age_at_submission ?? '—'} · {submission.city}
      </p>
      <ModelDetail
        submission={submission}
        signedUrls={signedUrls}
        canEdit={permissions.edit_models}
      />
    </div>
  )
}
