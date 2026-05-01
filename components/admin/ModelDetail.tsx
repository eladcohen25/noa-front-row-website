'use client'

import { useState } from 'react'
import ModelActions from './ModelActions'
import ModelNotesEditor from './ModelNotesEditor'
import ModelTagsEditor from './ModelTagsEditor'
import type { ModelRow } from '@/lib/admin/models'
import { cmToFtIn, cmToIn, shoeUsToEu, shoeUsToUk } from '@/lib/models/units'

interface ModelDetailProps {
  submission: ModelRow
  signedUrls: Record<string, string>
  canEdit?: boolean
}

const PHOTO_SLOTS: { label: string; key: keyof ModelRow }[] = [
  { label: 'Headshot', key: 'headshot_url' },
  { label: 'Full body', key: 'fullbody_url' },
  { label: 'Profile L', key: 'profile_left_url' },
  { label: 'Profile R', key: 'profile_right_url' },
]

export default function ModelDetail({
  submission: row,
  signedUrls,
  canEdit = true,
}: ModelDetailProps) {
  const [lengthUnit, setLengthUnit] = useState<'imperial' | 'metric'>('imperial')
  const [shoeUnit, setShoeUnit] = useState<'us' | 'eu' | 'uk'>('us')
  const [lightbox, setLightbox] = useState<string | null>(null)

  const fmtLen = (cm: number) =>
    lengthUnit === 'metric'
      ? `${cm} cm`
      : (() => {
          const { feet, inches } = cmToFtIn(cm)
          return `${feet}\u2032${inches}\u2033 (${cm} cm)`
        })()

  const fmtBodyLen = (cm: number) =>
    lengthUnit === 'metric' ? `${cm} cm` : `${cmToIn(cm)} in (${cm} cm)`

  const fmtShoe = (us: number) =>
    shoeUnit === 'us'
      ? `${us} US`
      : shoeUnit === 'eu'
        ? `${shoeUsToEu(us)} EU`
        : `${shoeUsToUk(us)} UK`

  const additional = row.additional_photo_urls ?? []
  const igUrl = `https://www.instagram.com/${row.instagram_handle}`

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          {/* Required photos */}
          <div className="bg-white border border-zinc-200 rounded-md p-4">
            <p className="text-[11px] uppercase tracking-wider text-zinc-500 mb-3">Photos</p>
            <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
              {PHOTO_SLOTS.map((slot) => {
                const path = row[slot.key] as string
                const url = signedUrls[path]
                return (
                  <button
                    type="button"
                    key={slot.key as string}
                    onClick={() => url && setLightbox(url)}
                    className="relative aspect-[3/4] bg-zinc-100 overflow-hidden rounded-md group"
                  >
                    {url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={url} alt={slot.label} className="w-full h-full object-cover" />
                    )}
                    <span className="absolute top-2 left-2 bg-black/70 text-white text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full">
                      {slot.label}
                    </span>
                  </button>
                )
              })}
            </div>
            {additional.length > 0 && (
              <>
                <p className="text-[11px] uppercase tracking-wider text-zinc-500 mt-5 mb-2">
                  Additional ({additional.length})
                </p>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {additional.map((path, i) => {
                    const url = signedUrls[path]
                    return (
                      <button
                        type="button"
                        key={i}
                        onClick={() => url && setLightbox(url)}
                        className="aspect-square bg-zinc-100 overflow-hidden rounded-md"
                      >
                        {url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={url} alt="" className="w-full h-full object-cover" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>

          {/* Identity */}
          <Card title="Identity">
            {row.gender_identity && <Row label="Gender" value={row.gender_identity} />}
            <Row
              label="DOB"
              value={`${new Date(row.date_of_birth).toLocaleDateString()} (age ${row.age_at_submission ?? '—'})`}
            />
            <Row label="City" value={row.city} />
            <Row
              label="Email"
              value={
                <a href={`mailto:${row.email}`} className="text-black underline underline-offset-2">
                  {row.email}
                </a>
              }
            />
            <Row
              label="Phone"
              value={
                <a href={`tel:${row.phone}`} className="text-black underline underline-offset-2">
                  {row.phone}
                </a>
              }
            />
          </Card>

          {/* Stats */}
          <Card title="Stats" right={<UnitToggle value={lengthUnit} onChange={setLengthUnit} />}>
            <Row label="Height" value={fmtLen(row.height_cm)} />
            <Row label="Bust / chest" value={fmtBodyLen(row.bust_cm)} />
            <Row label="Waist" value={fmtBodyLen(row.waist_cm)} />
            <Row label="Hips" value={fmtBodyLen(row.hips_cm)} />
          </Card>

          {/* Sizing */}
          <Card title="Sizing" right={<ShoeToggle value={shoeUnit} onChange={setShoeUnit} />}>
            <Row label="Tops" value={row.size_tops} />
            <Row label="Bottoms" value={row.size_bottoms} />
            <Row label="Dress / suit" value={row.size_dress_suit} />
            <Row label="Shoe" value={fmtShoe(row.shoe_size_us)} />
          </Card>

          {/* Appearance */}
          <Card title="Appearance">
            <Row label="Hair" value={row.hair_color} />
            <Row label="Eye" value={row.eye_color} />
          </Card>

          {/* Experience */}
          <Card title="Experience">
            <p className="text-sm whitespace-pre-wrap text-zinc-800 mb-3">
              {row.modeling_experience}
            </p>
            <Row label="Agency" value={row.has_agency ? row.agency_name || 'Yes' : 'No'} />
          </Card>

          {/* Links */}
          <Card title="Links">
            <Row
              label="Instagram"
              value={
                <a
                  href={igUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-black underline underline-offset-2"
                >
                  @{row.instagram_handle}
                </a>
              }
            />
            {row.tiktok_handle && (
              <Row
                label="TikTok"
                value={
                  <a
                    href={`https://www.tiktok.com/@${row.tiktok_handle.replace(/^@/, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-black underline underline-offset-2"
                  >
                    @{row.tiktok_handle.replace(/^@/, '')}
                  </a>
                }
              />
            )}
            {row.portfolio_url && (
              <Row
                label="Portfolio"
                value={
                  <a
                    href={row.portfolio_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-black underline underline-offset-2 break-all"
                  >
                    {row.portfolio_url}
                  </a>
                }
              />
            )}
          </Card>

          {/* Availability */}
          <Card title="Availability">
            <Row label="Travel" value={row.travel_availability} />
          </Card>

          {/* Closing */}
          {row.why_tfr && (
            <Card title="Why TFR">
              <p className="text-sm whitespace-pre-wrap text-zinc-800">{row.why_tfr}</p>
            </Card>
          )}
          <Card title="How they heard">
            <p className="text-sm text-zinc-800">{row.how_heard}</p>
          </Card>
          {row.additional_notes && (
            <Card title="Additional notes">
              <p className="text-sm whitespace-pre-wrap text-zinc-800">{row.additional_notes}</p>
            </Card>
          )}
        </div>

        {/* Right column */}
        <aside className="lg:col-span-2 space-y-6 lg:sticky lg:top-20 lg:self-start">
          {canEdit ? (
            <>
              <Card title="Manage">
                <ModelActions submission={row} />
              </Card>
              <Card title="Notes &amp; tags">
                <div className="space-y-4">
                  <ModelTagsEditor submissionId={row.id} initial={row.tags ?? []} />
                  <ModelNotesEditor submissionId={row.id} initial={row.internal_notes} />
                </div>
              </Card>
            </>
          ) : (
            <Card title="Manage">
              <p className="text-xs text-zinc-500">
                You have read-only access. Ask the owner for &ldquo;Manage model submissions&rdquo;
                permission to update status, notes, or tags.
              </p>
            </Card>
          )}
          <Card title="Submitted">
            <p className="text-xs text-zinc-500">
              {new Date(row.created_at).toLocaleString()}
              {row.contacted_at && (
                <>
                  <br />
                  Contacted: {new Date(row.contacted_at).toLocaleString()}
                </>
              )}
            </p>
          </Card>
        </aside>
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setLightbox(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightbox} alt="" className="max-w-full max-h-full object-contain" />
        </div>
      )}
    </>
  )
}

function Card({
  title,
  right,
  children,
}: {
  title: string
  right?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="bg-white border border-zinc-200 rounded-md p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[11px] uppercase tracking-wider text-zinc-500">{title}</h3>
        {right}
      </div>
      <div className="space-y-1.5">{children}</div>
    </section>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-3 text-sm">
      <span className="text-zinc-500 w-32 shrink-0">{label}</span>
      <span className="text-zinc-900 flex-1">{value}</span>
    </div>
  )
}

function UnitToggle({
  value,
  onChange,
}: {
  value: 'imperial' | 'metric'
  onChange: (v: 'imperial' | 'metric') => void
}) {
  return (
    <div className="flex border border-zinc-200 rounded-full overflow-hidden text-[10px] uppercase tracking-wider">
      {(['imperial', 'metric'] as const).map((u) => (
        <button
          key={u}
          type="button"
          onClick={() => onChange(u)}
          className={`px-2 py-0.5 ${value === u ? 'bg-black text-white' : 'text-zinc-600'}`}
        >
          {u === 'imperial' ? 'ft / in' : 'cm'}
        </button>
      ))}
    </div>
  )
}

function ShoeToggle({
  value,
  onChange,
}: {
  value: 'us' | 'eu' | 'uk'
  onChange: (v: 'us' | 'eu' | 'uk') => void
}) {
  return (
    <div className="flex border border-zinc-200 rounded-full overflow-hidden text-[10px] uppercase tracking-wider">
      {(['us', 'eu', 'uk'] as const).map((u) => (
        <button
          key={u}
          type="button"
          onClick={() => onChange(u)}
          className={`px-2 py-0.5 ${value === u ? 'bg-black text-white' : 'text-zinc-600'}`}
        >
          {u.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
