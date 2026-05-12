'use client'

import dynamic from 'next/dynamic'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { InquirerType } from '@/lib/inquiry/types'

const InquiryForm = dynamic(() => import('@/components/inquiry/InquiryForm'), {
  ssr: false,
  loading: () => (
    <div className="min-h-[100dvh] flex items-center justify-center text-sm text-black/40">
      Loading…
    </div>
  ),
})

const ModelForm = dynamic(() => import('@/components/models/ModelForm'), {
  ssr: false,
  loading: () => (
    <div className="min-h-[100dvh] flex items-center justify-center text-sm text-black/40">
      Loading…
    </div>
  ),
})

type FormKey = 'inquiry' | 'casting' | null

export interface OpenInquiryOptions {
  /** Skip the type-selector step and start directly inside this branch. */
  presetInquirerType?: InquirerType
  /** Limit the type-selector step to this subset of options. */
  restrictTypes?: InquirerType[]
}

interface FormOverlayContextValue {
  openInquiry: (options?: OpenInquiryOptions) => void
  openCasting: () => void
  close: () => void
  active: FormKey
}

const FormOverlayContext = createContext<FormOverlayContextValue | null>(null)

export function useFormOverlay(): FormOverlayContextValue {
  const ctx = useContext(FormOverlayContext)
  if (!ctx) {
    // Allow components to call this safely even when the provider is absent
    // (e.g. the inquire route renders the form directly).
    return {
      openInquiry: () => {},
      openCasting: () => {},
      close: () => {},
      active: null,
    }
  }
  return ctx
}

export default function FormOverlayProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<FormKey>(null)
  // Per-open inquiry config — preset and/or restricted types are remembered
  // for the lifetime of the overlay and reset on close.
  const [inquiryOptions, setInquiryOptions] = useState<OpenInquiryOptions>({})

  const openInquiry = useCallback((options?: OpenInquiryOptions) => {
    setInquiryOptions(options ?? {})
    setActive('inquiry')
  }, [])
  const openCasting = useCallback(() => setActive('casting'), [])
  const close = useCallback(() => {
    setActive(null)
    setInquiryOptions({})
  }, [])

  // Lock body scroll + handle Escape key when the overlay is open.
  useEffect(() => {
    if (!active) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    window.addEventListener('keydown', handleKey)

    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', handleKey)
    }
  }, [active, close])

  const value = useMemo<FormOverlayContextValue>(
    () => ({ openInquiry, openCasting, close, active }),
    [openInquiry, openCasting, close, active]
  )

  return (
    <FormOverlayContext.Provider value={value}>
      {children}
      {active && (
        <div
          className="fixed inset-0 z-[300] bg-white overflow-y-auto tfr-overlay-enter"
          role="dialog"
          aria-modal="true"
        >
          {active === 'inquiry' && (
            <InquiryForm
              onExit={close}
              presetInquirerType={inquiryOptions.presetInquirerType}
              restrictTypes={inquiryOptions.restrictTypes}
            />
          )}
          {active === 'casting' && <ModelForm onExit={close} />}
        </div>
      )}
    </FormOverlayContext.Provider>
  )
}
