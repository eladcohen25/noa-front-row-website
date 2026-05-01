import { notFound } from 'next/navigation'
import PageEditor from '@/components/admin/PageEditor'
import { requireUser } from '@/lib/admin/auth'
import { getPageContentRows, PAGE_GROUPS } from '@/lib/admin/content'
import { effectivePermissions, getAdminProfile } from '@/lib/admin/permissions'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: { page: string }
}

export default async function ContentEditorPage({ params }: PageProps) {
  const { user, supabase } = await requireUser()
  const profileResult = await getAdminProfile(supabase)
  const permissions = effectivePermissions(profileResult?.profile ?? null)
  const group = PAGE_GROUPS.find((g) => g.key === params.page)
  if (!group) notFound()

  const fields = await getPageContentRows(params.page)
  if (fields.length === 0) {
    return (
      <div className="bg-white border border-zinc-200 rounded-md p-6 text-sm text-zinc-500">
        No fields seeded for this page yet. Run the migration in{' '}
        <code>supabase/migrations/20260430_admin_cms.sql</code>.
      </div>
    )
  }

  return (
    <PageEditor
      page={params.page}
      pageLabel={group.label}
      livePath={group.livePath}
      description={group.description}
      fields={fields}
      userId={user.id}
      canEdit={permissions.edit_content}
    />
  )
}
