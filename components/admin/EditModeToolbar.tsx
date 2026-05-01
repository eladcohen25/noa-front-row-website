'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEditMode } from './EditModeProvider'
import { useToast } from './Toast'

export default function EditModeToolbar() {
  const ctx = useEditMode()
  const router = useRouter()
  const toast = useToast()
  if (!ctx?.isEditMode) return null

  const count = Object.keys(ctx.staged).length

  const handleSave = async () => {
    const res = await ctx.saveAll()
    if (res.ok) {
      toast.success('Saved. Live in a few seconds.')
      router.refresh()
    } else {
      toast.error(res.error || 'Save failed')
    }
  }

  const handleDiscard = () => {
    if (count === 0) return
    if (!confirm('Discard all unsaved changes?')) return
    ctx.discardAll()
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-[55] bg-black text-white text-xs">
        <div className="max-w-[1400px] mx-auto px-4 py-2 flex items-center justify-between gap-4">
          <span>
            <span className="text-amber-300 font-semibold">Editing:</span>{' '}
            <span className="text-white">{ctx.pageLabel}</span>
          </span>
          <div className="flex items-center gap-3">
            <a
              href={ctx.livePath}
              target="_blank"
              rel="noreferrer"
              className="text-zinc-300 hover:text-white"
            >
              View live ↗
            </a>
            <Link href="/admin/edit" className="text-zinc-300 hover:text-white">
              Exit edit mode
            </Link>
          </div>
        </div>
      </div>

      <div className="fixed bottom-4 right-4 z-[55] bg-white border border-zinc-200 rounded-lg shadow-2xl px-4 py-3 flex items-center gap-3 font-sans">
        <span className="text-xs text-zinc-600">
          {ctx.saving
            ? 'Saving…'
            : count === 0
              ? 'No changes yet — click any text or image'
              : `${count} unsaved change${count === 1 ? '' : 's'}`}
        </span>
        <button
          type="button"
          onClick={handleDiscard}
          disabled={count === 0 || ctx.saving}
          className="text-xs text-zinc-600 hover:text-black px-2 py-1 disabled:opacity-40"
        >
          Discard all
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={count === 0 || ctx.saving}
          className="text-xs bg-black text-white hover:bg-zinc-800 px-3 py-1.5 rounded-md disabled:opacity-40"
        >
          Save all
        </button>
      </div>

      <style jsx global>{`
        body {
          padding-top: 36px;
        }
      `}</style>
    </>
  )
}
