'use client'

import { useEffect } from 'react'
import TextInput from './TextInput'

interface SelectButtonsProps<T extends string> {
  options: readonly T[]
  value?: T
  onChange: (value: T) => void
  numbered?: boolean
  otherOption?: T
  otherText?: string
  onOtherTextChange?: (text: string) => void
  otherPlaceholder?: string
}

export default function SelectButtons<T extends string>({
  options,
  value,
  onChange,
  numbered = true,
  otherOption,
  otherText,
  onOtherTextChange,
  otherPlaceholder = 'Tell us more',
}: SelectButtonsProps<T>) {
  useEffect(() => {
    if (!numbered) return
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return
      const num = parseInt(e.key, 10)
      if (!Number.isNaN(num) && num >= 1 && num <= options.length) {
        onChange(options[num - 1])
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [options, onChange, numbered])

  const showOther = otherOption !== undefined && value === otherOption && onOtherTextChange

  return (
    <div className="flex flex-col gap-3 w-full">
      {options.map((option, idx) => {
        const selected = value === option
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`group flex items-center gap-4 text-left px-5 py-4 md:py-5 rounded-full border transition-all min-h-[52px] ${
              selected
                ? 'border-black bg-black text-white'
                : 'border-gold/60 text-black hover:border-gold hover:bg-gold/[0.06]'
            }`}
          >
            {numbered && (
              <span
                className={`flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-[10px] uppercase tracking-wider font-la-foonte transition-colors ${
                  selected ? 'border-white/60 text-white' : 'border-gold/70 text-gold-deep group-hover:text-black group-hover:border-gold'
                }`}
              >
                {idx + 1}
              </span>
            )}
            <span className="text-sm md:text-base">{option}</span>
          </button>
        )
      })}

      {showOther && (
        <div className="pl-5 pt-2">
          <TextInput
            autoFocus
            placeholder={otherPlaceholder}
            value={otherText || ''}
            onChange={(e) => onOtherTextChange?.(e.target.value)}
          />
        </div>
      )}
    </div>
  )
}
