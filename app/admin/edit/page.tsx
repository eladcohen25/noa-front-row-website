import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/admin/auth'
import { PAGE_GROUPS } from '@/lib/admin/content'
import { effectivePermissions, getAdminProfile } from '@/lib/admin/permissions'

export const dynamic = 'force-dynamic'

const SUPPORTED = new Set(['home', 'about', 'services', 'fw26'])

export default async function EditModeIndex() {
  const { supabase } = await requireUser()
  const profileResult = await getAdminProfile(supabase)
  const permissions = effectivePermissions(profileResult?.profile ?? null)
  if (!permissions.view_content) redirect('/admin?denied=view_content')

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-xl font-semibold">Visual editor</h1>
        <p className="text-xs text-zinc-500 max-w-xl">
          Click into a page below to see it rendered as it appears live, then click any text or image to edit it inline. Saves go live within ~1 minute.{' '}
          For bulk edits or fields that aren&apos;t hooked up yet, use{' '}
          <Link href="/admin/content" className="underline hover:text-black">
            the form editor
          </Link>
          .
        </p>
      </header>

      <div className="bg-white border border-zinc-200 rounded-md divide-y divide-zinc-100">
        {PAGE_GROUPS.map((group) => {
          const supported = SUPPORTED.has(group.key)
          return (
            <div key={group.key} className="px-5 py-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-medium text-sm">{group.label}</p>
                {group.description && (
                  <p className="text-xs text-zinc-500 mt-0.5">{group.description}</p>
                )}
                {!supported && (
                  <p className="text-[11px] text-amber-700 mt-1">
                    Not yet wired for inline editing — use the form editor for now.
                  </p>
                )}
              </div>
              {supported && permissions.edit_content ? (
                <Link
                  href={`/admin/edit/${group.key}`}
                  className="text-sm border border-zinc-300 px-3 py-1.5 rounded-md hover:bg-zinc-50"
                >
                  Open
                </Link>
              ) : (
                <Link
                  href={`/admin/content/${group.key}`}
                  className="text-sm text-zinc-500 hover:text-black px-3 py-1.5"
                >
                  Form editor →
                </Link>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
