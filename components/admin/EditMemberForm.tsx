'use client'

import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import AdminButton from './AdminButton'
import PermissionsPicker from './PermissionsPicker'
import { useToast } from './Toast'
import type { AdminProfile, PermissionsMap } from '@/lib/admin/permissionTypes'

interface EditMemberFormProps {
  member: AdminProfile
}

export default function EditMemberForm({ member }: EditMemberFormProps) {
  const router = useRouter()
  const toast = useToast()
  const [displayName, setDisplayName] = useState(member.display_name ?? '')
  const [ownerNotes, setOwnerNotes] = useState(member.owner_notes ?? '')
  const [permissions, setPermissions] = useState<PermissionsMap>(member.permissions)
  const [saving, setSaving] = useState(false)
  const [removing, setRemoving] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/team/${member.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: displayName || null,
          owner_notes: ownerNotes || null,
          permissions,
        }),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) {
        toast.error(json.error || 'Save failed')
        return
      }
      toast.success('Saved')
      router.refresh()
    } catch {
      toast.error('Network error')
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!confirm(`Remove ${member.email} from the team? This deletes their login.`)) return
    setRemoving(true)
    try {
      const res = await fetch(`/api/admin/team/${member.id}`, { method: 'DELETE' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json.ok) {
        toast.error(json.error || 'Remove failed')
        return
      }
      toast.success('Member removed')
      router.push('/admin/team')
    } catch {
      toast.error('Network error')
    } finally {
      setRemoving(false)
    }
  }

  const inputCls =
    'w-full text-sm border border-zinc-300 rounded-md px-3 py-2 focus:outline-none focus:border-black bg-white'

  return (
    <form onSubmit={submit} className="bg-white border border-zinc-200 rounded-md p-6 max-w-xl space-y-5">
      <div className="text-sm">
        <p className="text-[11px] uppercase tracking-wider text-zinc-500 mb-1">Email</p>
        <p>{member.email}</p>
      </div>
      <div>
        <label className="block text-[11px] uppercase tracking-wider text-zinc-500 mb-1">
          Display name
        </label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
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
          className={inputCls}
        />
      </div>
      <div className="flex justify-between gap-2 pt-2 border-t border-zinc-100">
        <AdminButton variant="danger" type="button" onClick={remove} loading={removing}>
          Remove from team
        </AdminButton>
        <div className="flex gap-2">
          <AdminButton variant="ghost" type="button" onClick={() => router.push('/admin/team')}>
            Back
          </AdminButton>
          <AdminButton type="submit" loading={saving}>
            Save
          </AdminButton>
        </div>
      </div>
    </form>
  )
}
