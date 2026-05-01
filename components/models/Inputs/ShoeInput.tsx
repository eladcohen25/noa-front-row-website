'use client'

import { useEffect, useState } from 'react'
import { shoeEuToUs, shoeUkToUs, shoeUsToEu, shoeUsToUk, type ShoeUnit } from '@/lib/models/units'

interface ShoeInputProps {
  valueUs: number | undefined
  onChange: (us: number | undefined) => void
  autoFocus?: boolean
}

export default function ShoeInput({ valueUs, onChange, autoFocus }: ShoeInputProps) {
  const [unit, setUnit] = useState<ShoeUnit>('us')
  const [text, setText] = useState('')

  useEffect(() => {
    if (valueUs === undefined) {
      setText('')
      return
    }
    if (unit === 'us') setText(String(valueUs))
    else if (unit === 'eu') setText(String(shoeUsToEu(valueUs)))
    else setText(String(shoeUsToUk(valueUs)))
  }, [valueUs, unit])

  const handleChange = (v: string) => {
    setText(v)
    const n = Number(v)
    if (!Number.isFinite(n)) {
      onChange(undefined)
      return
    }
    if (unit === 'us') onChange(Math.round(n * 10) / 10)
    else if (unit === 'eu') onChange(Math.round(shoeEuToUs(n) * 10) / 10)
    else onChange(Math.round(shoeUkToUs(n) * 10) / 10)
  }

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex items-end gap-3">
        <input
          autoFocus={autoFocus}
          type="number"
          inputMode="decimal"
          step="0.5"
          value={text}
          onChange={(e) => handleChange(e.target.value)}
          className="w-24 bg-transparent border-b border-gold/60 py-2 text-lg md:text-xl font-typekit-italic focus:outline-none focus:border-gold"
          placeholder={unit === 'us' ? '8.5' : unit === 'eu' ? '39' : '6.5'}
        />
        <div className="flex border border-gold/60 rounded-full overflow-hidden text-[11px] uppercase tracking-wider">
          {(['us', 'eu', 'uk'] as const).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUnit(u)}
              className={`px-3 py-1 ${unit === u ? 'bg-black text-white' : 'text-black/60'}`}
            >
              {u.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      {valueUs !== undefined && (
        <p className="text-[11px] uppercase tracking-[0.2em] text-black/40">
          Stored as {valueUs} US
        </p>
      )}
    </div>
  )
}
