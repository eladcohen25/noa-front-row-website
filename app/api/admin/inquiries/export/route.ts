import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import {
  fetchInquiries,
  type InquirerType,
  type InquiryFilters,
  type InquiryRow,
  type InquiryStatus,
} from '@/lib/admin/inquiries'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const BASE_COLUMNS: (keyof InquiryRow | string)[] = [
  'id',
  'created_at',
  'inquirer_type',
  'name',
  'email',
  'phone',
  'city',
  'how_heard',
  'status',
  'contacted_at',
  'tags',
  'internal_notes',
  'additional_notes',
  'file_urls',
]

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return ''
  let str: string
  if (Array.isArray(value)) str = value.join('; ')
  else if (typeof value === 'object') str = JSON.stringify(value)
  else str = String(value)
  if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`
  return str
}

export async function GET(req: NextRequest) {
  const supabase = createServerClient()
  const { data: userData, error: userErr } = await supabase.auth.getUser()
  if (userErr || !userData.user) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  const params = req.nextUrl.searchParams
  const rangeParam = params.get('range') ?? '30'
  const filters: InquiryFilters = {
    type: (params.get('type') as InquirerType | 'all' | null) ?? 'all',
    status: (params.get('status') as InquiryStatus | 'all' | null) ?? 'all',
    howHeard: params.get('howHeard') ?? 'all',
    rangeDays:
      rangeParam === 'all' ? 'all' : rangeParam === 'custom' ? 'custom' : Number(rangeParam) || 30,
    fromDate: params.get('from') ?? undefined,
    toDate: params.get('to') ?? undefined,
    search: params.get('search') ?? undefined,
    page: 1,
    pageSize: 1000, // export cap
  }

  const { rows } = await fetchInquiries(supabase, filters)

  // Discover all detail keys across the result set.
  const detailKeys = new Set<string>()
  for (const row of rows) {
    if (row.details && typeof row.details === 'object') {
      for (const k of Object.keys(row.details)) detailKeys.add(k)
    }
  }
  const detailColumns = Array.from(detailKeys).map((k) => `details.${k}`)
  const allColumns = [...BASE_COLUMNS, ...detailColumns]

  const headerLine = allColumns.join(',')
  const lines = [headerLine]
  for (const row of rows) {
    const cells = allColumns.map((col) => {
      if (col.startsWith('details.')) {
        const key = col.slice('details.'.length)
        return csvEscape((row.details as Record<string, unknown>)[key])
      }
      return csvEscape((row as unknown as Record<string, unknown>)[col])
    })
    lines.push(cells.join(','))
  }

  const csv = lines.join('\n')
  const filename = `tfr-inquiries-${new Date().toISOString().slice(0, 10)}.csv`

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
