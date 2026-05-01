'use client'

import { forwardRef, InputHTMLAttributes, useState } from 'react'

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
  showError?: boolean
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ error, showError, className = '', ...props }, ref) => {
    const [focused, setFocused] = useState(false)

    return (
      <div className="w-full">
        <input
          ref={ref}
          {...props}
          onFocus={(e) => {
            setFocused(true)
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            setFocused(false)
            props.onBlur?.(e)
          }}
          className={`w-full bg-transparent border-b border-gold/60 py-3 text-lg md:text-2xl font-typekit-italic placeholder:text-black/30 focus:outline-none focus:border-gold transition-all ${className}`}
          style={{
            transform: focused ? 'scale(1.02)' : 'scale(1)',
            transformOrigin: 'left center',
            transition: 'transform 200ms ease-out, border-color 200ms ease-out',
          }}
        />
        {showError && error && (
          <p className="mt-3 text-xs uppercase tracking-[0.2em] text-black/60">{error}</p>
        )}
      </div>
    )
  }
)

TextInput.displayName = 'TextInput'

export default TextInput
