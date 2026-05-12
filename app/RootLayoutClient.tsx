'use client'

import { usePathname } from 'next/navigation'
import { ReactNode, useCallback } from 'react'
import LeftNav from '@/components/LeftNav'
import LogoHeader from '@/components/LogoHeader'
import EnterOverlay from '@/components/EnterOverlay'
import CustomCursor from '@/components/CustomCursor'
import FormOverlayProvider, { useFormOverlay } from '@/components/FormOverlayProvider'

export default function RootLayoutClient({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isInquire = pathname === '/inquire'
  const isAdmin = pathname?.startsWith('/admin') ?? false
  const hideSiteChrome = isInquire || isAdmin

  // After the enter overlay is dismissed, nudge all videos so iOS / strict
  // autoplay browsers honor the user's first interaction and start playback.
  const handleEnter = useCallback(() => {
    const videos = document.querySelectorAll('video')
    videos.forEach((video) => {
      video.muted = true
      video.play().catch(() => {
        /* Autoplay still blocked — ignore. */
      })
    })
  }, [])

  if (isAdmin) {
    return <div className="admin-area min-h-screen bg-zinc-50">{children}</div>
  }

  return (
    <FormOverlayProvider>
      <div className="min-h-screen bg-white">
        <CustomCursor />

        {!hideSiteChrome && <EnterOverlay onEnter={handleEnter} />}

        {!hideSiteChrome && (
          <ChromeWhenIdle>
            <LeftNav />
            <LogoHeader />
          </ChromeWhenIdle>
        )}

        <main>{children}</main>
      </div>
    </FormOverlayProvider>
  )
}

// Hide the floating nav/header while a fullscreen form overlay is mounted, so
// the form gets a clean, full-bleed canvas.
function ChromeWhenIdle({ children }: { children: ReactNode }) {
  const { active } = useFormOverlay()
  if (active) return null
  return <>{children}</>
}
