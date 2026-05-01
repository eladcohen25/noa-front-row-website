import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/server'

export interface SiteContentRow {
  key: string
  page: string
  label: string
  description: string | null
  type: 'text' | 'textarea' | 'richtext' | 'image' | 'url' | 'number'
  value: string | null
  sort_order: number
  updated_at: string
  updated_by: string | null
  required: boolean
}

export interface PageGroup {
  key: string
  label: string
  livePath: string
  description?: string
}

export const PAGE_GROUPS: PageGroup[] = [
  {
    key: 'home',
    label: 'Home',
    livePath: '/',
    description: 'Hero headline and the "Inquire now" button.',
  },
  {
    key: 'about',
    label: 'About',
    livePath: '/about',
    description: 'Headline, studio paragraph, founder block, images, and event dates.',
  },
  {
    key: 'services',
    label: 'Services',
    livePath: '/services',
    description: 'Page heading, intro line, four service sections, and the closing lines.',
  },
  {
    key: 'fw26',
    label: 'FW26 @ Bel-Aire',
    livePath: '/lookbook',
    description: 'Hero label/title/CTA, editorial statement, section dates, and footer text.',
  },
  {
    key: 'models',
    label: 'Models (casting)',
    livePath: '/models',
    description: 'Intro headline and body for the public model submission page.',
  },
  {
    key: 'contact',
    label: 'Contact / Footer',
    livePath: '/contact',
    description: 'Page heading and the two contact cards (name, role, email, Instagram).',
  },
]

/**
 * Fetch all site_content rows for a given page key.
 * Uses the user's session (RLS allows public read).
 * Returns ordered by sort_order.
 */
export async function getPageContentRows(page: string): Promise<SiteContentRow[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('site_content')
    .select('*')
    .eq('page', page)
    .order('sort_order')
  if (error) {
    console.error('getPageContentRows error', error)
    return []
  }
  return (data ?? []) as SiteContentRow[]
}

const PREVIEW_COOKIE = 'tfr_preview'

/**
 * If the request is from an authenticated admin session AND a preview
 * cookie exists for this page, return the staged preview values. The
 * preview is silently ignored for unauthenticated visitors so a stale
 * cookie can never affect the public site.
 */
async function readPreviewOverlay(page: string): Promise<Record<string, string> | null> {
  let cookieStore
  try {
    cookieStore = cookies()
  } catch {
    return null
  }
  const raw = cookieStore.get(PREVIEW_COOKIE)?.value
  if (!raw) return null

  const supabase = createServerClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return null

  try {
    const parsed = JSON.parse(raw) as { page?: string; values?: Record<string, string> }
    if (parsed.page !== page || !parsed.values) return null
    return parsed.values
  } catch {
    return null
  }
}

/**
 * Convenience: returns a flat { key: value } map for a page,
 * suitable for direct use in server components.
 *
 * The returned object is wrapped in a Proxy so that ANY missing key
 * yields an empty string instead of `undefined`. This keeps public
 * pages safe even when the migration hasn't been run, when a row was
 * deleted, or when a value is null. Empty values are then handled by
 * each component's own fallback (see e.g. AboutContent's defaults).
 *
 * If an admin is currently previewing unsaved changes (POST to
 * /api/admin/content/preview), those staged values are merged on top.
 */
export async function getPageContent(page: string): Promise<Record<string, string>> {
  const rows = await getPageContentRows(page)
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value ?? '']))

  const overlay = await readPreviewOverlay(page)
  if (overlay) {
    for (const [k, v] of Object.entries(overlay)) {
      if (typeof v === 'string') map[k] = v
    }
  }

  return new Proxy(map, {
    get: (target, key: string) => (typeof key === 'string' && key in target ? target[key] : ''),
  }) as Record<string, string>
}

/** Server-side helper: is there an active preview cookie for this page? */
export async function isPreviewing(page: string): Promise<boolean> {
  const overlay = await readPreviewOverlay(page)
  return !!overlay
}

/**
 * Fetch all rows grouped by page (for the CMS index).
 */
export async function getAllPageSummaries(): Promise<
  { page: string; fieldCount: number; lastUpdated: string | null }[]
> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('site_content')
    .select('page, updated_at')
    .order('updated_at', { ascending: false })
  if (error) return []

  const map = new Map<string, { count: number; lastUpdated: string | null }>()
  for (const row of data ?? []) {
    const existing = map.get(row.page)
    if (existing) {
      existing.count += 1
    } else {
      map.set(row.page, { count: 1, lastUpdated: row.updated_at })
    }
  }
  return PAGE_GROUPS.map((g) => ({
    page: g.key,
    fieldCount: map.get(g.key)?.count ?? 0,
    lastUpdated: map.get(g.key)?.lastUpdated ?? null,
  }))
}
