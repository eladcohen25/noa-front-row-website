'use client'

import { useEffect, useRef, useState } from 'react'
import KlaviyoSignupOverlay from './KlaviyoSignupOverlay'

export default function Hero() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [spotlightPosition, setSpotlightPosition] = useState({ x: 0, y: 0 })
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [subtitleVisible, setSubtitleVisible] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)
  const blurredVideoRef = useRef<HTMLVideoElement>(null)
  const sharpVideoRef = useRef<HTMLVideoElement>(null)
  const animationFrameRef = useRef<number>()
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

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

  // No JS-based looping; rely on native loop for maximum stability

  // Mouse tracking
  useEffect(() => {
    if (prefersReducedMotion) return

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
  }, [prefersReducedMotion])

  // Spotlight smoothing
  useEffect(() => {
    if (prefersReducedMotion) return

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
  }, [mousePosition, prefersReducedMotion])

  return (
    <>
      <div
        ref={heroRef}
        className="relative h-full w-full overflow-hidden bg-black"
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
          style={{ filter: 'blur(12px)' }}
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>

        {/* Sharp Video with Spotlight Mask with native loop */}
        {!prefersReducedMotion && (
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
            <source src="/hero-video.mp4" type="video/mp4" />
          </video>
        )}

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-32 pointer-events-none">
          <div className="text-center space-y-8 pointer-events-auto">
            <h2 className="text-4xl md:text-6xl font-la-foonte text-white mix-blend-difference uppercase tracking-wide">
              Jan. 2026, Las Vegas
            </h2>
            <button
              onClick={() => setIsFormOpen(true)}
              className="px-8 py-3 border border-white/30 rounded-full text-xs uppercase tracking-wider text-white mix-blend-difference hover:bg-white/10"
              style={{
                opacity: subtitleVisible ? 1 : 0,
                transform: subtitleVisible ? 'translateY(0)' : 'translateY(-8px)',
                transition: 'opacity 400ms ease-out, transform 400ms ease-out',
              }}
            >
              TAP FOR EARLY ACCESS
            </button>
          </div>
        </div>
      </div>

      <KlaviyoSignupOverlay
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
    </>
  )
}