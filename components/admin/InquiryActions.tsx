'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import AdminButton from './AdminButton'
import StatusPill from './StatusPill'
import { useToast } from './Toast'
import {
  STATUS_LABELS,
  type InquiryRow,
  type InquiryStatus,
} from '@/lib/admin/inquiries'
import { createBrowserClient } from '@/lib/supabase/client'

interface InquiryActionsProps {
  inquiry: InquiryRow
}

const ESCALATING_ORDER: InquiryStatus[] = [
  'new',
  'in_progress',
  'contacted',
  'closed_won',
  'closed_lost',
  'archived',
]

export default function InquiryActions({ inquiry }: InquiryActionsProps) {
  const router = useRouter()
  const toast = useToast()
  const [status, setStatus] = useState<InquiryStatus>(inquiry.status)
  const [contactedAt, setContactedAt] = useState<string | null>(inquiry.contacted_at)
  const [actionPending, setActionPending] = useState<string | null>(null)

  const updateStatus = async (next: InquiryStatus) => {
    const supabase = createBrowserClient()
    const updates: Record<string, unknown> = { status: next }
    if (next === 'contacted' && !contactedAt) {
      updates.contacted_at = new Date().toISOString()
    }
    const { error } = await supabase.from('tfr_inquiries').update(updates).eq('id', inquiry.id)
    if (error) {
      toast.error('Could not update status')
      return
    }
    setStatus(next)
    if (typeof updates.contacted_at === 'string') setContactedAt(updates.contacted_at)
    toast.success(`Status set to ${STATUS_LABELS[next]}`)
    router.refresh()
  }

  const markAsContacted = async () => {
    setActionPending('contacted')
    const supabase = createBrowserClient()
    const updates: Record<string, unknown> = {
      contacted_at: new Date().toISOString(),
    }
    const currentIdx = ESCALATING_ORDER.indexOf(status)
    const contactedIdx = ESCALATING_ORDER.indexOf('contacted')
    if (currentIdx < contactedIdx) {
      updates.status = 'contacted'
    }
    const { error } = await supabase.from('tfr_inquiries').update(updates).eq('id', inquiry.id)
    setActionPending(null)
    if (error) {
      toast.error('Could not mark as contacted')
      return
    }
    setContactedAt(updates.contacted_at as string)
    if (updates.status) setStatus(updates.status as InquiryStatus)
    toast.success('Marked as contacted')
    router.refresh()
  }

  const archive = async () => {
    if (!confirm('Archive this inquiry? You can restore it from the Archived filter.')) return
    setActionPending('archive')
    await updateStatus('archived')
    setActionPending(null)
  }

  const replyHref = `mailto:${inquiry.email}?subject=${encodeURIComponent('Re: Your inquiry — The Front Row')}`

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-[11px] uppercase tracking-wider text-zinc-500 mb-1.5">
          Status
        </label>
        <StatusPill status={status} onChange={updateStatus} />
      </div>

      <div className="space-y-2">
        <AdminButton
          variant="secondary"
          size="sm"
          loading={actionPending === 'contacted'}
          onClick={markAsContacted}
          className="w-full justify-start"
        >
          {contactedAt ? 'Mark as contacted again' : 'Mark as contacted'}
        </AdminButton>
        <a
          href={replyHref}
          className="inline-flex w-full items-center justify-start gap-2 text-sm border border-zinc-300 bg-white text-black px-4 py-2 rounded-md hover:bg-zinc-50"
        >
          Reply via email
        </a>
        <AdminButton
          variant="danger"
          size="sm"
          loading={actionPending === 'archive'}
          onClick={archive}
          className="w-full justify-start"
        >
          Archive
        </AdminButton>
      </div>

      {contactedAt && (
        <p className="text-[10px] text-zinc-500">
          Last contacted: {new Date(contactedAt).toLocaleString()}
        </p>
      )}
    </div>
  )
}
