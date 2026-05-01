import { notFound, redirect } from 'next/navigation'
import EditModeShell from './EditModeShell'
import { requireUser } from '@/lib/admin/auth'
import { getPageContent, PAGE_GROUPS } from '@/lib/admin/content'
import { effectivePermissions, getAdminProfile } from '@/lib/admin/permissions'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: { slug: string }
}

const SUPPORTED = new Set(['home', 'about', 'services', 'fw26'])

export default async function EditModePage({ params }: PageProps) {
  const { supabase } = await requireUser()
  const profileResult = await getAdminProfile(supabase)
  const permissions = effectivePermissions(profileResult?.profile ?? null)
  if (!permissions.view_content) redirect('/admin?denied=view_content')
  if (!permissions.edit_content) redirect('/admin/content/' + params.slug)

  const group = PAGE_GROUPS.find((g) => g.key === params.slug)
  if (!group || !SUPPORTED.has(params.slug)) notFound()

  const content = await getPageContent(params.slug)

  return (
    <EditModeShell
      page={params.slug}
      pageLabel={group.label}
      livePath={group.livePath}
      content={content}
    />
  )
}
