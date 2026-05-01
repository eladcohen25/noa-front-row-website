'use client'

import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import AdminButton from './AdminButton'
import PermissionsPicker from './PermissionsPicker'
import { useToast } from './Toast'
import { DEFAULT_TEAM_PERMS, type PermissionsMap } from '@/lib/admin/permissionTypes'

export default function InviteForm() {
  const router = useRouter()
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [ownerNotes, setOwnerNotes] = useState('')
  const [permissions, setPermissions] = useState<PermissionsMap>({ ...DEFAULT_TEAM_PERMS })
  const [submitting, setSubmitting] = useState(false)
  const [createdPassword, setCreatedPassword] = useState<string | null>(null)
  const [createdEmailSent, setCreatedEmailSent] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          display_name: displayName || null,
          owner_notes: ownerNotes || null,
          permissions,
        }),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) {
        toast.error(json.error || 'Could not invite member')
        return
      }
      if (json.tempPassword) {
        setCreatedPassword(json.tempPassword)
        setCreatedEmailSent(!!json.emailSent)
        toast.success(json.emailSent ? 'Invite sent' : 'Member created')
      } else {
        toast.success('Permissions saved (member already had an account)')
        router.push('/admin/team')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  const inputCls =
    'w-full text-sm border border-zinc-300 rounded-md px-3 py-2 focus:outline-none focus:border-black bg-white'

  if (createdPassword) {
    return (
      <div className="bg-white border border-zinc-200 rounded-md p-6 max-w-xl">
        <h2 className="text-lg font-semibold mb-2">Member created</h2>
        <p className="text-sm text-zinc-600 mb-4">
          {createdEmailSent
            ? 'An invite email with their temporary password has been sent.'
            : 'Email delivery is not configured — share the temp password with them securely below.'}
        </p>
        <div className="bg-zinc-50 border border-zinc-200 rounded-md p-3 mb-4">
          <p className="text-[11px] uppercase tracking-wider text-zinc-500 mb-1">Temporary password</p>
          <code className="text-sm font-mono select-all">{createdPassword}</code>
        </div>
        <p className="text-xs text-zinc-500 mb-4">
          Tell them to sign in at <code>/admin/login</code> and immediately change their password
          from <code>/admin/settings</code>.
        </p>
        <div className="flex gap-2">
          <AdminButton onClick={() => router.push('/admin/team')}>Back to team</AdminButton>
          <AdminButton
            variant="secondary"
            onClick={() => {
              setCreatedPassword(null)
              setEmail('')
              setDisplayName('')
              setOwnerNotes('')
            }}
          >
            Add another
          </AdminButton>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-zinc-200 rounded-md p-6 max-w-xl space-y-5">
      <div>
        <label className="block text-[11px] uppercase tracking-wider text-zinc-500 mb-1">
          Email <span className="text-rose-600">*</span>
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputCls}
        />
      </div>
      <div>
        <label className="block text-[11px] uppercase tracking-wider text-zinc-500 mb-1">
          Display name
        </label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Optional"
          className={inputCls}
        />
      </div>
      <div>
        <label className="block text-[11px] uppercase tracking-wider text-zinc-500 mb-2">
          Permissions
        </label>
        <PermissionsPicker value={permissions} onChange={setPermissions} />
      </div>
      <div>
        <label className="block text-[11px] uppercase tracking-wider text-zinc-500 mb-1">
          Owner notes <span className="text-zinc-400 normal-case">(only visible to owners)</span>
        </label>
        <textarea
          rows={3}
          value={ownerNotes}
          onChange={(e) => setOwnerNotes(e.target.value)}
          placeholder='e.g. "Sarah handles PR inquiries only"'
          className={inputCls}
        />
      </div>
      <div className="flex gap-2">
        <AdminButton type="submit" loading={submitting}>
          Send invite
        </AdminButton>
        <AdminButton type="button" variant="ghost" onClick={() => router.push('/admin/team')}>
          Cancel
        </AdminButton>
      </div>
    </form>
  )
}
