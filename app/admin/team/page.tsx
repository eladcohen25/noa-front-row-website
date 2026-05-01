import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/admin/auth'
import { effectivePermissions, getAdminProfile } from '@/lib/admin/permissions'
import { listTeamMembers } from '@/lib/admin/team'

export const dynamic = 'force-dynamic'

export default async function TeamListPage() {
  const { supabase } = await requireUser()
  const profileResult = await getAdminProfile(supabase)
  const permissions = effectivePermissions(profileResult?.profile ?? null)
  if (!permissions.manage_team) redirect('/admin?denied=manage_team')

  const members = await listTeamMembers(supabase)

  return (
    <div>
      <header className="mb-6 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold">Team</h1>
          <p className="text-xs text-zinc-500">
            {members.length} member{members.length === 1 ? '' : 's'} · only owners can add or remove.
          </p>
        </div>
        <Link
          href="/admin/team/new"
          className="text-sm bg-black text-white hover:bg-zinc-800 px-4 py-2 rounded-md"
        >
          + Add member
        </Link>
      </header>

      <div className="bg-white border border-zinc-200 rounded-md divide-y divide-zinc-100">
        {members.length === 0 ? (
          <div className="px-5 py-8 text-sm text-zinc-500 text-center">
            No team members yet. The owner row gets seeded by the migration once
            <code className="px-1">info@thefrontrow.vegas</code> exists in Supabase Auth.
          </div>
        ) : (
          members.map((m) => {
            const granted = Object.entries(m.permissions ?? {})
              .filter(([, v]) => v)
              .map(([k]) => k.replace(/_/g, ' '))
            return (
              <div key={m.id} className="px-5 py-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{m.display_name || m.email}</p>
                    <span
                      className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        m.role === 'owner'
                          ? 'bg-black text-white border-black'
                          : 'bg-zinc-50 text-zinc-700 border-zinc-200'
                      }`}
                    >
                      {m.role}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">{m.email}</p>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    {m.role === 'owner'
                      ? 'Full access to everything.'
                      : granted.length > 0
                        ? granted.join(' · ')
                        : 'No permissions granted.'}
                    {m.last_sign_in_at && (
                      <>
                        {' · last seen '}
                        {new Date(m.last_sign_in_at).toLocaleDateString()}
                      </>
                    )}
                  </p>
                </div>
                <div>
                  {m.role === 'owner' ? (
                    <span className="text-xs text-zinc-400">—</span>
                  ) : (
                    <Link
                      href={`/admin/team/${m.id}`}
                      className="text-sm border border-zinc-300 px-3 py-1.5 rounded-md hover:bg-zinc-50"
                    >
                      Edit
                    </Link>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
