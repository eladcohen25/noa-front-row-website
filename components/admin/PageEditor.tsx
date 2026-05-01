'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import AdminButton from './AdminButton'
import ContentFieldRenderer from './ContentFieldRenderer'
import { useToast } from './Toast'
import type { SiteContentRow } from '@/lib/admin/content'
import { normalizeFieldValue, validateField } from '@/lib/admin/contentValidation'
import { createBrowserClient } from '@/lib/supabase/client'

interface PageEditorProps {
  page: string
  pageLabel: string
  livePath: string
  description?: string
  fields: SiteContentRow[]
  userId: string
  canEdit?: boolean
}

export default function PageEditor({
  page,
  pageLabel,
  livePath,
  description,
  fields,
  userId,
  canEdit = true,
}: PageEditorProps) {
  const router = useRouter()
  const toast = useToast()
  const initialValues = useMemo(
    () => Object.fromEntries(fields.map((f) => [f.key, f.value])) as Record<string, string | null>,
    [fields],
  )
  const [values, setValues] = useState<Record<string, string | null>>(initialValues)
  const [saving, setSaving] = useState(false)
  const [previewing, setPreviewing] = useState(false)

  const errors = useMemo(() => {
    const out: Record<string, string | null> = {}
    for (const field of fields) {
      out[field.key] = validateField(field, values[field.key])
    }
    return out
  }, [fields, values])

  const hasErrors = Object.values(errors).some((e) => !!e)

  const dirtyKeys = Object.keys(values).filter((k) => (values[k] ?? '') !== (initialValues[k] ?? ''))
  const isDirty = dirtyKeys.length > 0

  const handleChange = (key: string) => (next: string | null) => {
    setValues((v) => ({ ...v, [key]: next }))
  }

  const discard = () => {
    if (!isDirty) return
    if (!confirm('Discard your unsaved changes?')) return
    setValues(initialValues)
  }

  const save = async () => {
    if (!isDirty || saving) return
    if (hasErrors) {
      toast.error('Fix the highlighted fields before saving.')
      return
    }
    setSaving(true)
    const supabase = createBrowserClient()

    // Send the FULL row on upsert. Postgres evaluates the INSERT branch
    // of `INSERT … ON CONFLICT DO UPDATE` first and rejects rows that
    // violate NOT NULL on page / label / type, even when the row already
    // exists and the actual operation will be an UPDATE.
    const updates = dirtyKeys.map((key) => {
      const field = fields.find((f) => f.key === key)!
      return {
        key,
        page: field.page,
        label: field.label,
        type: field.type,
        description: field.description,
        sort_order: field.sort_order,
        required: field.required,
        value: normalizeFieldValue(field, values[key]),
        updated_by: userId,
      }
    })

    const { error } = await supabase.from('site_content').upsert(updates, { onConflict: 'key' })

    if (error) {
      toast.error('Save failed: ' + error.message)
      setSaving(false)
      return
    }

    try {
      await fetch('/api/admin/content/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page }),
      })
    } catch {
      // non-fatal: revalidation is best-effort
    }

    setSaving(false)
    toast.success('Saved. Live on the site in a few seconds.')
    router.refresh()
  }

  const preview = async () => {
    if (!isDirty || previewing) return
    if (hasErrors) {
      toast.error('Fix the highlighted fields before previewing.')
      return
    }
    setPreviewing(true)
    try {
      const previewValues: Record<string, string> = {}
      for (const key of dirtyKeys) {
        const field = fields.find((f) => f.key === key)!
        previewValues[key] = normalizeFieldValue(field, values[key]) ?? ''
      }
      const res = await fetch('/api/admin/content/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page, values: previewValues }),
      })
      if (!res.ok) throw new Error('Preview failed')
      // Open the live page in a new tab; the preview cookie set by the
      // route above is read server-side and merged on top of CMS values.
      window.open(livePath, '_blank', 'noopener,noreferrer')
    } catch {
      toast.error('Could not start preview.')
    } finally {
      setPreviewing(false)
    }
  }

  return (
    <div className="pb-24">
      <div className="mb-6">
        <button
          type="button"
          onClick={() => router.push('/admin/content')}
          className="text-xs text-zinc-500 hover:text-black inline-flex items-center gap-1 mb-2"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M6 2L3 5L6 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          All pages
        </button>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-semibold">{pageLabel}</h1>
            {description && (
              <p className="text-xs text-zinc-500 mt-1 max-w-xl">{description}</p>
            )}
            <p className="text-[11px] text-zinc-400 mt-1">
              {fields.length} editable {fields.length === 1 ? 'field' : 'fields'} · changes go
              live within ~1 minute of saving.
            </p>
          </div>
          <a
            href={livePath}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-zinc-500 hover:text-black border border-zinc-300 rounded-md px-3 py-1.5"
          >
            View live page ↗
          </a>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-md divide-y divide-zinc-100">
        {fields.map((field) => {
          const error = errors[field.key]
          return (
            <div key={field.key} className="px-5 py-5">
              <div className="flex items-baseline justify-between mb-1">
                <label className="text-sm font-medium">
                  {field.label}
                  {field.required && <span className="text-rose-600 ml-1">*</span>}
                </label>
                <span className="text-[10px] uppercase tracking-wider text-zinc-400">
                  {field.type}
                </span>
              </div>
              {field.description && (
                <p className="text-xs text-zinc-500 mb-2">{field.description}</p>
              )}
              <ContentFieldRenderer
                field={field}
                value={values[field.key]}
                onChange={handleChange(field.key)}
              />
              {error && (
                <p className="text-xs text-rose-700 mt-1.5">{error}</p>
              )}
            </div>
          )
        })}
      </div>

      {canEdit ? (
        <div className="fixed bottom-4 right-4 left-4 md:left-auto z-30">
          <div className="ml-auto md:max-w-lg flex items-center justify-end gap-2 bg-white border border-zinc-200 rounded-md shadow-lg px-4 py-2.5">
            <span className="text-xs text-zinc-500 mr-auto md:mr-0">
              {hasErrors
                ? 'Fix the highlighted fields'
                : isDirty
                  ? `${dirtyKeys.length} unsaved change${dirtyKeys.length === 1 ? '' : 's'}`
                  : 'Up to date'}
            </span>
            <AdminButton variant="ghost" size="sm" onClick={discard} disabled={!isDirty}>
              Discard
            </AdminButton>
            <AdminButton
              variant="secondary"
              size="sm"
              onClick={preview}
              loading={previewing}
              disabled={!isDirty || hasErrors}
            >
              Preview
            </AdminButton>
            <AdminButton size="sm" onClick={save} loading={saving} disabled={!isDirty || hasErrors}>
              Save changes
            </AdminButton>
          </div>
        </div>
      ) : (
        <div className="fixed bottom-4 right-4 z-30 bg-white border border-zinc-200 rounded-md shadow-lg px-4 py-2.5 text-xs text-zinc-500">
          Read-only — you don&apos;t have edit content permission.
        </div>
      )}
    </div>
  )
}
