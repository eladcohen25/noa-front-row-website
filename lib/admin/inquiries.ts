import type { SupabaseClient } from '@supabase/supabase-js'

export const INQUIRY_STATUSES = [
  'new',
  'in_progress',
  'contacted',
  'closed_won',
  'closed_lost',
  'archived',
] as const
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number]

export const STATUS_LABELS: Record<InquiryStatus, string> = {
  new: 'New',
  in_progress: 'In progress',
  contacted: 'Contacted',
  closed_won: 'Closed — won',
  closed_lost: 'Closed — lost',
  archived: 'Archived',
}

export const STATUS_COLORS: Record<InquiryStatus, string> = {
  new: 'bg-blue-50 text-blue-800 border-blue-200',
  in_progress: 'bg-amber-50 text-amber-800 border-amber-200',
  contacted: 'bg-violet-50 text-violet-800 border-violet-200',
  closed_won: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  closed_lost: 'bg-rose-50 text-rose-800 border-rose-200',
  archived: 'bg-zinc-100 text-zinc-600 border-zinc-200',
}

export const INQUIRER_TYPES = ['hotel', 'club', 'brand', 'creative', 'community'] as const
export type InquirerType = (typeof INQUIRER_TYPES)[number]

export const INQUIRER_TYPE_LABELS: Record<InquirerType, string> = {
  hotel: 'Hotel / Property',
  club: 'Private Club',
  brand: 'Brand / Sponsor',
  creative: 'Creative',
  community: 'Community',
}

export const INQUIRER_TYPE_COLORS: Record<InquirerType, string> = {
  hotel: 'bg-stone-50 text-stone-800 border-stone-200',
  club: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  brand: 'bg-amber-50 text-amber-800 border-amber-200',
  creative: 'bg-pink-50 text-pink-800 border-pink-200',
  community: 'bg-teal-50 text-teal-800 border-teal-200',
}

export const HOW_HEARD = [
  'Instagram',
  'Referral',
  'Press',
  'Event',
  'Search',
  'Other',
] as const

export interface InquiryRow {
  id: string
  created_at: string
  inquirer_type: InquirerType
  name: string
  email: string
  phone: string | null
  city: string
  how_heard: string | null
  details: Record<string, unknown>
  file_urls: string[] | null
  additional_notes: string | null
  flagged_spam: boolean | null
  status: InquiryStatus
  internal_notes: string | null
  contacted_at: string | null
  tags: string[] | null
}

export interface InquiryFilters {
  type?: InquirerType | 'all'
  status?: InquiryStatus | 'all'
  howHeard?: string | 'all'
  rangeDays?: number | 'all' | 'custom'
  fromDate?: string
  toDate?: string
  search?: string
  page?: number
  pageSize?: number
}

export const PAGE_SIZE = 25

export interface InquiryQueryResult {
  rows: InquiryRow[]
  total: number
}

export async function fetchInquiries(
  supabase: SupabaseClient,
  filters: InquiryFilters,
): Promise<InquiryQueryResult> {
  const page = Math.max(1, filters.page ?? 1)
  const pageSize = filters.pageSize ?? PAGE_SIZE
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('tfr_inquiries')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (filters.type && filters.type !== 'all') {
    query = query.eq('inquirer_type', filters.type)
  }
  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  } else if (!filters.status || filters.status === 'all') {
    // hide archived by default unless explicitly asked
    query = query.neq('status', 'archived')
  }

  if (filters.howHeard && filters.howHeard !== 'all') {
    query = query.eq('how_heard', filters.howHeard)
  }

  if (filters.rangeDays && filters.rangeDays !== 'all' && filters.rangeDays !== 'custom') {
    const since = new Date()
    since.setDate(since.getDate() - filters.rangeDays)
    query = query.gte('created_at', since.toISOString())
  } else if (filters.rangeDays === 'custom' && filters.fromDate) {
    query = query.gte('created_at', filters.fromDate)
    if (filters.toDate) query = query.lte('created_at', filters.toDate)
  }

  if (filters.search && filters.search.trim()) {
    // Strip characters that have meaning inside the PostgREST `or` filter
    // (commas/parens) and inside ilike patterns (% and _).
    const safe = filters.search.trim().replace(/[(),%_]/g, ' ').replace(/\s+/g, ' ').trim()
    if (safe.length > 0) {
      query = query.or(
        [
          `name.ilike.%${safe}%`,
          `email.ilike.%${safe}%`,
          `city.ilike.%${safe}%`,
          `details->>brandName.ilike.%${safe}%`,
          `details->>propertyName.ilike.%${safe}%`,
          `details->>clubName.ilike.%${safe}%`,
        ].join(','),
      )
    }
  }

  query = query.range(from, to)

  const { data, count, error } = await query
  if (error) throw error
  return { rows: (data ?? []) as InquiryRow[], total: count ?? 0 }
}

export function getIdentifier(row: InquiryRow): string {
  const d = row.details as Record<string, unknown>
  switch (row.inquirer_type) {
    case 'hotel':
      return (d.propertyName as string) || '—'
    case 'club':
      return (d.clubName as string) || '—'
    case 'brand':
      return (d.brandName as string) || '—'
    case 'creative':
      return (d.primaryRole as string) || '—'
    case 'community':
      return Array.isArray(d.involvement) ? (d.involvement as string[]).join(', ') : '—'
  }
}

const FIELD_LABELS: Record<string, string> = {
  propertyName: 'Property name',
  spaceType: 'Type of space',
  activationTypes: 'Activation type',
  activationTypesOther: 'Activation type (other)',
  expectedAttendance: 'Expected attendance',
  eventTimeline: 'Event timeline',
  budget: 'Budget',
  goals: 'Goals',
  additionalNotes: 'Additional notes',
  clubName: 'Club name',
  engagementType: 'Engagement type',
  brandName: 'Brand name',
  brandCategory: 'Brand category',
  brandCategoryOther: 'Brand category (other)',
  pastActivation: 'Past activation',
  primaryRole: 'Primary role',
  workInterest: 'Looking to do',
  portfolioUrl: 'Portfolio',
  involvement: 'Wants to be involved',
  aboutYou: 'About them',
}

export function labelFor(field: string): string {
  return FIELD_LABELS[field] ?? field
}

export function formatRelativeTime(iso: string): string {
  const now = Date.now()
  const then = new Date(iso).getTime()
  const diffSec = Math.round((now - then) / 1000)
  if (diffSec < 60) return `${diffSec}s ago`
  const diffMin = Math.round(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.round(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDay = Math.round(diffHr / 24)
  if (diffDay < 30) return `${diffDay}d ago`
  const diffMon = Math.round(diffDay / 30)
  if (diffMon < 12) return `${diffMon}mo ago`
  const diffYr = Math.round(diffMon / 12)
  return `${diffYr}y ago`
}
