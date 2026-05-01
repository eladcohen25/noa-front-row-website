import Link from 'next/link'
import { requireUser } from '@/lib/admin/auth'
import { getAllPageSummaries, PAGE_GROUPS } from '@/lib/admin/content'

export const dynamic = 'force-dynamic'

export default async function ContentIndexPage() {
  await requireUser()
  const summaries = await getAllPageSummaries()

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-xl font-semibold">Content</h1>
        <p className="text-xs text-zinc-500">
          Edit copy and images on the public site. Changes appear live within about a minute.
        </p>
      </header>

      <div className="bg-white border border-zinc-200 rounded-md divide-y divide-zinc-100">
        {PAGE_GROUPS.map((group) => {
          const summary = summaries.find((s) => s.page === group.key)
          return (
            <div key={group.key} className="px-5 py-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-medium text-sm">{group.label}</p>
                {group.description && (
                  <p className="text-xs text-zinc-500 mt-0.5">{group.description}</p>
                )}
                <p className="text-[11px] text-zinc-400 mt-1">
                  {summary?.fieldCount ?? 0} editable{' '}
                  {summary?.fieldCount === 1 ? 'field' : 'fields'}
                  {summary?.lastUpdated && (
                    <>
                      {' · last updated '}
                      {new Date(summary.lastUpdated).toLocaleDateString()}
                    </>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link
                  href={group.livePath}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-zinc-500 hover:text-black px-2 py-1.5"
                >
                  View live ↗
                </Link>
                <Link
                  href={`/admin/content/${group.key}`}
                  className="text-sm border border-zinc-300 px-3 py-1.5 rounded-md hover:bg-zinc-50"
                >
                  Edit
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
