'use client'

import { usePathname, useRouter } from 'next/navigation'
import { ReactNode, useEffect, useState, useRef, useCallback } from 'react'
import LeftNav from '@/components/LeftNav'
import PageTransition from '@/components/PageTransition'
import LogoHeader from '@/components/LogoHeader'
import LoadingScreen from '@/components/LoadingScreen'
import MobileEnterOverlay from '@/components/MobileEnterOverlay'
import CustomCursor from '@/components/CustomCursor'

export default function RootLayoutClient({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const isHome = pathname === '/'
  const isInquire = pathname === '/inquire'
  const isAdmin = pathname?.startsWith('/admin') ?? false
  const hideSiteChrome = isInquire || isAdmin
  const [isMobileDevice, setIsMobileDevice] = useState(false) // Track if mobile device
  const [isLoading, setIsLoading] = useState(true) // Start with loading true for initial load
  const [pageBlur, setPageBlur] = useState(0) // Blur value controlled around loader end
  const [mobileEntered, setMobileEntered] = useState(false) // Track if user has entered on mobile
  const prevPathnameRef = useRef(pathname) // For debugging route changes
  const pendingNavigationRef = useRef<string | null>(null) // Store pending navigation
  const loaderKeyRef = useRef(0) // Stable key for loader (increments only on new navigation)
  const isInitialMount = useRef(true)
  const isInitialLoadRef = useRef(true) // Track if this is the very first load
  const isLoadingRef = useRef(false) // Prevent double loading
  const blurTimeoutRef = useRef<number | null>(null) // Timeout for blur clear timing

  // Detect mobile device on mount and skip initial loader on mobile
  useEffect(() => {
    if (typeof window === 'undefined') return
    const isMobile = window.matchMedia('(pointer: coarse)').matches
    setIsMobileDevice(isMobile)
    
    // On mobile, skip the initial loader (Enter overlay handles the intro)
    if (isMobile && isInitialLoadRef.current) {
      console.log('📱 Mobile: Skipping initial loader, Enter overlay will handle intro')
      setIsLoading(false)
      isLoadingRef.current = false
    }
    
    isInitialLoadRef.current = false
  }, [])

  // Intercept navigation clicks (public site only — admin uses native routing)
  useEffect(() => {
    if (isAdmin) return

    // Track if we've already handled a navigation to prevent double-firing
    let navigationHandled = false

    const handleLinkClick = (e: MouseEvent) => {
      // Skip if already loading
      if (isLoadingRef.current) {
        e.preventDefault()
        e.stopPropagation()
        return
      }
      
      // Skip if navigation was already handled (prevents double-firing)
      if (navigationHandled) {
        e.preventDefault()
        e.stopPropagation()
        return
      }

      const target = e.target as HTMLElement
      const link = target.closest('a[href]') as HTMLAnchorElement
      
      if (link && link.href) {
        const url = new URL(link.href)
        const path = url.pathname
        
        // Only intercept internal navigation to different page (same origin only)
        const isInternalLink = url.origin === window.location.origin
        if (isInternalLink && path !== pathname && path.startsWith('/')) {
          e.preventDefault()
          e.stopPropagation()
          
          // Mark navigation as handled to prevent double-firing
          navigationHandled = true
          setTimeout(() => { navigationHandled = false }, 100)
          
          // Check if mobile
          const isMobile = window.matchMedia('(pointer: coarse)').matches
          
          console.log(isMobile ? '📱 Mobile navigation:' : '🖥️ Desktop navigation:', pathname, '→', path)
          
          // Increment loader key for new navigation
          loaderKeyRef.current += 1
          
          // Start loader immediately
          isLoadingRef.current = true
          setIsLoading(true)
          setPageBlur(0)
          
          // Both mobile and desktop: Store for delayed navigation at 50%
          // This ensures the loader stays fully on screen before the page changes
          pendingNavigationRef.current = path
          console.log(isMobile ? '📱 Mobile:' : '🖥️ Desktop:', 'navigation stored for 50% callback')
        }
      }
    }

    document.addEventListener('click', handleLinkClick, true)
    return () => {
      document.removeEventListener('click', handleLinkClick, true)
    }
  }, [pathname, router, isAdmin])

  useEffect(() => {
    // Skip the initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false
      console.log('🏁 Initial mount completed')
      return
    }

    // Handle route change when navigation executes at 50%
    // This happens after we call router.push in handleFiftyPercent
    if (pathname !== prevPathnameRef.current) {
      console.log('🔀 Route changed:', prevPathnameRef.current, '→', pathname, 'isLoading:', isLoadingRef.current)
      prevPathnameRef.current = pathname
      // NEVER restart loader on pathname change - only the click handler should start it
    }
  }, [pathname])

  const handleFiftyPercent = useCallback(() => {
    console.log('✅ 50% - Heart filled screen, swapping to new page')
    
    // Execute pending navigation (heart has filled screen, now swap content)
    if (pendingNavigationRef.current) {
      router.push(pendingNavigationRef.current)
      pendingNavigationRef.current = null
    }
    
    // Ensure blur is reset when new page first appears
    setPageBlur(0)
  }, [router])

  const handleScaleDownStart = useCallback(() => {
    console.log('✅ 54.5% - Heart scaling down, starting blur effect')
    // Start blur when scale-down begins
    setPageBlur(8)

    // Clear any previous timer
    if (blurTimeoutRef.current !== null) {
      window.clearTimeout(blurTimeoutRef.current)
    }

    // Schedule blur to end slightly before the loader completes
    // Scale-down: 1800ms → 3300ms (1500ms total)
    // We start unblurring at 2700ms so a 500ms transition finishes at ~3200ms (< 3300ms)
    blurTimeoutRef.current = window.setTimeout(() => {
      console.log('✨ Pre-clearing blur before loader completes')
      setPageBlur(0)
      blurTimeoutRef.current = null
    }, 900)
  }, [])

  const handleLoadingComplete = useCallback(() => {
    console.log('✅ Loading animation complete')
    setIsLoading(false)
    isLoadingRef.current = false // Allow next navigation
    // At this point blur should already be at 0 from handleScaleDownStart timer
  }, [])

  // Handler for when user taps "Enter" on mobile overlay
  const handleMobileEnter = useCallback(() => {
    setMobileEntered(true)
    
    // Trigger video playback for all videos on the page
    // This ensures videos start playing after user interaction (required by iOS)
    const videos = document.querySelectorAll('video')
    videos.forEach((video) => {
      video.muted = true
      video.play().catch(() => {
        // Autoplay blocked, fail silently
      })
    })
  }, [])

  // Admin uses its own layout chrome (AdminNav). Skip the public site's
  // LeftNav, LogoHeader, mobile enter overlay, custom cursor, and loader.
  // The .admin-area class triggers a CSS counter-rule in globals.css that
  // overrides the global `cursor: none !important` from the public custom
  // cursor.
  if (isAdmin) {
    return <div className="admin-area min-h-screen bg-zinc-50">{children}</div>
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Custom cursor - hidden on mobile and respects reduced-motion */}
      <CustomCursor />

      {/* Mobile Enter Overlay - only shows on mobile, first visit */}
      {!hideSiteChrome && <MobileEnterOverlay onEnter={handleMobileEnter} />}

      {/* Loader overlay - always sits above current content */}
      {isLoading && (
        <LoadingScreen
          key={`loader-${loaderKeyRef.current}`}
          onComplete={handleLoadingComplete}
          onFiftyPercent={handleFiftyPercent}
          onScaleDownStart={handleScaleDownStart}
        />
      )}

      {/* Single content tree - stays mounted; blur only applied after 50% on NEW page */}
      <div
        style={{
          opacity: 1,
          ...(pageBlur > 0 ? { filter: `blur(${pageBlur}px)` } : {}),
          pointerEvents: isLoading ? 'none' : 'auto',
          transition: 'filter 500ms cubic-bezier(0.25, 0.1, 0.25, 1)',
        }}
      >
        {/* Navigation - hidden on /inquire for full-bleed form */}
        {!hideSiteChrome && <LeftNav />}

        {/* Main content */}
        <main className={isHome ? 'fixed inset-0' : hideSiteChrome ? '' : 'ml-0 md:ml-64'}>
          {/* Logo header - hidden on /inquire */}
          {!hideSiteChrome && <LogoHeader />}
          <div>{children}</div>
        </main>
      </div>
    </div>
  )
}

