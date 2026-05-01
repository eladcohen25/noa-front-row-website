'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import ModelStatusPill from './ModelStatusPill'
import { useToast } from './Toast'
import {
  MODEL_PAGE_SIZE,
  type ModelRow,
  type ModelStatus,
} from '@/lib/admin/models'
import { cmToFtIn } from '@/lib/models/units'
import { formatRelativeTime } from '@/lib/admin/inquiries'
import { createBrowserClient } from '@/lib/supabase/client'

interface ModelsTableProps {
  rows: ModelRow[]
  total: number
  page: number
  thumbnails: Record<string, string>
  canEdit?: boolean
}

export default function ModelsTable({
  rows,
  total,
  page,
  thumbnails,
  canEdit = true,
}: ModelsTableProps) {
  const router = useRouter()
  const params = useSearchParams()
  const toast = useToast()
  const lastPage = Math.max(1, Math.ceil(total / MODEL_PAGE_SIZE))

  const goToPage = (p: number) => {
    const usp = new URLSearchParams(params.toString())
    if (p <= 1) usp.delete('page')
    else usp.set('page', String(p))
    router.push(`/admin/models?${usp.toString()}`)
  }

  const updateStatus = async (id: string, next: ModelStatus) => {
    const supabase = createBrowserClient()
    const updates: Record<string, unknown> = { status: next }
    if (next === 'contacted') updates.contacted_at = new Date().toISOString()
    const { error } = await supabase.from('tfr_model_submissions').update(updates).eq('id', id)
    if (error) {
      toast.error('Could not update status')
      return
    }
    toast.success('Status updated')
    router.refresh()
  }

  if (rows.length === 0) {
    return (
      <div className="border border-zinc-200 rounded-md bg-white py-16 text-center text-sm text-zinc-500">
        No model submissions match these filters.
      </div>
    )
  }

  return (
    <div className="border border-zinc-200 rounded-md bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr className="text-left text-[11px] uppercase tracking-wider text-zinc-500">
              <th className="px-4 py-2.5 font-medium w-14"></th>
              <th className="px-4 py-2.5 font-medium">Name</th>
              <th className="px-4 py-2.5 font-medium">Age</th>
              <th className="px-4 py-2.5 font-medium">Pronouns</th>
              <th className="px-4 py-2.5 font-medium">Height</th>
              <th className="px-4 py-2.5 font-medium">Location</th>
              <th className="px-4 py-2.5 font-medium">Agency</th>
              <th className="px-4 py-2.5 font-medium">Submitted</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 font-medium" aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const thumb = thumbnails[row.headshot_url]
              const { feet, inches } = cmToFtIn(row.height_cm)
              return (
                <tr
                  key={row.id}
                  className="border-b border-zinc-100 hover:bg-zinc-50/60 transition-colors cursor-pointer"
                  onClick={() => router.push(`/admin/models/${row.id}`)}
                >
                  <td className="px-4 py-2">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-100">
                      {thumb && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={thumb} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium">{row.full_name}</td>
                  <td className="px-4 py-3 text-zinc-700">{row.age_at_submission ?? '—'}</td>
                  <td className="px-4 py-3 text-zinc-600">{row.pronouns ?? '—'}</td>
                  <td className="px-4 py-3 text-zinc-600 whitespace-nowrap">
                    {feet}&prime;{inches}&Prime; / {row.height_cm}cm
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {[row.city, row.state_region].filter(Boolean).join(', ')}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {row.has_agency ? (
                      <span className="text-emerald-700">{row.agency_name || 'Yes'}</span>
                    ) : (
                      <span className="text-zinc-400">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-500 whitespace-nowrap">
                    {formatRelativeTime(row.created_at)}
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <ModelStatusPill
                      status={row.status}
                      onChange={canEdit ? (next) => updateStatus(row.id, next) : undefined}
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/models/${row.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-zinc-400 hover:text-black inline-block"
                      aria-label="Open"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path
                          d="M5 3L9 7L5 11"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-200 text-xs text-zinc-500">
        <div>
          Showing {(page - 1) * MODEL_PAGE_SIZE + 1}–
          {Math.min(total, page * MODEL_PAGE_SIZE)} of {total}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}
            className="px-2 py-1 border border-zinc-200 rounded-md disabled:opacity-40"
          >
            ←
          </button>
          <span>
            Page {page} of {lastPage}
          </span>
          <button
            type="button"
            onClick={() => goToPage(page + 1)}
            disabled={page >= lastPage}
            className="px-2 py-1 border border-zinc-200 rounded-md disabled:opacity-40"
          >
            →
          </button>
        </div>
      </div>
    </div>
  )
}
