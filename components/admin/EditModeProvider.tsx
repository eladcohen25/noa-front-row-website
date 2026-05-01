'use client'

import { createContext, ReactNode, useCallback, useContext, useState } from 'react'

export type EditableType = 'text' | 'textarea' | 'richtext' | 'image' | 'url'

interface EditModeContextValue {
  isEditMode: boolean
  page: string
  pageLabel: string
  livePath: string
  staged: Record<string, string>
  stage: (key: string, value: string) => void
  unstage: (key: string) => void
  discardAll: () => void
  saveAll: () => Promise<{ ok: boolean; error?: string }>
  saving: boolean
}

const EditModeContext = createContext<EditModeContextValue | null>(null)

export function useEditMode() {
  return useContext(EditModeContext)
}

interface EditModeProviderProps {
  isEditMode: boolean
  page: string
  pageLabel: string
  livePath: string
  initial?: Record<string, string>
  children: ReactNode
}

export function EditModeProvider({
  isEditMode,
  page,
  pageLabel,
  livePath,
  initial,
  children,
}: EditModeProviderProps) {
  const [staged, setStaged] = useState<Record<string, string>>(initial ?? {})
  const [saving, setSaving] = useState(false)

  const stage = useCallback((key: string, value: string) => {
    setStaged((prev) => ({ ...prev, [key]: value }))
  }, [])

  const unstage = useCallback((key: string) => {
    setStaged((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }, [])

  const discardAll = useCallback(() => {
    setStaged({})
  }, [])

  const saveAll = useCallback(async (): Promise<{ ok: boolean; error?: string }> => {
    if (Object.keys(staged).length === 0) return { ok: true }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/content/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page, values: staged }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json.ok) {
        return { ok: false, error: json.error || 'Save failed' }
      }
      setStaged({})
      return { ok: true }
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : 'Network error' }
    } finally {
      setSaving(false)
    }
  }, [page, staged])

  return (
    <EditModeContext.Provider
      value={{
        isEditMode,
        page,
        pageLabel,
        livePath,
        staged,
        stage,
        unstage,
        discardAll,
        saveAll,
        saving,
      }}
    >
      {children}
    </EditModeContext.Provider>
  )
}
