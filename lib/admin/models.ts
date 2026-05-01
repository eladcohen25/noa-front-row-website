import type { SupabaseClient } from '@supabase/supabase-js'

export const MODEL_STATUSES = [
  'new',
  'shortlisted',
  'contacted',
  'signed',
  'passed',
  'archived',
] as const
export type ModelStatus = (typeof MODEL_STATUSES)[number]

export const MODEL_STATUS_LABELS: Record<ModelStatus, string> = {
  new: 'New',
  shortlisted: 'Shortlisted',
  contacted: 'Contacted',
  signed: 'Signed',
  passed: 'Passed',
  archived: 'Archived',
}

export const MODEL_STATUS_COLORS: Record<ModelStatus, string> = {
  new: 'bg-amber-50 text-amber-900 border-amber-200',
  shortlisted: 'bg-violet-50 text-violet-900 border-violet-200',
  contacted: 'bg-blue-50 text-blue-900 border-blue-200',
  signed: 'bg-emerald-50 text-emerald-900 border-emerald-200',
  passed: 'bg-zinc-50 text-zinc-700 border-zinc-200',
  archived: 'bg-zinc-100 text-zinc-500 border-zinc-200',
}

export const MODEL_PAGE_SIZE = 24

export interface ModelRow {
  id: string
  created_at: string
  full_name: string
  email: string
  phone: string
  pronouns: string
  city: string
  state_region: string
  country: string
  date_of_birth: string
  age_at_submission: number | null
  height_cm: number
  bust_cm: number
  waist_cm: number
  hips_cm: number
  size_tops: string
  size_bottoms: string
  size_dress_suit: string
  shoe_size_us: number
  hair_color: string
  eye_color: string
  heritage: string | null
  modeling_experience: string
  has_agency: boolean
  agency_name: string | null
  unions: string[] | null
  special_skills: string[] | null
  special_skills_notes: string | null
  markings_notes: string | null
  headshot_url: string
  fullbody_url: string
  profile_left_url: string
  profile_right_url: string
  additional_photo_urls: string[] | null
  instagram_handle: string
  tiktok_handle: string | null
  portfolio_url: string | null
  travel_availability: string
  earliest_available: string | null
  why_tfr: string
  how_heard: string
  additional_notes: string | null
  status: ModelStatus
  internal_notes: string | null
  tags: string[] | null
  contacted_at: string | null
  flagged_spam: boolean | null
  gender_identity: string | null
}

export interface ModelFilters {
  status?: ModelStatus | 'all'
  search?: string
  hasAgency?: 'yes' | 'no' | 'all'
  hairColor?: string
  eyeColor?: string
  travel?: string
  ageMin?: number
  ageMax?: number
  heightMinCm?: number
  heightMaxCm?: number
  city?: string
  page?: number
}

export async function fetchModelSubmissions(
  supabase: SupabaseClient,
  filters: ModelFilters,
): Promise<{ rows: ModelRow[]; total: number }> {
  const page = filters.page && filters.page > 0 ? filters.page : 1
  const from = (page - 1) * MODEL_PAGE_SIZE
  const to = from + MODEL_PAGE_SIZE - 1

  let query = supabase
    .from('tfr_model_submissions')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  } else {
    query = query.neq('status', 'archived')
  }
  if (filters.hasAgency === 'yes') query = query.eq('has_agency', true)
  if (filters.hasAgency === 'no') query = query.eq('has_agency', false)
  if (filters.hairColor && filters.hairColor !== 'all') query = query.eq('hair_color', filters.hairColor)
  if (filters.eyeColor && filters.eyeColor !== 'all') query = query.eq('eye_color', filters.eyeColor)
  if (filters.travel && filters.travel !== 'all') query = query.eq('travel_availability', filters.travel)
  if (filters.ageMin !== undefined) query = query.gte('age_at_submission', filters.ageMin)
  if (filters.ageMax !== undefined) query = query.lte('age_at_submission', filters.ageMax)
  if (filters.heightMinCm !== undefined) query = query.gte('height_cm', filters.heightMinCm)
  if (filters.heightMaxCm !== undefined) query = query.lte('height_cm', filters.heightMaxCm)
  if (filters.city && filters.city.trim()) {
    const safe = filters.city.trim().replace(/[(),%_]/g, ' ').replace(/\s+/g, ' ').trim()
    if (safe) query = query.ilike('city', `%${safe}%`)
  }
  if (filters.search && filters.search.trim()) {
    const safe = filters.search.trim().replace(/[(),%_]/g, ' ').replace(/\s+/g, ' ').trim()
    if (safe) {
      query = query.or(
        [
          `full_name.ilike.%${safe}%`,
          `email.ilike.%${safe}%`,
          `instagram_handle.ilike.%${safe}%`,
          `city.ilike.%${safe}%`,
        ].join(','),
      )
    }
  }

  const { data, count, error } = await query.range(from, to)
  if (error) throw error

  return {
    rows: (data ?? []) as ModelRow[],
    total: count ?? 0,
  }
}

export async function getModelSubmission(
  supabase: SupabaseClient,
  id: string,
): Promise<ModelRow | null> {
  const { data, error } = await supabase
    .from('tfr_model_submissions')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) return null
  return (data as ModelRow | null) ?? null
}

export async function signPhotoUrls(
  supabase: SupabaseClient,
  paths: string[],
): Promise<Record<string, string>> {
  const out: Record<string, string> = {}
  for (const path of paths) {
    if (!path) continue
    const { data } = await supabase.storage
      .from('tfr-model-photos')
      .createSignedUrl(path, 60 * 60)
    if (data?.signedUrl) out[path] = data.signedUrl
  }
  return out
}

export function ageFromRow(row: ModelRow): number | null {
  if (typeof row.age_at_submission === 'number') return row.age_at_submission
  return null
}
