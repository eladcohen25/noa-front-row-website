'use client'

import { forwardRef, TextareaHTMLAttributes, useState } from 'react'

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
  showError?: boolean
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ error, showError, className = '', ...props }, ref) => {
    const [focused, setFocused] = useState(false)

    return (
      <div className="w-full">
        <textarea
          ref={ref}
          rows={4}
          {...props}
          onFocus={(e) => {
            setFocused(true)
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            setFocused(false)
            props.onBlur?.(e)
          }}
          className={`w-full bg-transparent border-b border-gold/60 py-3 text-base md:text-lg font-typekit-italic placeholder:text-black/30 focus:outline-none focus:border-gold resize-none ${className}`}
          style={{
            transform: focused ? 'scale(1.01)' : 'scale(1)',
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

TextArea.displayName = 'TextArea'

export default TextArea
