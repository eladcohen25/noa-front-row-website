'use client'

import { useEffect, useState } from 'react'

interface MobileEnterOverlayProps {
  onEnter: () => void
}

export default function MobileEnterOverlay({ onEnter }: MobileEnterOverlayProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  // Detect mobile on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mobileQuery = window.matchMedia('(pointer: coarse)')
    const isMobileDevice = mobileQuery.matches
    setIsMobile(isMobileDevice)
    
    // Only show overlay on mobile
    if (isMobileDevice) {
      // Check if user has already entered this session
      const hasEntered = sessionStorage.getItem('frontrow-entered')
      if (!hasEntered) {
        setIsVisible(true)
      }
    }
  }, [])

  const handleEnter = () => {
    // Start exit animation
    setIsExiting(true)
    
    // Mark as entered for this session
    sessionStorage.setItem('frontrow-entered', 'true')
    
    // Wait for animation to complete, then hide and trigger callback
    setTimeout(() => {
      setIsVisible(false)
      onEnter()
    }, 500)
  }

  // Don't render on desktop or if not visible
  if (!isMobile || !isVisible) return null

  return (
    <div
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center bg-white transition-opacity duration-500 ${
        isExiting ? 'opacity-0' : 'opacity-100'
      }`}
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {/* Logo video */}
      <div className="mb-12">
        <video
          src="/Noa%203-D%20logo.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-32 h-32 object-contain"
        />
      </div>

      {/* Brand name */}
      <h1 className="font-la-foonte text-2xl tracking-tight text-black mb-16">
        THE FRONT ROW
      </h1>

      {/* Enter button */}
      <button
        onClick={handleEnter}
        className="px-10 py-4 border border-black/20 rounded-full text-xs uppercase tracking-[0.3em] text-black/80 transition-all duration-300 hover:bg-black/5 active:scale-95"
      >
        Enter
      </button>

      {/* Subtle tagline */}
      <p className="absolute bottom-12 text-[10px] uppercase tracking-[0.2em] text-black/40 safe-bottom">
        Jan. 2026 · Las Vegas
      </p>
    </div>
  )
}

