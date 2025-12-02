'use client'

import { useEffect, useRef } from 'react'

interface KlaviyoSignupOverlayProps {
  isOpen: boolean
  onClose: () => void
}

export default function KlaviyoSignupOverlay({ isOpen, onClose }: KlaviyoSignupOverlayProps) {
  const lastOpenTime = useRef(0)
  
  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') return
    
    // Prevent duplicate triggers within 500ms
    const now = Date.now()
    if (now - lastOpenTime.current < 500) return
    lastOpenTime.current = now

    const win = window as any
    
    const openForm = () => {
      // Try _klOnsite first (standard method)
      if (win._klOnsite) {
        win._klOnsite.push(['openForm', 'RpnBYt'])
        return true
      }
      
      // Try klaviyo object (alternative method)
      if (win.klaviyo) {
        win.klaviyo.push(['openForm', 'RpnBYt'])
        return true
      }
      
      return false
    }

    // Try immediately
    if (openForm()) {
      // Reset state after a delay so button can be clicked again
      setTimeout(onClose, 300)
      return
    }

    // Retry mechanism for when Klaviyo hasn't loaded yet
    let attempts = 0
    const maxAttempts = 15
    let timeoutId: NodeJS.Timeout
    
    const tryOpen = () => {
      attempts++
      if (openForm()) {
        setTimeout(onClose, 300)
        return
      }
      
      if (attempts < maxAttempts) {
        timeoutId = setTimeout(tryOpen, 150)
      } else {
        onClose()
      }
    }
    
    timeoutId = setTimeout(tryOpen, 150)
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [isOpen, onClose])

  return null
}



