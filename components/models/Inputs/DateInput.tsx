'use client'

interface DateInputProps {
  value: string
  onChange: (value: string) => void
  max?: string
  min?: string
  required?: boolean
  autoFocus?: boolean
}

/**
 * Lightweight date picker. Native <input type="date"> is good enough for
 * a casting form — accessible, mobile-friendly, no library cost.
 */
export default function DateInput({
  value,
  onChange,
  max,
  min,
  required,
  autoFocus,
}: DateInputProps) {
  return (
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      min={min}
      max={max}
      required={required}
      autoFocus={autoFocus}
      className="w-full bg-transparent border-b border-gold/60 py-3 text-lg md:text-2xl font-typekit-italic placeholder:text-black/30 focus:outline-none focus:border-gold transition-all"
    />
  )
}
