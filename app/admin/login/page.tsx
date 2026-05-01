'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { FormEvent, useState } from 'react'
import AdminButton from '@/components/admin/AdminButton'
import { createBrowserClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createBrowserClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) {
      setError('Invalid credentials')
      setLoading(false)
      return
    }
    const redirect = searchParams.get('redirect') || '/admin'
    router.push(redirect)
    router.refresh()
  }

  const handleReset = async () => {
    if (!email) {
      setError('Enter your email above first.')
      return
    }
    setError(null)
    setResetLoading(true)
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/settings`,
    })
    setResetLoading(false)
    if (resetError) {
      setError('Could not send reset email.')
      return
    }
    setResetSent(true)
  }

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">The Front Row</p>
          <h1 className="font-typekit text-3xl mt-2">Admin</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-zinc-600 mb-1">
              Email
            </label>
            <input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-300 rounded-md text-sm focus:outline-none focus:border-black"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-zinc-600 mb-1">
              Password
            </label>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-300 rounded-md text-sm focus:outline-none focus:border-black"
            />
          </div>

          {error && (
            <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 px-3 py-2 rounded-md">
              {error}
            </p>
          )}
          {resetSent && (
            <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-md">
              Reset email sent. Check your inbox.
            </p>
          )}

          <AdminButton type="submit" loading={loading} className="w-full">
            Sign in
          </AdminButton>

          <button
            type="button"
            onClick={handleReset}
            disabled={resetLoading}
            className="w-full text-xs text-zinc-500 hover:text-black transition-colors py-2"
          >
            {resetLoading ? 'Sending…' : 'Forgot password?'}
          </button>
        </form>
      </div>
    </main>
  )
}
