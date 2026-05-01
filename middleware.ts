import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import type { Permission } from '@/lib/admin/permissions'

// Route prefix → required permission. Order matters: longest-prefix wins.
const ROUTE_PERMS: { prefix: string; perm: Permission }[] = [
  { prefix: '/admin/team', perm: 'manage_team' },
  { prefix: '/admin/inquiries', perm: 'view_inquiries' },
  { prefix: '/admin/models', perm: 'view_models' },
  { prefix: '/admin/content', perm: 'view_content' },
  { prefix: '/admin/edit', perm: 'view_content' },
]

export async function middleware(req: NextRequest) {
  const { response, user, supabase } = await updateSession(req)

  const path = req.nextUrl.pathname
  const isAdminRoute = path.startsWith('/admin')
  const isLoginRoute = path === '/admin/login'

  if (isAdminRoute && !isLoginRoute && !user) {
    const url = req.nextUrl.clone()
    url.pathname = '/admin/login'
    url.searchParams.set('redirect', path)
    return NextResponse.redirect(url)
  }

  if (isLoginRoute && user) {
    const url = req.nextUrl.clone()
    url.pathname = '/admin'
    url.search = ''
    return NextResponse.redirect(url)
  }

  // Route-level permission gating for signed-in admins.
  if (user && supabase && isAdminRoute && !isLoginRoute) {
    const matched = ROUTE_PERMS.find((r) => path === r.prefix || path.startsWith(r.prefix + '/'))
    if (matched) {
      const { data, error } = await supabase
        .from('admin_users')
        .select('role, permissions')
        .eq('id', user.id)
        .maybeSingle()

      // If they don't have an admin_users row yet, treat them as having
      // no permissions (forces them to /admin/settings, where they can
      // at least sign out / change password).
      const allowed =
        !error &&
        data &&
        (data.role === 'owner' || (data.permissions ?? {})[matched.perm] === true)

      if (!allowed) {
        const url = req.nextUrl.clone()
        url.pathname = '/admin'
        url.search = '?denied=' + encodeURIComponent(matched.perm)
        return NextResponse.redirect(url)
      }
    }
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*'],
}
