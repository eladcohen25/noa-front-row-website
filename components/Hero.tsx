'use client'

import { useEffect, useRef, useState } from 'react'

export default function Hero() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [spotlightPosition, setSpotlightPosition] = useState({ x: 0, y: 0 })
  const [showTypeform, setShowTypeform] = useState(false)
  const [subtitleVisible, setSubtitleVisible] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)
  const blurredVideoRef = useRef<HTMLVideoElement>(null)
  const sharpVideoRef = useRef<HTMLVideoElement>(null)
  const typeformContainerRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number>()
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  // Prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Subtitle fade-in
  useEffect(() => {
    const timer = setTimeout(() => {
      setSubtitleVisible(true)
    }, 200)
    return () => clearTimeout(timer)
  }, [])

  // Detect coarse pointer devices (mobile/tablet)
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

  // Mobile: ensure video autoplays quickly and loops properly
  useEffect(() => {
    if (typeof window === 'undefined') return
    const isMobile = window.matchMedia('(max-width: 768px)').matches
    if (!isMobile) return

    const video = blurredVideoRef.current
    if (!video) return

    // Ensure proper attributes for mobile autoplay
    video.muted = true
    video.playsInline = true
    video.loop = true
    video.autoplay = true

    // Force reload the video source for mobile
    video.load()

    // Force play on mobile
    const playVideo = () => {
      video.play().catch(() => {
        // Retry after a short delay
        setTimeout(() => {
          video.play().catch(() => {})
        }, 100)
      })
    }

    // Play immediately
    playVideo()

    // Also ensure it loops (some mobile browsers need this)
    const handleEnded = () => {
      video.currentTime = 0
      video.play().catch(() => {})
    }

    video.addEventListener('ended', handleEnded)

    return () => {
      video.removeEventListener('ended', handleEnded)
    }
  }, [isTouchDevice])

  // Load Typeform embed script when overlay opens
  useEffect(() => {
    if (!showTypeform) return
    const existing = document.querySelector('script[src*="embed.typeform.com"]')
    if (existing) {
      existing.remove()
    }
    const script = document.createElement('script')
    script.src = '//embed.typeform.com/next/embed.js'
    script.async = true
    document.body.appendChild(script)
    return () => {
      script.remove()
    }
  }, [showTypeform])

  // Mouse tracking
  useEffect(() => {
    if (prefersReducedMotion || isTouchDevice) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return
      const rect = heroRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      setMousePosition({ x, y })
    }

    const hero = heroRef.current
    if (hero) {
      hero.addEventListener('mousemove', handleMouseMove)
    }

    return () => {
      if (hero) {
        hero.removeEventListener('mousemove', handleMouseMove)
      }
    }
  }, [prefersReducedMotion, isTouchDevice])

  // Spotlight smoothing
  useEffect(() => {
    if (prefersReducedMotion || isTouchDevice) return

    const lerp = (start: number, end: number, factor: number) =>
      start + (end - start) * factor

    const updateSpotlight = () => {
      setSpotlightPosition((prev) => ({
        x: lerp(prev.x, mousePosition.x, 0.1),
        y: lerp(prev.y, mousePosition.y, 0.1),
      }))
      animationFrameRef.current = requestAnimationFrame(updateSpotlight)
    }

    animationFrameRef.current = requestAnimationFrame(updateSpotlight)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [mousePosition, prefersReducedMotion, isTouchDevice])

  return (
    <>
      <div
        ref={heroRef}
        className={`relative h-full w-full overflow-hidden ${isTouchDevice ? 'bg-white' : 'bg-black'}`}
        style={{ isolation: 'isolate' }}
      >
        {/* Blurred Video Background with native loop */}
        <video
          ref={blurredVideoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ 
            filter: isTouchDevice ? 'blur(5px)' : 'blur(12px)',
          }}
        >
          <source src="/home%20vid.mp4" type="video/mp4" />
        </video>

        {/* Sharp Video with Spotlight Mask with native loop */}
        {!prefersReducedMotion && !isTouchDevice && (
          <video
            ref={sharpVideoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            style={{
              maskImage: `radial-gradient(ellipse 350px 280px at ${spotlightPosition.x}px ${spotlightPosition.y}px, black 0%, transparent 70%)`,
              WebkitMaskImage: `radial-gradient(ellipse 350px 280px at ${spotlightPosition.x}px ${spotlightPosition.y}px, black 0%, transparent 70%)`,
            }}
          >
            <source src="/home%20vid.mp4" type="video/mp4" />
          </video>
        )}

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pointer-events-none">
          <div className="text-center space-y-8 pointer-events-auto pb-32 md:pb-32 px-6 md:px-12" style={isTouchDevice ? { paddingBottom: '15vh' } : undefined}>
            <h2
              className={`text-4xl md:text-6xl font-la-foonte uppercase tracking-wide ${
                isTouchDevice ? 'luxury-shimmer' : 'text-black'
              }`}
            >
              Creative Direction & Experiential Production Studio
            </h2>
            <button
              onClick={() => setShowTypeform(true)}
              className={`px-8 py-3 rounded-full text-xs uppercase tracking-wider hover:bg-black/10 ${
                isTouchDevice ? 'luxury-shimmer border border-black/30' : 'text-black border border-black/30'
              }`}
              style={{
                opacity: subtitleVisible ? 1 : 0,
                transform: subtitleVisible ? 'translateY(0)' : 'translateY(-8px)',
                transition: 'opacity 400ms ease-out, transform 400ms ease-out, background-color 200ms ease-out',
              }}
            >
              INQUIRE NOW
            </button>
          </div>
        </div>
      </div>

      {showTypeform && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowTypeform(false)
          }}
        >
          <div className="relative w-full max-w-2xl h-[80vh] mx-4 bg-white rounded-xl overflow-hidden">
            <button
              onClick={() => setShowTypeform(false)}
              className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 transition-colors text-black text-lg"
            >
              &times;
            </button>
            <div
              ref={typeformContainerRef}
              data-tf-live="01KPSE3BVSAEQ08G6TCMAD26T2"
              className="w-full h-full"
            />
          </div>
        </div>
      )}
    </>
  )
}