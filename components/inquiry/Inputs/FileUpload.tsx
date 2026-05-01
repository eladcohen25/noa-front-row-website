'use client'

import { useRef, useState } from 'react'

interface FileUploadProps {
  files: File[]
  onChange: (files: File[]) => void
  maxFiles?: number
  maxSizeMB?: number
  accept?: string
}

const DEFAULT_ACCEPT = '.pdf,.jpg,.jpeg,.png,.heic,application/pdf,image/jpeg,image/png,image/heic'

export default function FileUpload({
  files,
  onChange,
  maxFiles = 3,
  maxSizeMB = 10,
  accept = DEFAULT_ACCEPT,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const addFiles = (incoming: FileList | File[]) => {
    setError(null)
    const list = Array.from(incoming)
    const tooBig = list.find((f) => f.size > maxSizeMB * 1024 * 1024)
    if (tooBig) {
      setError(`File too large (max ${maxSizeMB}MB)`)
      return
    }
    const combined = [...files, ...list].slice(0, maxFiles)
    onChange(combined)
  }

  const removeFile = (idx: number) => {
    onChange(files.filter((_, i) => i !== idx))
  }

  return (
    <div className="w-full">
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragActive(true)
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragActive(false)
          if (e.dataTransfer.files) addFiles(e.dataTransfer.files)
        }}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer w-full border border-dashed rounded-2xl px-6 py-8 text-center transition-colors ${
          dragActive ? 'border-gold bg-gold/[0.06]' : 'border-gold/60 hover:border-gold'
        }`}
      >
        <p className="text-sm md:text-base font-typekit-italic">
          {files.length > 0 ? 'Add another file' : 'Drag & drop, or click to upload'}
        </p>
        <p className="text-[10px] uppercase tracking-[0.2em] text-black/50 mt-2">
          PDF · JPG · PNG · HEIC · Max {maxSizeMB}MB · Up to {maxFiles} files
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files)
            e.target.value = ''
          }}
        />
      </div>

      {files.length > 0 && (
        <ul className="mt-4 space-y-2">
          {files.map((file, idx) => (
            <li
              key={`${file.name}-${idx}`}
              className="flex items-center justify-between border-b border-black/10 pb-2 text-sm"
            >
              <span className="truncate pr-4">{file.name}</span>
              <button
                type="button"
                onClick={() => removeFile(idx)}
                className="text-[10px] uppercase tracking-[0.2em] text-black/50 hover:text-black"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p className="mt-3 text-xs uppercase tracking-[0.2em] text-black/60">{error}</p>
      )}
    </div>
  )
}
