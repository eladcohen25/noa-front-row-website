'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useFormOverlay } from '@/components/FormOverlayProvider'
import { scrollToSection } from '@/lib/scrollToSection'

interface HeroProps {
  headline?: string
  ctaLabel?: string
  ctaHref?: string
}

const DEFAULT_HEADLINE = 'Creative Direction & Experiential Production Studio'
const DEFAULT_CTA_LABEL = 'INQUIRE NOW'
const DEFAULT_CTA_HREF = '/inquire'

const HERO_VIDEO_SRC = '/Noa%20FInal%20hero%20site%20video.mov'

const HERO_NAV_ITEMS: ReadonlyArray<{ id: string; label: string }> = [
  { id: 'lookbook', label: 'Work' },
  { id: 'about', label: 'Studio' },
  { id: 'services', label: 'Services' },
  { id: 'models', label: 'Collaborate' },
]


export default function Hero({ headline, ctaLabel, ctaHref }: HeroProps = {}) {
  const heroHeadline = headline?.trim() || DEFAULT_HEADLINE
  const heroCtaLabel = ctaLabel?.trim() || DEFAULT_CTA_LABEL
  const heroCtaHref = ctaHref?.trim() || DEFAULT_CTA_HREF
  const [subtitleVisible, setSubtitleVisible] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const { openInquiry } = useFormOverlay()

  useEffect(() => {
    const timer = setTimeout(() => setSubtitleVisible(true), 200)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const touchQuery = window.matchMedia('(pointer: coarse)')
    const update = () => setIsTouchDevice(touchQuery.matches)
    update()
    touchQuery.addEventListener('change', update)
    return () => touchQuery.removeEventListener('change', update)
  }, [])

  // iOS sometimes blocks autoplay; gently retry once the video element exists.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = true
    video.playsInline = true
    const playVideo = () => {
      video.play().catch(() => {
        setTimeout(() => {
          video.play().catch(() => {})
        }, 250)
      })
    }
    playVideo()
  }, [isTouchDevice])

  // If the CMS points the CTA at a non-inquire URL we honor the link; otherwise
  // the button opens the inquiry form overlay in place.
  const ctaTargetsInquiry = heroCtaHref === '/inquire' || heroCtaHref === '#inquire'

  const handleCtaClick = (event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    if (!ctaTargetsInquiry) return
    event.preventDefault()
    openInquiry()
  }

  const handleNavClick = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault()
    // Tell the Work section to drop back to its card grid if the user clicks
    // "Work" from the hero while a case study happens to be open.
    if (id === 'lookbook' && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tfr:work-reset'))
    }
    scrollToSection(id)
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black" style={{ isolation: 'isolate' }}>
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={HERO_VIDEO_SRC} type="video/mp4" />
      </video>

      <div className="absolute inset-0 flex flex-col items-center justify-end pointer-events-none">
        <div
          className="text-center space-y-6 md:space-y-8 pointer-events-auto pb-24 md:pb-32 px-6 md:px-12"
          style={isTouchDevice ? { paddingBottom: '15vh' } : undefined}
        >
          <h2 className="text-4xl md:text-6xl font-la-foonte uppercase tracking-wide text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.35)]">
            {heroHeadline}
          </h2>

          {/* Inline primary nav. When the user scrolls past the hero it is
              replaced by the compact top-left nav rendered by <LeftNav />. */}
          <nav
            aria-label="Primary"
            className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 md:gap-x-8"
            style={{
              opacity: subtitleVisible ? 1 : 0,
              transform: subtitleVisible ? 'translateY(0)' : 'translateY(-6px)',
              transition: 'opacity 420ms ease-out, transform 420ms ease-out',
            }}
          >
            {HERO_NAV_ITEMS.map((item, index) => (
              <span key={item.id} className="flex items-center gap-x-5 md:gap-x-8">
                {index > 0 && (
                  <span aria-hidden className="hidden md:inline-block h-3 w-px bg-white/40" />
                )}
                <a
                  href={`/#${item.id}`}
                  onClick={(event) => handleNavClick(event, item.id)}
                  className="text-xs md:text-sm uppercase tracking-[0.3em] font-semibold text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.45)] hover:opacity-80 transition-opacity"
                >
                  {item.label}
                </a>
              </span>
            ))}
          </nav>

          {ctaTargetsInquiry ? (
            <button
              type="button"
              onClick={handleCtaClick}
              className="inline-block px-8 py-3 rounded-full text-xs uppercase tracking-wider text-white border border-white/40 hover:bg-white/10 transition-colors"
              style={{
                opacity: subtitleVisible ? 1 : 0,
                transform: subtitleVisible ? 'translateY(0)' : 'translateY(-8px)',
                transition:
                  'opacity 400ms ease-out, transform 400ms ease-out, background-color 200ms ease-out',
              }}
            >
              {heroCtaLabel}
            </button>
          ) : (
            <Link
              href={heroCtaHref}
              className="inline-block px-8 py-3 rounded-full text-xs uppercase tracking-wider text-white border border-white/40 hover:bg-white/10 transition-colors"
              style={{
                opacity: subtitleVisible ? 1 : 0,
                transform: subtitleVisible ? 'translateY(0)' : 'translateY(-8px)',
                transition:
                  'opacity 400ms ease-out, transform 400ms ease-out, background-color 200ms ease-out',
              }}
            >
              {heroCtaLabel}
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
