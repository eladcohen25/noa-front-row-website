'use client'

import { ReactNode, useEffect, useRef, useState } from 'react'
import { useEditMode, type EditableType } from './EditModeProvider'
import { useToast } from './Toast'
import { createBrowserClient } from '@/lib/supabase/client'

interface EditableProps {
  contentKey: string
  type: EditableType
  /** Plain string value as currently rendered. Used to seed the inline editor. */
  value?: string
  /** Children rendered when not in edit mode. */
  children: ReactNode
}

/**
 * Wraps any CMS-driven element on a public page. In production / for non-admin
 * viewers this is a no-op (just renders children). When inside an
 * <EditModeProvider isEditMode={true}>, hovering shows an outline and clicking
 * opens an inline editor matched to the field type. Edits stage into context;
 * "Save all" in EditModeToolbar persists everything in one batch.
 */
export default function Editable({ contentKey, type, value = '', children }: EditableProps) {
  const ctx = useEditMode()
  const toast = useToast()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  // No-op when not in edit mode
  if (!ctx?.isEditMode) return <>{children}</>

  const stagedValue = ctx.staged[contentKey]
  const dirty = stagedValue !== undefined
  const displayed = dirty ? stagedValue : value
  const open = editing
  return (
    <>
      <span
        className={`cms-editable inline-block align-baseline relative ${
          dirty ? 'cms-editable-dirty' : ''
        }`}
        onClick={(e) => {
          e.stopPropagation()
          setDraft(displayed ?? value)
          setEditing(true)
        }}
      >
        {dirty ? renderInlineDirty(type, stagedValue, children) : children}
      </span>

      {open && (
        <EditableEditor
          contentKey={contentKey}
          type={type}
          initial={draft}
          onCancel={() => setEditing(false)}
          onAccept={(next) => {
            ctx.stage(contentKey, next)
            setEditing(false)
          }}
          onUploadError={(msg) => toast.error(msg)}
        />
      )}
      <style jsx>{`
        .cms-editable {
          outline: 1px dashed transparent;
          outline-offset: 2px;
          border-radius: 2px;
          cursor: text;
          transition: outline-color 120ms ease-out, background-color 120ms ease-out;
        }
        .cms-editable:hover {
          outline-color: rgb(180, 145, 60);
          background-color: rgba(212, 175, 55, 0.08);
        }
        .cms-editable-dirty {
          outline-color: rgb(180, 145, 60);
          background-color: rgba(212, 175, 55, 0.12);
        }
      `}</style>
    </>
  )
}

function renderInlineDirty(type: EditableType, value: string, fallback: ReactNode): ReactNode {
  if (type === 'image' && value) {
    // Replace child content with the staged image. The child's tag is unknown,
    // so we render an inline span; it's swapped on save.
    return <span>(image staged)</span>
  }
  if (value === '') return fallback
  return <>{value}</>
}

interface EditorProps {
  contentKey: string
  type: EditableType
  initial: string
  onCancel: () => void
  onAccept: (value: string) => void
  onUploadError: (message: string) => void
}

function EditableEditor({ contentKey, type, initial, onCancel, onAccept, onUploadError }: EditorProps) {
  const [value, setValue] = useState(initial)
  const [uploading, setUploading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onCancel()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onCancel])

  const acceptUrl = () => {
    const t = value.trim()
    if (t && !/^(https?:\/\/|\/|mailto:|tel:)/i.test(t)) {
      onAccept('https://' + t)
    } else {
      onAccept(t)
    }
  }

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      onUploadError('Pick an image file')
      return
    }
    if (file.size > 8 * 1024 * 1024) {
      onUploadError('Image must be under 8 MB')
      return
    }
    setUploading(true)
    const supabase = createBrowserClient()
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const path = `${contentKey}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('site-content-images').upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    })
    setUploading(false)
    if (error) {
      onUploadError('Upload failed')
      return
    }
    const { data: pub } = supabase.storage.from('site-content-images').getPublicUrl(path)
    onAccept(pub.publicUrl)
  }

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label={`Edit ${contentKey}`}
      className="fixed z-[60] left-1/2 top-24 -translate-x-1/2 bg-white shadow-2xl border border-zinc-200 rounded-lg p-4 w-[min(560px,90vw)] text-zinc-900 font-sans"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] uppercase tracking-wider text-zinc-500">{contentKey}</span>
        <button
          type="button"
          onClick={onCancel}
          className="text-zinc-400 hover:text-black"
          aria-label="Cancel"
        >
          ×
        </button>
      </div>

      {type === 'text' && (
        <input
          autoFocus
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onAccept(value)
            if (e.key === 'Escape') onCancel()
          }}
          className="w-full text-sm border border-zinc-300 rounded-md px-3 py-2 focus:outline-none focus:border-black"
        />
      )}

      {(type === 'textarea' || type === 'richtext') && (
        <textarea
          autoFocus
          rows={6}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') onAccept(value)
            if (e.key === 'Escape') onCancel()
          }}
          className="w-full text-sm border border-zinc-300 rounded-md px-3 py-2 focus:outline-none focus:border-black"
        />
      )}

      {type === 'url' && (
        <input
          autoFocus
          type="url"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') acceptUrl()
            if (e.key === 'Escape') onCancel()
          }}
          placeholder="https://…"
          className="w-full text-sm border border-zinc-300 rounded-md px-3 py-2 focus:outline-none focus:border-black"
        />
      )}

      {type === 'image' && (
        <div>
          {value && (
            <img
              src={value}
              alt=""
              className="max-h-40 w-auto object-contain bg-zinc-50 border border-zinc-200 rounded-md mb-2"
            />
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleFile(f)
              e.target.value = ''
            }}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="text-sm border border-zinc-300 px-3 py-1.5 rounded-md hover:bg-zinc-50"
            >
              {uploading ? 'Uploading…' : value ? 'Replace' : 'Upload'}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onAccept('')}
                className="text-sm text-zinc-600 hover:text-black px-3 py-1.5"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      )}

      {type !== 'image' && (
        <div className="mt-3 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-zinc-500 hover:text-black px-3 py-1.5"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => (type === 'url' ? acceptUrl() : onAccept(value))}
            className="text-xs bg-black text-white hover:bg-zinc-800 px-3 py-1.5 rounded-md"
          >
            Stage change
          </button>
        </div>
      )}
    </div>
  )
}
