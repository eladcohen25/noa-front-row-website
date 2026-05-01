'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

interface HeroProps {
  headline?: string
  ctaLabel?: string
  ctaHref?: string
}

const DEFAULT_HEADLINE = 'Creative Direction & Experiential Production Studio'
const DEFAULT_CTA_LABEL = 'INQUIRE NOW'
const DEFAULT_CTA_HREF = '/inquire'

export default function Hero({ headline, ctaLabel, ctaHref }: HeroProps = {}) {
  const heroHeadline = headline?.trim() || DEFAULT_HEADLINE
  const heroCtaLabel = ctaLabel?.trim() || DEFAULT_CTA_LABEL
  const heroCtaHref = ctaHref?.trim() || DEFAULT_CTA_HREF
  const [subtitleVisible, setSubtitleVisible] = useState(false)
  const blurredVideoRef = useRef<HTMLVideoElement>(null)
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setSubtitleVisible(true)
    }, 200)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const touchQuery = window.matchMedia('(pointer: coarse)')
    setIsTouchDevice(touchQuery.matches)

    const handleTouchChange = (event: MediaQueryListEvent) => {
      setIsTouchDevice(event.matches)
    }

    touchQuery.addEventListener('change', handleTouchChange)
    return () => touchQuery.removeEventListener('change', handleTouchChange)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const isMobile = window.matchMedia('(max-width: 768px)').matches
    if (!isMobile) return

    const video = blurredVideoRef.current
    if (!video) return

    video.muted = true
    video.playsInline = true
    video.loop = true
    video.autoplay = true
    video.load()

    const playVideo = () => {
      video.play().catch(() => {
        setTimeout(() => {
          video.play().catch(() => {})
        }, 100)
      })
    }

    playVideo()

    const handleEnded = () => {
      video.currentTime = 0
      video.play().catch(() => {})
    }

    video.addEventListener('ended', handleEnded)

    return () => {
      video.removeEventListener('ended', handleEnded)
    }
  }, [isTouchDevice])

  return (
    <div
      className={`relative h-full w-full overflow-hidden ${isTouchDevice ? 'bg-white' : 'bg-black'}`}
      style={{ isolation: 'isolate' }}
    >
      <video
        ref={blurredVideoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          filter: isTouchDevice ? 'blur(3px)' : 'blur(7px)',
        }}
      >
        <source src="/home%20vid.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 flex flex-col items-center justify-end pointer-events-none">
        <div className="text-center space-y-8 pointer-events-auto pb-32 md:pb-32 px-6 md:px-12" style={isTouchDevice ? { paddingBottom: '15vh' } : undefined}>
          <h2
            className={`text-4xl md:text-6xl font-la-foonte uppercase tracking-wide ${
              isTouchDevice ? 'luxury-shimmer' : 'text-black'
            }`}
          >
            {heroHeadline}
          </h2>
          <Link
            href={heroCtaHref}
            className={`inline-block px-8 py-3 rounded-full text-xs uppercase tracking-wider hover:bg-black/10 ${
              isTouchDevice ? 'luxury-shimmer border border-black/30' : 'text-black border border-black/30'
            }`}
            style={{
              opacity: subtitleVisible ? 1 : 0,
              transform: subtitleVisible ? 'translateY(0)' : 'translateY(-8px)',
              transition: 'opacity 400ms ease-out, transform 400ms ease-out, background-color 200ms ease-out',
            }}
          >
            {heroCtaLabel}
          </Link>
        </div>
      </div>
    </div>
  )
}
