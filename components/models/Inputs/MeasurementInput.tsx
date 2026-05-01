'use client'

import { useEffect, useState } from 'react'
import {
  cmToFtIn,
  cmToIn,
  ftInToCm,
  inToCm,
  type LengthUnit,
} from '@/lib/models/units'

interface MeasurementInputProps {
  /** Persisted value in cm. */
  valueCm: number | undefined
  onChange: (cm: number | undefined) => void
  /** 'height' shows ft + in / cm; 'simple' shows in / cm. */
  variant?: 'height' | 'simple'
  /** Sensible cm range used to validate UX inputs. */
  minCm?: number
  maxCm?: number
  autoFocus?: boolean
}

/**
 * Numeric input with an imperial / metric toggle. Always emits a cm value
 * upstream so the API can persist a single canonical unit.
 */
export default function MeasurementInput({
  valueCm,
  onChange,
  variant = 'simple',
  minCm,
  maxCm,
  autoFocus,
}: MeasurementInputProps) {
  const [unit, setUnit] = useState<LengthUnit>('imperial')

  // Keep the displayed strings in sync with the persisted cm value, but only
  // when the unit changes or an external value comes in.
  const [feet, setFeet] = useState<string>('')
  const [inches, setInches] = useState<string>('')
  const [cm, setCm] = useState<string>('')

  useEffect(() => {
    if (valueCm === undefined) {
      setFeet('')
      setInches('')
      setCm('')
      return
    }
    if (variant === 'height') {
      const { feet: f, inches: i } = cmToFtIn(valueCm)
      setFeet(String(f))
      setInches(String(i))
    } else {
      setInches(String(cmToIn(valueCm)))
    }
    setCm(String(valueCm))
  }, [valueCm, variant])

  const commit = (next: { feet?: string; inches?: string; cm?: string }) => {
    if (unit === 'imperial') {
      const f = next.feet ?? feet
      const i = next.inches ?? inches
      if (variant === 'height') {
        const fNum = Number(f)
        const iNum = Number(i)
        if (!Number.isFinite(fNum) || !Number.isFinite(iNum)) {
          onChange(undefined)
          return
        }
        const result = ftInToCm(fNum, iNum)
        if (minCm && result < minCm) return onChange(undefined)
        if (maxCm && result > maxCm) return onChange(undefined)
        onChange(result)
      } else {
        const iNum = Number(i)
        if (!Number.isFinite(iNum)) return onChange(undefined)
        const result = inToCm(iNum)
        if (minCm && result < minCm) return onChange(undefined)
        if (maxCm && result > maxCm) return onChange(undefined)
        onChange(result)
      }
    } else {
      const c = Number(next.cm ?? cm)
      if (!Number.isFinite(c)) return onChange(undefined)
      if (minCm && c < minCm) return onChange(undefined)
      if (maxCm && c > maxCm) return onChange(undefined)
      onChange(Math.round(c * 10) / 10)
    }
  }

  const baseField =
    'w-24 bg-transparent border-b border-gold/60 py-2 text-lg md:text-xl font-typekit-italic focus:outline-none focus:border-gold'

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex items-end gap-3">
        {unit === 'imperial' ? (
          variant === 'height' ? (
            <>
              <div className="flex items-baseline gap-1.5">
                <input
                  autoFocus={autoFocus}
                  type="number"
                  inputMode="numeric"
                  min={3}
                  max={8}
                  value={feet}
                  onChange={(e) => {
                    setFeet(e.target.value)
                    commit({ feet: e.target.value })
                  }}
                  className={baseField}
                  placeholder="5"
                />
                <span className="text-xs uppercase tracking-wider text-black/50">ft</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={11}
                  value={inches}
                  onChange={(e) => {
                    setInches(e.target.value)
                    commit({ inches: e.target.value })
                  }}
                  className={baseField}
                  placeholder="9"
                />
                <span className="text-xs uppercase tracking-wider text-black/50">in</span>
              </div>
            </>
          ) : (
            <div className="flex items-baseline gap-1.5">
              <input
                autoFocus={autoFocus}
                type="number"
                inputMode="decimal"
                step="0.5"
                value={inches}
                onChange={(e) => {
                  setInches(e.target.value)
                  commit({ inches: e.target.value })
                }}
                className={baseField}
                placeholder="34"
              />
              <span className="text-xs uppercase tracking-wider text-black/50">in</span>
            </div>
          )
        ) : (
          <div className="flex items-baseline gap-1.5">
            <input
              autoFocus={autoFocus}
              type="number"
              inputMode="decimal"
              step="0.1"
              value={cm}
              onChange={(e) => {
                setCm(e.target.value)
                commit({ cm: e.target.value })
              }}
              className={baseField}
              placeholder={variant === 'height' ? '175' : '85'}
            />
            <span className="text-xs uppercase tracking-wider text-black/50">cm</span>
          </div>
        )}

        <div className="flex border border-gold/60 rounded-full overflow-hidden text-[11px] uppercase tracking-wider">
          <button
            type="button"
            onClick={() => setUnit('imperial')}
            className={`px-3 py-1 ${unit === 'imperial' ? 'bg-black text-white' : 'text-black/60'}`}
          >
            {variant === 'height' ? 'ft / in' : 'in'}
          </button>
          <button
            type="button"
            onClick={() => setUnit('metric')}
            className={`px-3 py-1 ${unit === 'metric' ? 'bg-black text-white' : 'text-black/60'}`}
          >
            cm
          </button>
        </div>
      </div>
      {valueCm !== undefined && (
        <p className="text-[11px] uppercase tracking-[0.2em] text-black/40">
          Stored as {valueCm.toFixed(1)} cm
        </p>
      )}
    </div>
  )
}
