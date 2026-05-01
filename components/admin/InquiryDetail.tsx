'use client'

import Link from 'next/link'
import { ReactNode } from 'react'
import InquiryActions from './InquiryActions'
import NotesEditor from './NotesEditor'
import TagsEditor from './TagsEditor'
import {
  INQUIRER_TYPE_COLORS,
  INQUIRER_TYPE_LABELS,
  formatRelativeTime,
  labelFor,
  type InquiryRow,
} from '@/lib/admin/inquiries'

interface InquiryDetailProps {
  inquiry: InquiryRow
  fileLinks: { url: string; name: string }[]
  canEdit?: boolean
}

const HIDE_FROM_DETAILS = new Set(['additionalNotes'])

function formatValue(value: unknown): ReactNode {
  if (value === null || value === undefined || value === '') return <span className="text-zinc-400">—</span>
  if (Array.isArray(value)) return value.length === 0 ? <span className="text-zinc-400">—</span> : value.join(', ')
  if (typeof value === 'object') return <pre className="text-xs">{JSON.stringify(value, null, 2)}</pre>
  return String(value)
}

export default function InquiryDetail({
  inquiry,
  fileLinks,
  canEdit = true,
}: InquiryDetailProps) {
  const detailEntries = Object.entries(inquiry.details ?? {}).filter(
    ([k, v]) => !HIDE_FROM_DETAILS.has(k) && v !== null && v !== undefined && v !== '',
  )

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <Link href="/admin" className="text-xs text-zinc-500 hover:text-black inline-flex items-center gap-1">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M6 2L3 5L6 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Inquiries
        </Link>
      </div>

      <header className="mb-6 flex items-center gap-3 flex-wrap">
        <h1 className="text-2xl font-semibold">{inquiry.name}</h1>
        <span
          className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium border rounded-full ${INQUIRER_TYPE_COLORS[inquiry.inquirer_type]}`}
        >
          {INQUIRER_TYPE_LABELS[inquiry.inquirer_type]}
        </span>
        {inquiry.flagged_spam && (
          <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-medium border rounded-full bg-rose-50 text-rose-800 border-rose-200">
            Flagged spam
          </span>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <Card title="Contact">
            <DataRow label="Name" value={inquiry.name} />
            <DataRow
              label="Email"
              value={
                <a href={`mailto:${inquiry.email}`} className="text-black hover:underline">
                  {inquiry.email}
                </a>
              }
            />
            <DataRow
              label="Phone"
              value={
                inquiry.phone ? (
                  <a href={`tel:${inquiry.phone}`} className="text-black hover:underline">
                    {inquiry.phone}
                  </a>
                ) : (
                  <span className="text-zinc-400">—</span>
                )
              }
            />
            <DataRow label="City" value={inquiry.city || <span className="text-zinc-400">—</span>} />
            <DataRow label="How heard" value={inquiry.how_heard || <span className="text-zinc-400">—</span>} />
          </Card>

          <Card title="Submission">
            {detailEntries.length === 0 ? (
              <p className="text-sm text-zinc-500">No additional details.</p>
            ) : (
              detailEntries.map(([k, v]) => (
                <DataRow key={k} label={labelFor(k)} value={formatValue(v)} />
              ))
            )}
          </Card>

          {fileLinks.length > 0 && (
            <Card title="Attachments">
              <ul className="space-y-2">
                {fileLinks.map((f, idx) => (
                  <li key={idx} className="flex items-center justify-between text-sm border border-zinc-200 rounded-md px-3 py-2">
                    <span className="truncate pr-4">{f.name}</span>
                    <a
                      href={f.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-zinc-600 hover:text-black"
                    >
                      Download
                    </a>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {inquiry.additional_notes && (
            <Card title="Note from inquirer">
              <p className="text-sm whitespace-pre-wrap">{inquiry.additional_notes}</p>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          {canEdit ? (
            <>
              <Card title="Manage">
                <InquiryActions inquiry={inquiry} />
              </Card>

              <Card title="Notes & tags">
                <div className="space-y-4">
                  <TagsEditor inquiryId={inquiry.id} initial={inquiry.tags ?? []} />
                  <NotesEditor inquiryId={inquiry.id} initial={inquiry.internal_notes} />
                </div>
              </Card>
            </>
          ) : (
            <Card title="Manage">
              <p className="text-xs text-zinc-500">
                You have read-only access. Ask the owner for &ldquo;Manage inquiries&rdquo; permission to
                update status, notes, or tags.
              </p>
              {(inquiry.tags?.length ?? 0) > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(inquiry.tags ?? []).map((t) => (
                    <span
                      key={t}
                      className="text-xs bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded-full"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
              {inquiry.internal_notes && (
                <div className="mt-3 text-sm whitespace-pre-wrap text-zinc-700">
                  {inquiry.internal_notes}
                </div>
              )}
            </Card>
          )}

          <Card title="Timestamps" small>
            <DataRow label="Submitted" value={`${new Date(inquiry.created_at).toLocaleString()} (${formatRelativeTime(inquiry.created_at)})`} />
            {inquiry.contacted_at && (
              <DataRow
                label="Contacted"
                value={`${new Date(inquiry.contacted_at).toLocaleString()} (${formatRelativeTime(inquiry.contacted_at)})`}
              />
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

function Card({
  title,
  children,
  small,
}: {
  title: string
  children: ReactNode
  small?: boolean
}) {
  return (
    <section className="bg-white border border-zinc-200 rounded-md">
      <div className="px-5 py-3 border-b border-zinc-200">
        <h2 className={small ? 'text-xs uppercase tracking-wider text-zinc-500' : 'text-sm font-semibold'}>
          {title}
        </h2>
      </div>
      <div className="px-5 py-4">{children}</div>
    </section>
  )
}

function DataRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start gap-4 py-1.5 text-sm">
      <span className="w-32 flex-shrink-0 text-[11px] uppercase tracking-wider text-zinc-500 pt-0.5">
        {label}
      </span>
      <span className="flex-1 break-words">{value}</span>
    </div>
  )
}
