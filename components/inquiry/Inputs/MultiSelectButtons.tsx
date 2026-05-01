'use client'

import TextInput from './TextInput'

interface MultiSelectButtonsProps<T extends string> {
  options: readonly T[]
  value: T[]
  onChange: (value: T[]) => void
  otherOption?: T
  otherText?: string
  onOtherTextChange?: (text: string) => void
  otherPlaceholder?: string
}

export default function MultiSelectButtons<T extends string>({
  options,
  value,
  onChange,
  otherOption,
  otherText,
  onOtherTextChange,
  otherPlaceholder = 'Tell us more',
}: MultiSelectButtonsProps<T>) {
  const toggle = (option: T) => {
    if (value.includes(option)) {
      onChange(value.filter((v) => v !== option))
    } else {
      onChange([...value, option])
    }
  }

  const showOther =
    otherOption !== undefined && value.includes(otherOption) && onOtherTextChange

  return (
    <div className="flex flex-col gap-3 w-full">
      {options.map((option) => {
        const selected = value.includes(option)
        return (
          <button
            key={option}
            type="button"
            onClick={() => toggle(option)}
            className={`flex items-center gap-4 text-left px-5 py-4 md:py-5 rounded-full border transition-all min-h-[52px] ${
              selected
                ? 'border-black bg-black text-white'
                : 'border-gold/60 text-black hover:border-gold hover:bg-gold/[0.06]'
            }`}
          >
            <span
              className={`flex-shrink-0 w-5 h-5 rounded-sm border flex items-center justify-center transition-colors ${
                selected ? 'border-white bg-white' : 'border-gold/70'
              }`}
            >
              {selected && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2 6L5 9L10 3"
                    stroke="black"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
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
