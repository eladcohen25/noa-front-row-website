'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { TRAVEL_OPTIONS } from '@/lib/models/schema'
import { MODEL_STATUSES, MODEL_STATUS_LABELS } from '@/lib/admin/models'

const FILTER_KEYS = [
  'status',
  'search',
  'hasAgency',
  'travel',
  'ageMin',
  'ageMax',
  'heightMin',
  'heightMax',
  'city',
  'stateRegion',
] as const

export default function ModelFilters() {
  const router = useRouter()
  const params = useSearchParams()
  const [search, setSearch] = useState(params.get('search') ?? '')

  useEffect(() => {
    const t = setTimeout(() => {
      const usp = new URLSearchParams(params.toString())
      if (search.trim()) usp.set('search', search.trim())
      else usp.delete('search')
      usp.delete('page')
      router.push(`/admin/models?${usp.toString()}`)
    }, 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const update = (entries: Record<string, string | null>) => {
    const usp = new URLSearchParams(params.toString())
    for (const [k, v] of Object.entries(entries)) {
      if (v === null || v === '') usp.delete(k)
      else usp.set(k, v)
    }
    usp.delete('page')
    router.push(`/admin/models?${usp.toString()}`)
  }

  const select = (key: string) => (e: React.ChangeEvent<HTMLSelectElement>) =>
    update({ [key]: e.target.value === 'all' ? null : e.target.value })

  const text = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    update({ [key]: e.target.value || null })

  const hasActiveFilters = FILTER_KEYS.some((k) => !!params.get(k))

  const inputCls = 'text-xs px-3 py-2 border border-zinc-300 rounded-md bg-white'

  return (
    <div className="space-y-2 mb-4">
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, IG handle, or city..."
          className="w-full text-sm px-10 py-3 border border-zinc-300 rounded-md bg-white focus:outline-none focus:border-black"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select value={params.get('status') ?? 'all'} onChange={select('status')} className={inputCls}>
          <option value="all">All statuses (excl. archived)</option>
          {MODEL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {MODEL_STATUS_LABELS[s]}
            </option>
          ))}
        </select>

        <select value={params.get('hasAgency') ?? 'all'} onChange={select('hasAgency')} className={inputCls}>
          <option value="all">Agency: all</option>
          <option value="yes">Has agency</option>
          <option value="no">No agency</option>
        </select>

        <select value={params.get('travel') ?? 'all'} onChange={select('travel')} className={inputCls}>
          <option value="all">Any travel</option>
          {TRAVEL_OPTIONS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Min age"
          value={params.get('ageMin') ?? ''}
          onChange={text('ageMin')}
          className={`${inputCls} w-24`}
          min={18}
          max={80}
        />
        <input
          type="number"
          placeholder="Max age"
          value={params.get('ageMax') ?? ''}
          onChange={text('ageMax')}
          className={`${inputCls} w-24`}
          min={18}
          max={80}
        />
        <input
          type="number"
          placeholder="Min ht (cm)"
          value={params.get('heightMin') ?? ''}
          onChange={text('heightMin')}
          className={`${inputCls} w-28`}
          min={120}
          max={230}
        />
        <input
          type="number"
          placeholder="Max ht (cm)"
          value={params.get('heightMax') ?? ''}
          onChange={text('heightMax')}
          className={`${inputCls} w-28`}
          min={120}
          max={230}
        />
        <input
          type="text"
          placeholder="City contains..."
          value={params.get('city') ?? ''}
          onChange={text('city')}
          className={`${inputCls} flex-1 min-w-[140px]`}
        />
        <input
          type="text"
          placeholder="State / region contains..."
          value={params.get('stateRegion') ?? ''}
          onChange={text('stateRegion')}
          className={`${inputCls} flex-1 min-w-[160px]`}
        />

        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => {
              setSearch('')
              router.push('/admin/models')
            }}
            className="text-xs text-zinc-600 hover:text-black underline underline-offset-2 ml-auto"
          >
            Clear all filters
          </button>
        )}
      </div>
    </div>
  )
}
