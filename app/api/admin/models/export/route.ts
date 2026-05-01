import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import {
  fetchModelSubmissions,
  type ModelFilters,
  type ModelRow,
  type ModelStatus,
} from '@/lib/admin/models'
import { effectivePermissions, getAdminProfile } from '@/lib/admin/permissions'
import { cmToFtIn, cmToIn, shoeUsToEu, shoeUsToUk } from '@/lib/models/units'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const HEADERS = [
  'id',
  'created_at',
  'full_name',
  'email',
  'phone',
  'pronouns',
  'gender_identity',
  'city',
  'state_region',
  'country',
  'date_of_birth',
  'age_at_submission',
  'is_adult',
  'height_cm',
  'height_ft_in',
  'bust_cm',
  'bust_in',
  'waist_cm',
  'waist_in',
  'hips_cm',
  'hips_in',
  'size_tops',
  'size_bottoms',
  'size_dress_suit',
  'shoe_size_us',
  'shoe_size_eu',
  'shoe_size_uk',
  'hair_color',
  'eye_color',
  'heritage',
  'modeling_experience',
  'has_agency',
  'agency_name',
  'unions',
  'special_skills',
  'special_skills_notes',
  'markings_notes',
  'headshot_url',
  'fullbody_url',
  'profile_left_url',
  'profile_right_url',
  'additional_photo_urls',
  'all_photo_urls',
  'instagram_handle',
  'tiktok_handle',
  'portfolio_url',
  'travel_availability',
  'earliest_available',
  'why_tfr',
  'how_heard',
  'additional_notes',
  'status',
  'internal_notes',
  'tags',
  'contacted_at',
  'flagged_spam',
] as const

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return ''
  let str: string
  if (Array.isArray(value)) str = value.join('; ')
  else if (typeof value === 'object') str = JSON.stringify(value)
  else str = String(value)
  if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`
  return str
}

function rowToCells(row: ModelRow): string[] {
  const { feet, inches } = cmToFtIn(row.height_cm)
  const heightFtIn = `${feet}'${inches}"`
  const add = row.additional_photo_urls ?? []
  const allPhotos = [
    row.headshot_url,
    row.fullbody_url,
    row.profile_left_url,
    row.profile_right_url,
    ...add,
  ].filter(Boolean)

  const cells: unknown[] = [
    row.id,
    row.created_at,
    row.full_name,
    row.email,
    row.phone,
    row.pronouns,
    row.gender_identity,
    row.city,
    row.state_region,
    row.country,
    row.date_of_birth,
    row.age_at_submission,
    row.is_adult,
    row.height_cm,
    heightFtIn,
    row.bust_cm,
    row.bust_cm == null ? '' : cmToIn(row.bust_cm),
    row.waist_cm,
    row.waist_cm == null ? '' : cmToIn(row.waist_cm),
    row.hips_cm,
    row.hips_cm == null ? '' : cmToIn(row.hips_cm),
    row.size_tops,
    row.size_bottoms,
    row.size_dress_suit,
    row.shoe_size_us,
    shoeUsToEu(row.shoe_size_us),
    shoeUsToUk(row.shoe_size_us),
    row.hair_color,
    row.eye_color,
    row.heritage,
    row.modeling_experience,
    row.has_agency,
    row.agency_name,
    row.unions,
    row.special_skills,
    row.special_skills_notes,
    row.markings_notes,
    row.headshot_url,
    row.fullbody_url,
    row.profile_left_url,
    row.profile_right_url,
    row.additional_photo_urls,
    allPhotos.join('; '),
    row.instagram_handle,
    row.tiktok_handle,
    row.portfolio_url,
    row.travel_availability,
    row.earliest_available,
    row.why_tfr,
    row.how_heard,
    row.additional_notes,
    row.status,
    row.internal_notes,
    row.tags,
    row.contacted_at,
    row.flagged_spam,
  ]
  return cells.map(csvEscape)
}

function parseFilters(params: URLSearchParams): ModelFilters {
  const get = (k: string) => params.get(k) ?? undefined
  return {
    status: (get('status') as ModelStatus | 'all' | undefined) ?? 'all',
    search: get('search'),
    hasAgency: (get('hasAgency') as 'yes' | 'no' | 'all' | undefined) ?? 'all',
    travel: get('travel'),
    ageMin: get('ageMin') ? Number(get('ageMin')) : undefined,
    ageMax: get('ageMax') ? Number(get('ageMax')) : undefined,
    heightMinCm: get('heightMin') ? Number(get('heightMin')) : undefined,
    heightMaxCm: get('heightMax') ? Number(get('heightMax')) : undefined,
    city: get('city'),
    stateRegion: get('stateRegion'),
    exportLimit: 10_000,
  }
}

export async function GET(req: NextRequest) {
  const supabase = createServerClient()
  const profileResult = await getAdminProfile(supabase)
  if (!profileResult?.user) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }
  const perms = effectivePermissions(profileResult.profile)
  if (!perms.view_models) {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 })
  }

  const filters = parseFilters(req.nextUrl.searchParams)
  const { rows } = await fetchModelSubmissions(supabase, filters)

  const lines = [HEADERS.join(',')]
  for (const row of rows) {
    lines.push(rowToCells(row).join(','))
  }

  const csv = lines.join('\n')
  const filename = `tfr-models-${new Date().toISOString().slice(0, 10)}.csv`

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
