'use client'

import { useEffect } from 'react'

interface KlaviyoSignupOverlayProps {
  isOpen: boolean
  onClose: () => void
}

export default function KlaviyoSignupOverlay({ isOpen, onClose }: KlaviyoSignupOverlayProps) {
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined' && (window as any)._klOnsite) {
      // Close any existing Klaviyo forms first
      (window as any)._klOnsite.push(['closeForm', 'RpnBYt'])
      
      // Wait a moment, then open the form
      setTimeout(() => {
        (window as any)._klOnsite.push(['openForm', 'RpnBYt'])
      }, 50)
      
      // Reset the state so it can be triggered again
      setTimeout(() => {
        onClose()
      }, 150)
    }
  }, [isOpen, onClose])

  // This component no longer renders anything - it just triggers Klaviyo
  return null
}



