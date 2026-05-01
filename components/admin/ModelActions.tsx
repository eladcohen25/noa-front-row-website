'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import AdminButton from './AdminButton'
import ModelStatusPill from './ModelStatusPill'
import { useToast } from './Toast'
import { type ModelRow, type ModelStatus } from '@/lib/admin/models'
import { createBrowserClient } from '@/lib/supabase/client'

interface ModelActionsProps {
  submission: ModelRow
}

export default function ModelActions({ submission }: ModelActionsProps) {
  const router = useRouter()
  const toast = useToast()
  const [busy, setBusy] = useState(false)

  const update = async (patch: Record<string, unknown>) => {
    setBusy(true)
    const supabase = createBrowserClient()
    const { error } = await supabase
      .from('tfr_model_submissions')
      .update(patch)
      .eq('id', submission.id)
    setBusy(false)
    if (error) {
      toast.error('Update failed: ' + error.message)
      return
    }
    toast.success('Updated')
    router.refresh()
  }

  const setStatus = (next: ModelStatus) => update({ status: next })

  const markContacted = () => {
    const patch: Record<string, unknown> = { contacted_at: new Date().toISOString() }
    if (
      submission.status === 'new' ||
      submission.status === 'shortlisted'
    ) {
      patch.status = 'contacted'
    }
    return update(patch)
  }

  const archive = () => {
    if (!confirm('Archive this submission? You can find it again under "Archived" status.')) return
    return update({ status: 'archived' })
  }

  const subject = encodeURIComponent('Re: Your submission — The Front Row')
  const mailto = `mailto:${submission.email}?subject=${subject}`

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-500">Status</span>
        <ModelStatusPill status={submission.status} onChange={setStatus} />
      </div>
      <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-100">
        <AdminButton size="sm" onClick={markContacted} loading={busy}>
          Mark as contacted
        </AdminButton>
        <a
          href={mailto}
          className="text-xs px-3 py-1.5 rounded-md border border-zinc-300 hover:bg-zinc-50"
        >
          Reply via email
        </a>
        <AdminButton size="sm" variant="danger" onClick={archive} loading={busy}>
          Archive
        </AdminButton>
      </div>
    </div>
  )
}
