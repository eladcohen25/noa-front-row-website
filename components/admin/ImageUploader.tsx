'use client'

import Image from 'next/image'
import { useRef, useState } from 'react'
import AdminButton from './AdminButton'
import { useToast } from './Toast'
import { createBrowserClient } from '@/lib/supabase/client'

interface ImageUploaderProps {
  value: string | null
  onChange: (next: string | null) => void
  fieldKey: string
}

const BUCKET = 'site-content-images'
const MAX_BYTES = 8 * 1024 * 1024 // 8MB

export default function ImageUploader({ value, onChange, fieldKey }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const toast = useToast()

  const handleSelect = async (file: File) => {
    if (file.size > MAX_BYTES) {
      toast.error('Image must be under 8 MB')
      return
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Pick an image file (jpg, png, webp)')
      return
    }
    setUploading(true)
    const supabase = createBrowserClient()
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const path = `${fieldKey}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    })
    if (error) {
      toast.error('Upload failed')
      setUploading(false)
      return
    }
    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path)
    onChange(pub.publicUrl)
    setUploading(false)
    toast.success('Image uploaded')
  }

  const onPick = () => inputRef.current?.click()

  const onClear = () => {
    if (!confirm('Remove this image?')) return
    onChange(null)
  }

  return (
    <div className="space-y-3">
      {value ? (
        <div className="relative inline-block">
          <Image
            src={value}
            alt="Preview"
            width={400}
            height={240}
            unoptimized
            className="rounded-md border border-zinc-200 max-h-60 w-auto object-contain bg-zinc-50"
          />
        </div>
      ) : (
        <div className="border border-dashed border-zinc-300 rounded-md py-10 text-center text-xs text-zinc-500 bg-zinc-50">
          No image yet
        </div>
      )}
      <div className="flex items-center gap-2">
        <AdminButton variant="secondary" size="sm" onClick={onPick} loading={uploading} type="button">
          {value ? 'Replace' : 'Upload'}
        </AdminButton>
        {value && (
          <AdminButton variant="ghost" size="sm" onClick={onClear} type="button">
            Remove
          </AdminButton>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleSelect(file)
            e.target.value = ''
          }}
        />
      </div>
    </div>
  )
}
