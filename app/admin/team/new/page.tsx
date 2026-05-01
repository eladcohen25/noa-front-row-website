import Link from 'next/link'
import { redirect } from 'next/navigation'
import InviteForm from '@/components/admin/InviteForm'
import { requireUser } from '@/lib/admin/auth'
import { effectivePermissions, getAdminProfile } from '@/lib/admin/permissions'

export const dynamic = 'force-dynamic'

export default async function InviteMemberPage() {
  const { supabase } = await requireUser()
  const profileResult = await getAdminProfile(supabase)
  const permissions = effectivePermissions(profileResult?.profile ?? null)
  if (!permissions.manage_team) redirect('/admin?denied=manage_team')

  return (
    <div>
      <Link
        href="/admin/team"
        className="text-xs text-zinc-500 hover:text-black inline-flex items-center gap-1 mb-2"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M6 2L3 5L6 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Team
      </Link>
      <h1 className="text-xl font-semibold mb-6">Add team member</h1>
      <InviteForm />
    </div>
  )
}
