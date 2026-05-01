'use client'

import {
  ALL_PERMISSIONS,
  PERMISSION_LABELS,
  type Permission,
  type PermissionsMap,
} from '@/lib/admin/permissionTypes'

interface PermissionsPickerProps {
  value: PermissionsMap
  onChange: (next: PermissionsMap) => void
  disabled?: boolean
}

export default function PermissionsPicker({ value, onChange, disabled }: PermissionsPickerProps) {
  const toggle = (perm: Permission) => {
    onChange({ ...value, [perm]: !value[perm] })
  }
  return (
    <div className="space-y-2">
      {ALL_PERMISSIONS.map((perm) => (
        <label key={perm} className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={!!value[perm]}
            onChange={() => toggle(perm)}
            disabled={disabled}
            className="mt-0.5"
          />
          <span className="text-sm">
            <span className="font-medium block">{PERMISSION_LABELS[perm]}</span>
            <span className="text-xs text-zinc-500 font-mono">{perm}</span>
          </span>
        </label>
      ))}
    </div>
  )
}
