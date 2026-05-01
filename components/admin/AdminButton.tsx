'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md'

interface AdminButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-black text-white hover:bg-zinc-800 disabled:bg-zinc-300',
  secondary:
    'border border-zinc-300 text-black bg-white hover:bg-zinc-50 disabled:opacity-50',
  ghost: 'text-zinc-600 hover:bg-zinc-100 disabled:opacity-50',
  danger:
    'border border-rose-200 text-rose-700 bg-white hover:bg-rose-50 disabled:opacity-50',
}

const SIZES: Record<Size, string> = {
  sm: 'text-xs px-3 py-1.5 rounded-md',
  md: 'text-sm px-4 py-2 rounded-md',
}

const AdminButton = forwardRef<HTMLButtonElement, AdminButtonProps>(
  ({ variant = 'primary', size = 'md', loading, disabled, children, className = '', ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        {...props}
        className={`inline-flex items-center justify-center gap-2 font-medium transition-colors disabled:cursor-not-allowed ${SIZES[size]} ${VARIANTS[variant]} ${className}`}
      >
        {loading && (
          <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </button>
    )
  },
)

AdminButton.displayName = 'AdminButton'

export default AdminButton
