'use client'

import { useEffect, useRef, useState } from 'react'

const ACCEPT = 'image/jpeg,image/png,image/heic,image/heif,image/webp'
const MAX_BYTES = 10 * 1024 * 1024 // 10 MB
const MAX_ADDITIONAL = 4

export type PhotoSlotKey = 'headshot' | 'fullbody' | 'profileLeft' | 'profileRight'

const SLOTS: { key: PhotoSlotKey; label: string; helper: string }[] = [
  { key: 'headshot', label: 'Headshot', helper: 'Clear face, no makeup or minimal' },
  { key: 'fullbody', label: 'Full body', helper: 'Front, neutral pose' },
  { key: 'profileLeft', label: 'Profile left', helper: 'Side view, left' },
  { key: 'profileRight', label: 'Profile right', helper: 'Side view, right' },
]

interface MultiPhotoUploadProps {
  required: {
    headshot?: File
    fullbody?: File
    profileLeft?: File
    profileRight?: File
  }
  additional: File[]
  onChangeRequired: (slot: PhotoSlotKey, file: File | undefined) => void
  onChangeAdditional: (files: File[]) => void
}

export default function MultiPhotoUpload({
  required,
  additional,
  onChangeRequired,
  onChangeAdditional,
}: MultiPhotoUploadProps) {
  const [error, setError] = useState<string | null>(null)

  const validate = (file: File): string | null => {
    if (file.size > MAX_BYTES) return 'Each photo must be under 10 MB.'
    if (!ACCEPT.split(',').includes(file.type)) return 'Use JPG, PNG, HEIC, or WebP.'
    return null
  }

  const handleSlotPick = (slot: PhotoSlotKey, file: File | undefined) => {
    setError(null)
    if (!file) {
      onChangeRequired(slot, undefined)
      return
    }
    const err = validate(file)
    if (err) {
      setError(err)
      return
    }
    onChangeRequired(slot, file)
  }

  const handleAdditionalPick = (files: FileList | null) => {
    setError(null)
    if (!files || files.length === 0) return
    const next = [...additional]
    for (const file of Array.from(files)) {
      if (next.length >= MAX_ADDITIONAL) break
      const err = validate(file)
      if (err) {
        setError(err)
        continue
      }
      next.push(file)
    }
    onChangeAdditional(next)
  }

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4">
        {SLOTS.map((slot) => (
          <PhotoSlot
            key={slot.key}
            label={slot.label}
            helper={slot.helper}
            file={required[slot.key]}
            onPick={(f) => handleSlotPick(slot.key, f)}
            onClear={() => handleSlotPick(slot.key, undefined)}
          />
        ))}
      </div>

      <div className="border-t border-gold/40 pt-5">
        <p className="text-[11px] uppercase tracking-[0.25em] text-black/50 mb-3">
          Optional — recent work or favorites (up to {MAX_ADDITIONAL})
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {additional.map((file, i) => (
            <PhotoThumb
              key={i}
              file={file}
              onClear={() => onChangeAdditional(additional.filter((_, idx) => idx !== i))}
            />
          ))}
          {additional.length < MAX_ADDITIONAL && (
            <AddTile onPick={handleAdditionalPick} />
          )}
        </div>
      </div>

      {error && (
        <p className="text-xs uppercase tracking-[0.2em] text-rose-700">{error}</p>
      )}
    </div>
  )
}

function PhotoSlot({
  label,
  helper,
  file,
  onPick,
  onClear,
}: {
  label: string
  helper: string
  file: File | undefined
  onPick: (file: File) => void
  onClear: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`group relative aspect-[3/4] w-full overflow-hidden rounded-md border-2 border-dashed transition-all ${
          file ? 'border-transparent' : 'border-gold/60 hover:border-gold bg-gold/[0.05]'
        }`}
      >
        {previewUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt={label} className="w-full h-full object-cover" />
            <span className="absolute top-2 left-2 bg-black/70 text-white text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full">
              {label}
            </span>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-3 gap-1">
            <span className="text-sm font-typekit">{label}</span>
            <span className="text-[10px] uppercase tracking-wider text-black/50">{helper}</span>
            <span className="text-[10px] uppercase tracking-wider text-gold-deep mt-2 underline underline-offset-2">
              Upload
            </span>
          </div>
        )}
      </button>
      {file && (
        <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-black/50">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="underline underline-offset-2 hover:text-black"
          >
            Replace
          </button>
          <button
            type="button"
            onClick={onClear}
            className="hover:text-black"
          >
            Remove
          </button>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onPick(f)
          e.target.value = ''
        }}
      />
    </div>
  )
}

function PhotoThumb({ file, onClear }: { file: File; onClear: () => void }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  useEffect(() => {
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])
  return (
    <div className="relative aspect-square overflow-hidden rounded-md group">
      {previewUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={previewUrl} alt="" className="w-full h-full object-cover" />
      )}
      <button
        type="button"
        onClick={onClear}
        aria-label="Remove"
        className="absolute top-1 right-1 w-6 h-6 bg-black/70 text-white rounded-full text-xs leading-none opacity-0 group-hover:opacity-100 transition-opacity"
      >
        ×
      </button>
    </div>
  )
}

function AddTile({ onPick }: { onPick: (files: FileList | null) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className="aspect-square rounded-md border-2 border-dashed border-gold/60 hover:border-gold bg-gold/[0.04] flex flex-col items-center justify-center text-[10px] uppercase tracking-wider text-black/60 hover:text-black"
    >
      + Add
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        className="hidden"
        onChange={(e) => onPick(e.target.files)}
      />
    </button>
  )
}
