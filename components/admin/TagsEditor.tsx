'use client'

import { KeyboardEvent, useState } from 'react'
import { useToast } from './Toast'
import { createBrowserClient } from '@/lib/supabase/client'

interface TagsEditorProps {
  inquiryId: string
  initial: string[]
}

export default function TagsEditor({ inquiryId, initial }: TagsEditorProps) {
  const [tags, setTags] = useState<string[]>(initial)
  const [draft, setDraft] = useState('')
  const [pending, setPending] = useState(false)
  const toast = useToast()

  const persist = async (next: string[]) => {
    setPending(true)
    const supabase = createBrowserClient()
    const { error } = await supabase
      .from('tfr_inquiries')
      .update({ tags: next })
      .eq('id', inquiryId)
    setPending(false)
    if (error) {
      toast.error('Could not save tags')
      return false
    }
    return true
  }

  const add = async () => {
    const value = draft.trim()
    if (!value || tags.includes(value)) {
      setDraft('')
      return
    }
    const next = [...tags, value]
    setTags(next)
    setDraft('')
    const ok = await persist(next)
    if (!ok) setTags(tags)
  }

  const remove = async (tag: string) => {
    const next = tags.filter((t) => t !== tag)
    setTags(next)
    const ok = await persist(next)
    if (!ok) setTags(tags)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      add()
    } else if (e.key === 'Backspace' && !draft && tags.length > 0) {
      remove(tags[tags.length - 1])
    }
  }

  return (
    <div>
      <label className="block text-[11px] uppercase tracking-wider text-zinc-500 mb-1.5">
        Tags
      </label>
      <div className="flex flex-wrap items-center gap-1.5 border border-zinc-300 rounded-md px-2 py-1.5 bg-white focus-within:border-black">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 text-xs bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded-full"
          >
            {tag}
            <button
              type="button"
              onClick={() => remove(tag)}
              disabled={pending}
              className="text-zinc-400 hover:text-black"
              aria-label={`Remove ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={add}
          placeholder={tags.length === 0 ? 'Add a tag…' : ''}
          className="flex-1 min-w-[80px] text-xs px-1 py-0.5 bg-transparent focus:outline-none"
        />
      </div>
      <p className="text-[10px] text-zinc-400 mt-1">Press Enter or comma to add</p>
    </div>
  )
}
