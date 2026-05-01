import { ReactNode } from 'react'
import AdminNav from '@/components/admin/AdminNav'
import { ToastProvider } from '@/components/admin/Toast'
import { effectivePermissions, getAdminProfile } from '@/lib/admin/permissions'

export const metadata = {
  title: 'Admin — The Front Row',
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const result = await getAdminProfile()
  const user = result?.user ?? null
  const profile = result?.profile ?? null
  const permissions = effectivePermissions(profile)

  return (
    <div className="min-h-screen bg-zinc-50 text-black font-sans">
      <ToastProvider>
        {user && <AdminNav email={user.email ?? ''} permissions={permissions} />}
        <main className="max-w-[1400px] mx-auto px-6 py-8">{children}</main>
      </ToastProvider>
    </div>
  )
}
