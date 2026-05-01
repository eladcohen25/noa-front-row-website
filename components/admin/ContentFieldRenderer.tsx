'use client'

import ImageUploader from './ImageUploader'
import type { SiteContentRow } from '@/lib/admin/content'

interface ContentFieldRendererProps {
  field: SiteContentRow
  value: string | null
  onChange: (next: string | null) => void
}

export default function ContentFieldRenderer({ field, value, onChange }: ContentFieldRendererProps) {
  const inputBase =
    'w-full text-sm border border-zinc-300 rounded-md px-3 py-2 focus:outline-none focus:border-black bg-white'

  switch (field.type) {
    case 'text':
      return (
        <input
          type="text"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className={inputBase}
        />
      )

    case 'textarea':
      return (
        <textarea
          rows={4}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className={inputBase}
        />
      )

    case 'richtext':
      return (
        <div>
          <textarea
            rows={8}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Plain text. HTML allowed (<p>, <em>, <strong>, <a>)."
            className={inputBase + ' font-mono text-xs leading-relaxed'}
          />
          <p className="text-[10px] text-zinc-400 mt-1">
            Plain text with line breaks works. For italic / bold / links, you can use HTML —
            <code className="px-1">&lt;em&gt;</code>, <code className="px-1">&lt;strong&gt;</code>,
            <code className="px-1">&lt;a href=&quot;…&quot;&gt;</code>.
          </p>
        </div>
      )

    case 'url':
      return (
        <input
          type="url"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          onBlur={(e) => {
            const v = e.target.value.trim()
            if (v && !/^(https?:\/\/|\/|mailto:|tel:)/i.test(v)) {
              onChange(`https://${v}`)
            }
          }}
          className={inputBase}
          placeholder="https://…"
        />
      )

    case 'number':
      return (
        <input
          type="number"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className={inputBase}
        />
      )

    case 'image':
      return <ImageUploader fieldKey={field.key} value={value} onChange={onChange} />

    default:
      return <span className="text-zinc-500 text-xs">Unknown field type: {field.type}</span>
  }
}
