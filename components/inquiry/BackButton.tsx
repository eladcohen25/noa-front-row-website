'use client'

interface BackButtonProps {
  onClick: () => void
  hidden?: boolean
}

export default function BackButton({ onClick, hidden }: BackButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Back to previous question"
      className={`fixed top-4 left-4 md:top-6 md:left-6 z-40 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] py-2 px-3 rounded-full hover:bg-black/[0.04] transition-opacity ${
        hidden ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ marginTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path
          d="M7.5 2.5L4 6L7.5 9.5"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>Back</span>
    </button>
  )
}
