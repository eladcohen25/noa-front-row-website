'use client'

import { useState } from 'react'
import { MODEL_STATUSES, MODEL_STATUS_COLORS, MODEL_STATUS_LABELS, type ModelStatus } from '@/lib/admin/models'

interface ModelStatusPillProps {
  status: ModelStatus
  onChange?: (next: ModelStatus) => void | Promise<void>
}

export default function ModelStatusPill({ status, onChange }: ModelStatusPillProps) {
  const [open, setOpen] = useState(false)
  const interactive = !!onChange

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => interactive && setOpen((v) => !v)}
        className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium border rounded-full ${MODEL_STATUS_COLORS[status]} ${
          interactive ? 'cursor-pointer' : 'cursor-default'
        }`}
      >
        {MODEL_STATUS_LABELS[status]}
        {interactive && (
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <path
              d="M2 3L4 5L6 3"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
      {open && (
        <div className="absolute top-full mt-1 left-0 z-20 bg-white border border-zinc-200 rounded-md shadow-lg py-1 min-w-[140px]">
          {MODEL_STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={async () => {
                setOpen(false)
                if (s !== status) await onChange?.(s)
              }}
              className={`w-full text-left px-3 py-1.5 text-xs hover:bg-zinc-50 ${
                s === status ? 'font-semibold' : ''
              }`}
            >
              {MODEL_STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
