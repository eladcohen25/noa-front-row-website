'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface PreviewBannerProps {
  pageLabel: string
}

export default function PreviewBanner({ pageLabel }: PreviewBannerProps) {
  const router = useRouter()
  const [stopping, setStopping] = useState(false)

  const stop = async () => {
    setStopping(true)
    try {
      await fetch('/api/admin/content/preview', { method: 'DELETE' })
      router.refresh()
    } finally {
      setStopping(false)
    }
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-100 border-b border-amber-300 text-amber-900 text-xs">
      <div className="max-w-[1400px] mx-auto px-4 py-2 flex items-center justify-between gap-4">
        <span>
          <strong className="font-semibold">Previewing</strong> — unsaved changes to{' '}
          <em>{pageLabel}</em> are visible only to you.
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={stop}
            disabled={stopping}
            className="px-2.5 py-1 border border-amber-400 rounded hover:bg-amber-200 transition-colors"
          >
            {stopping ? 'Ending…' : 'Stop preview'}
          </button>
        </div>
      </div>
    </div>
  )
}
