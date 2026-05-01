import ModelFilters from '@/components/admin/ModelFilters'
import ModelsTable from '@/components/admin/ModelsTable'
import { requireUser } from '@/lib/admin/auth'
import {
  fetchModelSubmissions,
  signPhotoUrls,
  type ModelFilters as Filters,
  type ModelStatus,
} from '@/lib/admin/models'
import { effectivePermissions, getAdminProfile } from '@/lib/admin/permissions'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Record<string, string | string[] | undefined>
}

function parse(searchParams: PageProps['searchParams']): Filters {
  const get = (k: string): string | undefined => {
    const v = searchParams[k]
    return Array.isArray(v) ? v[0] : v
  }
  return {
    status: (get('status') as ModelStatus | 'all' | undefined) ?? 'all',
    search: get('search'),
    hasAgency: (get('hasAgency') as 'yes' | 'no' | 'all' | undefined) ?? 'all',
    hairColor: get('hairColor'),
    eyeColor: get('eyeColor'),
    travel: get('travel'),
    ageMin: get('ageMin') ? Number(get('ageMin')) : undefined,
    ageMax: get('ageMax') ? Number(get('ageMax')) : undefined,
    heightMinCm: get('heightMin') ? Number(get('heightMin')) : undefined,
    heightMaxCm: get('heightMax') ? Number(get('heightMax')) : undefined,
    city: get('city'),
    page: Number(get('page')) || 1,
  }
}

export default async function ModelsAdminPage({ searchParams }: PageProps) {
  const { supabase } = await requireUser()
  const profileResult = await getAdminProfile(supabase)
  const permissions = effectivePermissions(profileResult?.profile ?? null)

  const filters = parse(searchParams)

  let rows: Awaited<ReturnType<typeof fetchModelSubmissions>>['rows'] = []
  let total = 0
  let errorMessage: string | null = null
  try {
    const result = await fetchModelSubmissions(supabase, filters)
    rows = result.rows
    total = result.total
  } catch (err) {
    const e = err as { message?: string; code?: string }
    errorMessage = e?.message || 'Could not load model submissions.'
    if (e?.code === '42501') {
      errorMessage =
        'Permission denied loading model submissions. Run supabase/migrations/20260430_models_submissions.sql to grant the required privileges.'
    }
  }

  // Generate signed URLs for each headshot for the list thumbnails.
  const thumbnails =
    rows.length > 0
      ? await signPhotoUrls(
          supabase,
          rows.map((r) => r.headshot_url).filter(Boolean),
        )
      : {}

  return (
    <div>
      <header className="mb-6 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold">Models</h1>
          <p className="text-xs text-zinc-500">
            {total} matching · all photos load via 1-hour signed URLs.
          </p>
        </div>
      </header>

      <ModelFilters />

      {errorMessage ? (
        <div className="border border-rose-200 bg-rose-50 text-rose-900 text-sm rounded-md px-4 py-3">
          {errorMessage}
        </div>
      ) : (
        <ModelsTable
          rows={rows}
          total={total}
          page={filters.page ?? 1}
          thumbnails={thumbnails}
          canEdit={permissions.edit_models}
        />
      )}
    </div>
  )
}
