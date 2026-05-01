'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { useToast } from './Toast'
import { PERMISSION_LABELS, type Permission } from '@/lib/admin/permissionTypes'

export default function DeniedToast() {
  const router = useRouter()
  const params = useSearchParams()
  const toast = useToast()
  const denied = params.get('denied')

  useEffect(() => {
    if (!denied) return
    const label = PERMISSION_LABELS[denied as Permission] ?? denied
    toast.error(`You don't have access to that page (needs: ${label}).`)
    const next = new URLSearchParams(params.toString())
    next.delete('denied')
    const qs = next.toString()
    router.replace('/admin' + (qs ? `?${qs}` : ''))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [denied])

  return null
}
