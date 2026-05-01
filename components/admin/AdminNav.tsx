'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import AdminButton from './AdminButton'
import type { PermissionsMap } from '@/lib/admin/permissionTypes'
import { createBrowserClient } from '@/lib/supabase/client'

interface AdminNavProps {
  email: string
  permissions: PermissionsMap
}

export default function AdminNav({ email, permissions }: AdminNavProps) {
  const NAV = [
    permissions.view_inquiries ? { href: '/admin', label: 'Inquiries' } : null,
    permissions.view_models ? { href: '/admin/models', label: 'Models' } : null,
    permissions.view_content ? { href: '/admin/content', label: 'Content' } : null,
    permissions.view_content ? { href: '/admin/edit', label: 'Edit' } : null,
    permissions.manage_team ? { href: '/admin/team', label: 'Team' } : null,
    { href: '/admin/settings', label: 'Settings' },
  ].filter((x): x is { href: string; label: string } => x !== null)
  const router = useRouter()
  const pathname = usePathname()
  const [signingOut, setSigningOut] = useState(false)

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    if (href === '/admin/content') return pathname?.startsWith('/admin/content')
    if (href === '/admin/edit') return pathname?.startsWith('/admin/edit')
    if (href === '/admin/models') return pathname?.startsWith('/admin/models')
    return pathname?.startsWith(href)
  }

  // The public site uses a custom cursor that sets `cursor: none` globally on
  // <html>/<body>. Inside the admin we always want the OS cursor back, so reset
  // it whenever an admin page is visible.
  useEffect(() => {
    document.documentElement.style.cursor = ''
    document.body.style.cursor = ''
  }, [pathname])

  const handleSignOut = async () => {
    setSigningOut(true)
    const supabase = createBrowserClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <header className="border-b border-zinc-200 bg-white sticky top-0 z-40">
      <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between gap-6">
        <Link href="/admin" className="flex items-center gap-3">
          <span className="text-xs uppercase tracking-[0.3em] text-zinc-500">The Front Row</span>
          <span className="text-xs text-zinc-400">Admin</span>
        </Link>

        <nav className="flex items-center gap-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm px-3 py-1.5 rounded-md transition-colors ${
                isActive(item.href) ? 'bg-zinc-100 text-black' : 'text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-zinc-500 hover:text-black inline-flex items-center gap-1"
            title="Open the public site in a new tab"
          >
            View site
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <path
                d="M3 1H9V7"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 1L4 6"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M7 8H1V2"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
          <span className="text-xs text-zinc-300 hidden md:inline">|</span>
          <span className="text-xs text-zinc-500 hidden md:block">{email}</span>
          <AdminButton variant="ghost" size="sm" onClick={handleSignOut} loading={signingOut}>
            Sign out
          </AdminButton>
        </div>
      </div>
    </header>
  )
}
