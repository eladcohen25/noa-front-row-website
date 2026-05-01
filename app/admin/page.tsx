import DashboardToolbar from '@/components/admin/DashboardToolbar'
import DeniedToast from '@/components/admin/DeniedToast'
import InquiriesTable from '@/components/admin/InquiriesTable'
import InquiryFilters from '@/components/admin/InquiryFilters'
import { requireUser } from '@/lib/admin/auth'
import {
  fetchInquiries,
  type InquirerType,
  type InquiryFilters as Filters,
  type InquiryStatus,
} from '@/lib/admin/inquiries'
import { effectivePermissions, getAdminProfile } from '@/lib/admin/permissions'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Record<string, string | string[] | undefined>
}

function parseFilters(searchParams: PageProps['searchParams']): Filters {
  const get = (key: string): string | undefined => {
    const v = searchParams[key]
    return Array.isArray(v) ? v[0] : v
  }
  const rangeParam = get('range') ?? 'all'
  const rangeDays: Filters['rangeDays'] =
    rangeParam === 'all'
      ? 'all'
      : rangeParam === 'custom'
        ? 'custom'
        : Number(rangeParam) || 'all'
  return {
    type: (get('type') as InquirerType | 'all' | undefined) ?? 'all',
    status: (get('status') as InquiryStatus | 'all' | undefined) ?? 'all',
    howHeard: get('howHeard') ?? 'all',
    rangeDays,
    fromDate: get('from'),
    toDate: get('to'),
    search: get('search'),
    page: Number(get('page')) || 1,
  }
}

export default async function InquiriesDashboardPage({ searchParams }: PageProps) {
  const { supabase } = await requireUser()
  const result = await getAdminProfile(supabase)
  const permissions = effectivePermissions(result?.profile ?? null)

  if (!permissions.view_inquiries) {
    return (
      <div>
        <DeniedToast />
        <div className="bg-white border border-zinc-200 rounded-md p-8 text-center">
          <h1 className="text-lg font-semibold mb-2">Welcome to TFR admin</h1>
          <p className="text-sm text-zinc-500 max-w-md mx-auto">
            Your account doesn&apos;t have access to inquiries. Pick a section from the top
            nav, or visit Settings to change your password.
          </p>
        </div>
      </div>
    )
  }

  const filters = parseFilters(searchParams)

  let rows: Awaited<ReturnType<typeof fetchInquiries>>['rows'] = []
  let total = 0
  let errorMessage: string | null = null
  try {
    const out = await fetchInquiries(supabase, filters)
    rows = out.rows
    total = out.total
  } catch (err) {
    const e = err as { message?: string; code?: string; hint?: string }
    errorMessage = e?.message || 'Could not load inquiries.'
    if (e?.code === '42501') {
      errorMessage = `Permission denied loading inquiries. Run supabase/migrations/20260430_fix_admin_grants.sql in Supabase to grant the required privileges.`
    }
  }

  return (
    <div>
      <DeniedToast />
      <DashboardToolbar total={total} />
      <InquiryFilters />
      {errorMessage ? (
        <div className="border border-rose-200 bg-rose-50 text-rose-900 text-sm rounded-md px-4 py-3">
          {errorMessage}
        </div>
      ) : (
        <InquiriesTable
          rows={rows}
          total={total}
          page={filters.page ?? 1}
          canEdit={permissions.edit_inquiries}
        />
      )}
    </div>
  )
}
