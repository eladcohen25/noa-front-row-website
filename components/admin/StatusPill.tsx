'use client'

import { Fragment, useEffect, useRef, useState } from 'react'
import {
  INQUIRY_STATUSES,
  STATUS_COLORS,
  STATUS_LABELS,
  type InquiryStatus,
} from '@/lib/admin/inquiries'

interface StatusPillProps {
  status: InquiryStatus
  onChange?: (next: InquiryStatus) => void | Promise<void>
  disabled?: boolean
}

export default function StatusPill({ status, onChange, disabled }: StatusPillProps) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const cls = STATUS_COLORS[status]

  if (!onChange) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-medium border rounded-full ${cls}`}>
        {STATUS_LABELS[status]}
      </span>
    )
  }

  const select = async (next: InquiryStatus) => {
    if (next === status || pending) {
      setOpen(false)
      return
    }
    setPending(true)
    try {
      await onChange(next)
    } finally {
      setPending(false)
      setOpen(false)
    }
  }

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          if (!disabled && !pending) setOpen((v) => !v)
        }}
        disabled={disabled || pending}
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-medium border rounded-full transition-colors ${cls} ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'
        }`}
      >
        {pending ? (
          <span className="inline-block w-2.5 h-2.5 border border-current border-t-transparent rounded-full animate-spin" />
        ) : null}
        {STATUS_LABELS[status]}
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
          <path d="M1.5 3L4 5.5L6.5 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-30 min-w-[160px] bg-white border border-zinc-200 rounded-md shadow-lg py-1">
          {INQUIRY_STATUSES.map((s) => (
            <Fragment key={s}>
              <button
                type="button"
                onClick={() => select(s)}
                className={`w-full text-left text-xs px-3 py-1.5 hover:bg-zinc-50 ${
                  s === status ? 'font-semibold' : ''
                }`}
              >
                {STATUS_LABELS[s]}
              </button>
            </Fragment>
          ))}
        </div>
      )}
    </div>
  )
}
