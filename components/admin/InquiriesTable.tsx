'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import StatusPill from './StatusPill'
import { useToast } from './Toast'
import {
  formatRelativeTime,
  getIdentifier,
  INQUIRER_TYPE_COLORS,
  INQUIRER_TYPE_LABELS,
  PAGE_SIZE,
  type InquiryRow,
  type InquiryStatus,
} from '@/lib/admin/inquiries'
import { createBrowserClient } from '@/lib/supabase/client'

interface InquiriesTableProps {
  rows: InquiryRow[]
  total: number
  page: number
  canEdit?: boolean
}

export default function InquiriesTable({
  rows,
  total,
  page,
  canEdit = true,
}: InquiriesTableProps) {
  const router = useRouter()
  const params = useSearchParams()
  const toast = useToast()

  const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const goToPage = (p: number) => {
    const usp = new URLSearchParams(params.toString())
    if (p <= 1) usp.delete('page')
    else usp.set('page', String(p))
    router.push(`/admin?${usp.toString()}`)
  }

  const updateStatus = async (id: string, next: InquiryStatus) => {
    const supabase = createBrowserClient()
    const updates: Record<string, unknown> = { status: next }
    if (next === 'contacted') {
      const target = rows.find((r) => r.id === id)
      if (target && !target.contacted_at) {
        updates.contacted_at = new Date().toISOString()
      }
    }
    const { error } = await supabase.from('tfr_inquiries').update(updates).eq('id', id)
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
        No inquiries match these filters.
      </div>
    )
  }

  return (
    <div className="border border-zinc-200 rounded-md bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr className="text-left text-[11px] uppercase tracking-wider text-zinc-500">
              <th className="px-4 py-2.5 font-medium">Created</th>
              <th className="px-4 py-2.5 font-medium">Type</th>
              <th className="px-4 py-2.5 font-medium">Name</th>
              <th className="px-4 py-2.5 font-medium">Email</th>
              <th className="px-4 py-2.5 font-medium">City</th>
              <th className="px-4 py-2.5 font-medium">Identifier</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 font-medium" aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-zinc-100 hover:bg-zinc-50/60 transition-colors cursor-pointer"
                onClick={() => router.push(`/admin/inquiries/${row.id}`)}
              >
                <td className="px-4 py-3 text-zinc-600 whitespace-nowrap">
                  {formatRelativeTime(row.created_at)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium border rounded-full ${INQUIRER_TYPE_COLORS[row.inquirer_type]}`}
                  >
                    {INQUIRER_TYPE_LABELS[row.inquirer_type]}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium">{row.name}</td>
                <td className="px-4 py-3 text-zinc-600">
                  <a
                    href={`mailto:${row.email}`}
                    onClick={(e) => e.stopPropagation()}
                    className="hover:text-black"
                  >
                    {row.email}
                  </a>
                </td>
                <td className="px-4 py-3 text-zinc-600">{row.city}</td>
                <td className="px-4 py-3 text-zinc-600 max-w-[200px] truncate">
                  {getIdentifier(row)}
                </td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <StatusPill
                    status={row.status}
                    onChange={canEdit ? (next) => updateStatus(row.id, next) : undefined}
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/inquiries/${row.id}`}
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
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-200 text-xs text-zinc-500">
        <div>
          Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(total, page * PAGE_SIZE)} of {total}
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
