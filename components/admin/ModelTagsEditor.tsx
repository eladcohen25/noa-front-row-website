'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from './Toast'
import { createBrowserClient } from '@/lib/supabase/client'

interface ModelTagsEditorProps {
  submissionId: string
  initial: string[]
}

export default function ModelTagsEditor({ submissionId, initial }: ModelTagsEditorProps) {
  const [tags, setTags] = useState<string[]>(initial)
  const [draft, setDraft] = useState('')
  const router = useRouter()
  const toast = useToast()

  const persist = async (next: string[]) => {
    const supabase = createBrowserClient()
    const { error } = await supabase
      .from('tfr_model_submissions')
      .update({ tags: next })
      .eq('id', submissionId)
    if (error) {
      toast.error('Could not save tags')
      return
    }
    router.refresh()
  }

  const add = async () => {
    const t = draft.trim()
    if (!t) return
    if (tags.includes(t)) {
      setDraft('')
      return
    }
    const next = [...tags, t]
    setTags(next)
    setDraft('')
    persist(next)
  }

  const remove = (t: string) => {
    const next = tags.filter((x) => x !== t)
    setTags(next)
    persist(next)
  }

  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-zinc-500 mb-2">Tags</p>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {tags.map((t) => (
          <span
            key={t}
            className="inline-flex items-center gap-1 text-xs bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded-full"
          >
            {t}
            <button
              type="button"
              aria-label={`Remove ${t}`}
              className="text-zinc-400 hover:text-black"
              onClick={() => remove(t)}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              add()
            }
          }}
          placeholder="Add a tag and press Enter"
          className="flex-1 text-sm border border-zinc-300 rounded-md px-3 py-1.5 focus:outline-none focus:border-black"
        />
        <button
          type="button"
          onClick={add}
          className="text-xs px-3 py-1.5 border border-zinc-300 rounded-md hover:bg-zinc-50"
        >
          Add
        </button>
      </div>
    </div>
  )
}
