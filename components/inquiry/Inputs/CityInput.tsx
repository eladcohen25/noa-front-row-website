'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { CITY_SUGGESTIONS } from './cityList'

interface CityInputProps {
  value: string
  onChange: (value: string) => void
  onEnter?: () => void
  onBlur?: () => void
  placeholder?: string
  showError?: boolean
  error?: string
}

export default function CityInput({
  value,
  onChange,
  onEnter,
  onBlur,
  placeholder = 'Start typing your city',
  showError,
  error,
}: CityInputProps) {
  const [focused, setFocused] = useState(false)
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const matches = useMemo(() => {
    const q = value.trim().toLowerCase()
    if (!q) return [] as string[]
    return CITY_SUGGESTIONS.filter((c) => c.toLowerCase().includes(q)).slice(0, 7)
  }, [value])

  useEffect(() => {
    setActiveIdx(-1)
  }, [matches.length])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const select = (city: string) => {
    onChange(city)
    setOpen(false)
    setActiveIdx(-1)
  }

  return (
    <div ref={wrapperRef} className="relative w-full">
      <input
        type="text"
        autoFocus
        autoComplete="off"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setOpen(true)
        }}
        onFocus={() => {
          setFocused(true)
          if (value.trim()) setOpen(true)
        }}
        onBlur={() => {
          setFocused(false)
          onBlur?.()
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            setOpen(true)
            setActiveIdx((idx) => Math.min(matches.length - 1, idx + 1))
          } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setActiveIdx((idx) => Math.max(-1, idx - 1))
          } else if (e.key === 'Enter') {
            if (open && activeIdx >= 0 && matches[activeIdx]) {
              e.preventDefault()
              select(matches[activeIdx])
            } else if (onEnter) {
              e.preventDefault()
              onEnter()
            }
          } else if (e.key === 'Escape') {
            setOpen(false)
          }
        }}
        className="w-full bg-transparent border-b border-gold/60 py-3 text-lg md:text-2xl font-typekit-italic placeholder:text-black/30 focus:outline-none focus:border-gold transition-all"
        style={{
          transform: focused ? 'scale(1.02)' : 'scale(1)',
          transformOrigin: 'left center',
          transition: 'transform 200ms ease-out, border-color 200ms ease-out',
        }}
      />

      {open && matches.length > 0 && (
        <ul
          className="absolute left-0 right-0 top-full mt-2 bg-white border border-gold/40 rounded-2xl shadow-sm overflow-hidden z-20"
          role="listbox"
        >
          {matches.map((city, idx) => (
            <li key={city}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault()
                  select(city)
                }}
                onMouseEnter={() => setActiveIdx(idx)}
                className={`w-full text-left px-5 py-3 text-sm transition-colors ${
                  idx === activeIdx ? 'bg-gold/[0.1]' : 'hover:bg-gold/[0.06]'
                }`}
              >
                {city}
              </button>
            </li>
          ))}
        </ul>
      )}

      {showError && error && (
        <p className="mt-3 text-xs uppercase tracking-[0.2em] text-black/60">{error}</p>
      )}
    </div>
  )
}
