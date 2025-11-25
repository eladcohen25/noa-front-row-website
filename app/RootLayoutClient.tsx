'use client'

import { usePathname, useRouter } from 'next/navigation'
import { ReactNode, useEffect, useState, useRef, useCallback } from 'react'
import LeftNav from '@/components/LeftNav'
import PageTransition from '@/components/PageTransition'
import LogoHeader from '@/components/LogoHeader'
import LoadingScreen from '@/components/LoadingScreen'

export default function RootLayoutClient({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const isHome = pathname === '/'
  const [isLoading, setIsLoading] = useState(true) // Start with loading true for initial load
  const [pageBlur, setPageBlur] = useState(0) // Blur value controlled around loader end
  const prevPathnameRef = useRef(pathname) // For debugging route changes
  const pendingNavigationRef = useRef<string | null>(null) // Store pending navigation
  const loaderKeyRef = useRef(0) // Stable key for loader (increments only on new navigation)
  const isInitialMount = useRef(true)
  const isLoadingRef = useRef(false) // Prevent double loading
  const blurTimeoutRef = useRef<number | null>(null) // Timeout for blur clear timing

  // Intercept navigation clicks
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a[href]') as HTMLAnchorElement
      
      if (link && link.href) {
        const url = new URL(link.href)
        const path = url.pathname
        
        // Only intercept internal navigation
        if (path !== pathname && path.startsWith('/') && !isLoadingRef.current) {
          e.preventDefault()
          e.stopPropagation()
          
          console.log('🔗 Navigation intercepted:', pathname, '→', path)
          // Store pending navigation
          pendingNavigationRef.current = path
          
          // Increment loader key for new navigation (prevents remount on pathname change)
          loaderKeyRef.current += 1
          
          // Start loader immediately (current page stays visible under loader)
          isLoadingRef.current = true
          setIsLoading(true)
          setPageBlur(0) // Reset blur
          
          console.log('🎬 Loader started - old page should stay visible')
        }
      }
    }

    document.addEventListener('click', handleLinkClick, true)
    return () => document.removeEventListener('click', handleLinkClick, true)
  }, [pathname, children])

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
      // If we're already loading, this is the expected navigation at 50%
      if (isLoadingRef.current) {
        console.log('🔀 Route changed during loader (expected at 50%):', prevPathnameRef.current, '→', pathname)
        prevPathnameRef.current = pathname
        // Don't restart loader, just update the pathname
      } else {
        // Unexpected route change (shouldn't happen with interception)
        console.log('⚠️ UNEXPECTED route change:', prevPathnameRef.current, '→', pathname)
        isLoadingRef.current = true
        setIsLoading(true)
        setPageBlur(0)
        prevPathnameRef.current = pathname
      }
    }
  }, [pathname, children, isLoading])

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

  return (
    <div className="min-h-screen bg-white">
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
          filter: `blur(${pageBlur}px)`,
          pointerEvents: isLoading ? 'none' : 'auto',
          transition: 'filter 500ms cubic-bezier(0.25, 0.1, 0.25, 1)',
        }}
      >
        <LeftNav />
        <main className={pathname === '/' ? 'fixed inset-0' : 'ml-64'}>
          {pathname !== '/' && <LogoHeader />}
          <div>{children}</div>
        </main>
      </div>
    </div>
  )
}

