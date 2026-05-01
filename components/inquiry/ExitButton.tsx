'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface ExitButtonProps {
  hidden?: boolean
}

export default function ExitButton({ hidden }: ExitButtonProps) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)

  return (
    <div
      className={`fixed top-4 right-4 md:top-6 md:right-6 z-40 transition-opacity ${
        hidden ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ marginTop: 'env(safe-area-inset-top, 0px)' }}
    >
      {confirming ? (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="text-[10px] uppercase tracking-[0.25em] py-2 px-3 rounded-full border border-black/30 hover:bg-black hover:text-white hover:border-black transition-colors"
          >
            Leave
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="text-[10px] uppercase tracking-[0.25em] py-2 px-3 rounded-full hover:bg-black/[0.04] transition-colors"
          >
            Stay
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          aria-label="Exit form"
          className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] py-2 px-3 rounded-full hover:bg-black/[0.04] transition-colors"
        >
          <span>Exit</span>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path
              d="M2 2L8 8M8 2L2 8"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </div>
  )
}
