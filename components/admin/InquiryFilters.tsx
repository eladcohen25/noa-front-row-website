'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ChangeEvent, useEffect, useState } from 'react'
import {
  HOW_HEARD,
  INQUIRER_TYPES,
  INQUIRER_TYPE_LABELS,
  INQUIRY_STATUSES,
  STATUS_LABELS,
} from '@/lib/admin/inquiries'

const RANGE_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'All time' },
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
]

const FILTER_KEYS = ['type', 'status', 'range', 'howHeard', 'search'] as const
const DEFAULTS: Record<string, string> = { range: 'all' }

export default function InquiryFilters() {
  const router = useRouter()
  const params = useSearchParams()
  const [search, setSearch] = useState(params.get('search') ?? '')

  useEffect(() => {
    setSearch(params.get('search') ?? '')
  }, [params])

  const update = (next: Record<string, string | null>) => {
    const usp = new URLSearchParams(params.toString())
    for (const [k, v] of Object.entries(next)) {
      if (v === null || v === '' || v === undefined) {
        usp.delete(k)
      } else {
        usp.set(k, v)
      }
    }
    usp.delete('page')
    router.push(`/admin?${usp.toString()}`)
  }

  const onChangeSelect = (key: string) => (e: ChangeEvent<HTMLSelectElement>) => {
    update({ [key]: e.target.value === 'all' ? null : e.target.value })
  }

  // Debounced search
  useEffect(() => {
    const handle = setTimeout(() => {
      const current = params.get('search') ?? ''
      if (search === current) return
      update({ search: search || null })
    }, 300)
    return () => clearTimeout(handle)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const clearSearch = () => {
    setSearch('')
    update({ search: null })
  }

  const hasActiveFilters = FILTER_KEYS.some((k) => {
    const v = params.get(k)
    if (!v) return false
    return v !== DEFAULTS[k]
  })

  const clearAllFilters = () => {
    setSearch('')
    router.push('/admin')
  }

  return (
    <div className="space-y-2 mb-4">
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </span>
        <input
          type="text"
          placeholder="Search by name, email, brand, property, or club…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-sm pl-9 pr-9 py-2.5 border border-zinc-300 rounded-md bg-white focus:outline-none focus:border-black"
        />
        {search && (
          <button
            type="button"
            onClick={clearSearch}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={params.get('type') ?? 'all'}
          onChange={onChangeSelect('type')}
          className="text-xs px-3 py-2 border border-zinc-300 rounded-md bg-white"
        >
          <option value="all">All types</option>
          {INQUIRER_TYPES.map((t) => (
            <option key={t} value={t}>
              {INQUIRER_TYPE_LABELS[t]}
            </option>
          ))}
        </select>

        <select
          value={params.get('status') ?? 'all'}
          onChange={onChangeSelect('status')}
          className="text-xs px-3 py-2 border border-zinc-300 rounded-md bg-white"
        >
          <option value="all">All statuses (excl. archived)</option>
          {INQUIRY_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>

        <select
          value={params.get('range') ?? 'all'}
          onChange={onChangeSelect('range')}
          className="text-xs px-3 py-2 border border-zinc-300 rounded-md bg-white"
        >
          {RANGE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <select
          value={params.get('howHeard') ?? 'all'}
          onChange={onChangeSelect('howHeard')}
          className="text-xs px-3 py-2 border border-zinc-300 rounded-md bg-white"
        >
          <option value="all">All sources</option>
          {HOW_HEARD.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-xs text-zinc-600 hover:text-black underline underline-offset-2 ml-auto"
          >
            Clear all filters
          </button>
        )}
      </div>
    </div>
  )
}
