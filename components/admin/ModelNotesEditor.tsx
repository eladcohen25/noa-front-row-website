'use client'

import { useEffect, useRef, useState } from 'react'
import { useToast } from './Toast'
import { createBrowserClient } from '@/lib/supabase/client'

interface ModelNotesEditorProps {
  submissionId: string
  initial: string | null
}

export default function ModelNotesEditor({ submissionId, initial }: ModelNotesEditorProps) {
  const [value, setValue] = useState(initial ?? '')
  const [saved, setSaved] = useState<'idle' | 'saving' | 'ok'>('idle')
  const toast = useToast()
  const timer = useRef<number | null>(null)
  const lastSavedRef = useRef<string>(initial ?? '')

  useEffect(() => {
    if (timer.current) window.clearTimeout(timer.current)
    if (value === lastSavedRef.current) return
    timer.current = window.setTimeout(async () => {
      setSaved('saving')
      const supabase = createBrowserClient()
      const { error } = await supabase
        .from('tfr_model_submissions')
        .update({ internal_notes: value || null })
        .eq('id', submissionId)
      if (error) {
        setSaved('idle')
        toast.error('Could not save notes')
        return
      }
      lastSavedRef.current = value
      setSaved('ok')
      window.setTimeout(() => setSaved('idle'), 1500)
    }, 800)
    return () => {
      if (timer.current) window.clearTimeout(timer.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] uppercase tracking-wider text-zinc-500">Internal notes</span>
        <span className="text-[10px] text-zinc-400">
          {saved === 'saving' ? 'Saving…' : saved === 'ok' ? 'Saved' : ''}
        </span>
      </div>
      <textarea
        rows={5}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Notes only the TFR team sees…"
        className="w-full text-sm border border-zinc-300 rounded-md px-3 py-2 focus:outline-none focus:border-black"
      />
    </div>
  )
}
