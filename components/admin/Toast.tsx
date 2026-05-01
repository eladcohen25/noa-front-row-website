'use client'

import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react'

interface ToastItem {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
}

interface ToastContextValue {
  push: (toast: Omit<ToastItem, 'id'>) => void
  success: (message: string) => void
  error: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])

  const push = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    setItems((prev) => [...prev, { ...toast, id }])
    setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const success = useCallback((message: string) => push({ type: 'success', message }), [push])
  const error = useCallback((message: string) => push({ type: 'error', message }), [push])

  return (
    <ToastContext.Provider value={{ push, success, error }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        {items.map((t) => (
          <ToastItemView key={t.id} item={t} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItemView({ item }: { item: ToastItem }) {
  const [enter, setEnter] = useState(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => setEnter(true))
    return () => cancelAnimationFrame(id)
  }, [])
  const colors =
    item.type === 'success'
      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
      : item.type === 'error'
        ? 'bg-rose-50 border-rose-200 text-rose-900'
        : 'bg-zinc-50 border-zinc-200 text-zinc-900'
  return (
    <div
      className={`px-4 py-3 rounded-md border text-sm shadow-sm transition-all ${colors}`}
      style={{
        opacity: enter ? 1 : 0,
        transform: enter ? 'translateY(0)' : 'translateY(8px)',
      }}
    >
      {item.message}
    </div>
  )
}
