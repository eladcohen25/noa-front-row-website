'use client'

import { ButtonHTMLAttributes } from 'react'

interface ContinueButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string
  skipLabel?: string
  onSkip?: () => void
}

export default function ContinueButton({
  label = 'Continue',
  skipLabel,
  onSkip,
  disabled,
  className = '',
  ...props
}: ContinueButtonProps) {
  return (
    <div className="flex items-center gap-6 mt-2">
      <button
        type="button"
        disabled={disabled}
        {...props}
        className={`px-8 py-3 rounded-full text-xs uppercase tracking-wider border transition-colors min-h-[48px] ${
          disabled
            ? 'border-gold/30 text-black/30 cursor-not-allowed'
            : 'border-gold/70 text-black hover:bg-black hover:text-white hover:border-black'
        } ${className}`}
      >
        {label}
      </button>
      {skipLabel && onSkip && (
        <button
          type="button"
          onClick={onSkip}
          className="text-[10px] uppercase tracking-[0.25em] text-black/50 hover:text-black transition-colors"
        >
          {skipLabel}
        </button>
      )}
    </div>
  )
}
