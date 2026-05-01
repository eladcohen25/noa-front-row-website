'use client'

import { useEffect, useRef, useState } from 'react'
import { useToast } from './Toast'
import { createBrowserClient } from '@/lib/supabase/client'

interface NotesEditorProps {
  inquiryId: string
  initial: string | null
}

export default function NotesEditor({ inquiryId, initial }: NotesEditorProps) {
  const [value, setValue] = useState(initial ?? '')
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const lastSavedRef = useRef(initial ?? '')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const toast = useToast()

  const save = async (next: string) => {
    if (next === lastSavedRef.current) return
    setSaving(true)
    const supabase = createBrowserClient()
    const { error } = await supabase
      .from('tfr_inquiries')
      .update({ internal_notes: next })
      .eq('id', inquiryId)
    setSaving(false)
    if (error) {
      toast.error('Could not save notes')
      return
    }
    lastSavedRef.current = next
    setSavedAt(new Date())
  }

  // Debounced autosave on change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      save(value)
    }, 800)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const status = saving
    ? 'Saving…'
    : savedAt
      ? `Saved ${savedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      : ''

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-[11px] uppercase tracking-wider text-zinc-500">
          Internal notes
        </label>
        <span className="text-[10px] text-zinc-400">{status}</span>
      </div>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => save(value)}
        rows={6}
        placeholder="Notes only TFR can see…"
        className="w-full text-sm border border-zinc-300 rounded-md px-3 py-2 focus:outline-none focus:border-black"
      />
    </div>
  )
}
