'use client'

import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import AdminButton from './AdminButton'
import { useToast } from './Toast'
import { createBrowserClient } from '@/lib/supabase/client'

interface SettingsClientProps {
  email: string
  lastSignIn: string | null
}

export default function SettingsClient({ email, lastSignIn }: SettingsClientProps) {
  const router = useRouter()
  const toast = useToast()
  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [saving, setSaving] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  const handleChange = async (e: FormEvent) => {
    e.preventDefault()
    if (newPwd.length < 8) {
      toast.error('New password must be at least 8 characters')
      return
    }
    if (newPwd !== confirmPwd) {
      toast.error('Passwords do not match')
      return
    }
    setSaving(true)
    const supabase = createBrowserClient()

    // re-verify current password before changing
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPwd,
    })
    if (signInError) {
      toast.error('Current password is incorrect')
      setSaving(false)
      return
    }

    const { error } = await supabase.auth.updateUser({ password: newPwd })
    setSaving(false)
    if (error) {
      toast.error('Could not change password')
      return
    }
    setCurrentPwd('')
    setNewPwd('')
    setConfirmPwd('')
    toast.success('Password updated')
  }

  const signOut = async () => {
    if (!confirm('Sign out of admin?')) return
    setSigningOut(true)
    const supabase = createBrowserClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  const inputCls =
    'w-full text-sm border border-zinc-300 rounded-md px-3 py-2 focus:outline-none focus:border-black bg-white'

  return (
    <div className="space-y-6 max-w-xl">
      <header>
        <h1 className="text-xl font-semibold">Settings</h1>
      </header>

      <section className="bg-white border border-zinc-200 rounded-md p-5">
        <h2 className="text-sm font-semibold mb-3">Account</h2>
        <div className="text-sm space-y-2">
          <div className="flex justify-between gap-4">
            <span className="text-zinc-500">Email</span>
            <span>{email}</span>
          </div>
          {lastSignIn && (
            <div className="flex justify-between gap-4">
              <span className="text-zinc-500">Last sign-in</span>
              <span>{new Date(lastSignIn).toLocaleString()}</span>
            </div>
          )}
        </div>
      </section>

      <section className="bg-white border border-zinc-200 rounded-md p-5">
        <h2 className="text-sm font-semibold mb-3">Change password</h2>
        <form onSubmit={handleChange} className="space-y-3">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-zinc-500 mb-1">
              Current password
            </label>
            <input
              type="password"
              required
              value={currentPwd}
              onChange={(e) => setCurrentPwd(e.target.value)}
              autoComplete="current-password"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-zinc-500 mb-1">
              New password
            </label>
            <input
              type="password"
              required
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              autoComplete="new-password"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-zinc-500 mb-1">
              Confirm new password
            </label>
            <input
              type="password"
              required
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              autoComplete="new-password"
              className={inputCls}
            />
          </div>
          <AdminButton type="submit" loading={saving}>
            Update password
          </AdminButton>
        </form>
      </section>

      <section className="bg-white border border-zinc-200 rounded-md p-5">
        <h2 className="text-sm font-semibold mb-3">Session</h2>
        <AdminButton variant="danger" onClick={signOut} loading={signingOut}>
          Sign out
        </AdminButton>
      </section>
    </div>
  )
}
