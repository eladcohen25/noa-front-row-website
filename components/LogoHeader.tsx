'use client'

import { useEffect, useState, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

export default function LogoHeader() {
  const pathname = usePathname()
  const isHome = pathname === '/'
  // On home page, start with text visible and logo hidden
  // On other pages, start with logo visible
  const [showLogo, setShowLogo] = useState(!isHome)
  const [showText, setShowText] = useState(isHome)
  const [isMobile, setIsMobile] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Detect mobile
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mobileQuery = window.matchMedia('(max-width: 768px)')
    setIsMobile(mobileQuery.matches)

    const handleChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches)
    }

    mobileQuery.addEventListener('change', handleChange)
    return () => mobileQuery.removeEventListener('change', handleChange)
  }, [])

  // Ensure video autoplay on mobile
  useEffect(() => {
    if (isMobile && videoRef.current) {
      videoRef.current.muted = true
      videoRef.current.playsInline = true
      videoRef.current.play().catch(() => {
        // Autoplay blocked, fail silently
      })
    }
  }, [isMobile, showLogo])

  useEffect(() => {
    // Non-home pages: always show 3D logo
    if (!isHome) {
      setShowLogo(true)
      setShowText(false)
      return
    }

    // Home page on mobile: show "THE FRONT ROW" text only
    if (isMobile && isHome) {
      setShowLogo(false)
      setShowText(true)
      return
    }

    // Home page on desktop: show text initially, logo on scroll
    // Set initial state based on current scroll position
    const updateVisibility = () => {
      const threshold = 100
      if (window.scrollY > threshold) {
        setShowLogo(true)
        setShowText(false)
      } else {
        setShowLogo(false)
        setShowText(true)
      }
    }

    // Set initial state
    updateVisibility()

    window.addEventListener('scroll', updateVisibility)
    return () => window.removeEventListener('scroll', updateVisibility)
  }, [isHome, isMobile])

  // On desktop non-home pages, offset to center over content area (accounting for 256px left nav)
  const desktopOffset = !isMobile && !isHome ? 'left-[calc(50%+128px)]' : 'left-1/2'
  
  return (
    <div className={`fixed z-40 pointer-events-none -translate-x-1/2 ${desktopOffset} ${isMobile ? 'top-5 safe-top' : 'top-8'}`}>
      <div className="relative flex items-center justify-center">
        {showText && (
          <h1 className={`font-la-foonte font-normal tracking-tight whitespace-nowrap transition-opacity duration-300 text-black ${isMobile ? 'text-base' : 'text-xl'}`}>
            THE FRONT ROW
          </h1>
        )}
        {showLogo && (
          <Link href="/" className="pointer-events-auto cursor-pointer">
            <video
              ref={videoRef}
              src="/Noa%203-D%20logo.mp4"
              autoPlay
              loop
              muted
              playsInline
              className={`object-contain transition-opacity duration-300 ${isMobile ? 'w-16 h-16' : 'w-24 h-24'}`}
            />
          </Link>
        )}
      </div>
    </div>
  )
}

