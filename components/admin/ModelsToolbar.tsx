'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import AdminButton from './AdminButton'

export default function ModelsToolbar({ total }: { total: number }) {
  const router = useRouter()
  const params = useSearchParams()
  const exportUrl = `/api/admin/models/export?${params.toString()}`

  return (
    <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
      <div>
        <h1 className="text-xl font-semibold">Models</h1>
        <p className="text-xs text-zinc-500">
          {total} matching · all photos load via 1-hour signed URLs.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <AdminButton variant="secondary" size="sm" onClick={() => router.refresh()}>
          Refresh
        </AdminButton>
        <a
          href={exportUrl}
          className="inline-flex items-center gap-2 text-sm border border-zinc-300 bg-white text-black px-4 py-2 rounded-md hover:bg-zinc-50"
        >
          Export CSV
        </a>
      </div>
    </div>
  )
}
