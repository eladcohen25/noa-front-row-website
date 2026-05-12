'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface EnterOverlayProps {
  onEnter: () => void
}

const ANIMATION_SRC = '/Front%20Row%20Animation.webm'
// Tail of the fade-out so the overlay finishes leaving after the webm ends.
const EXIT_DURATION_MS = 700
// How long to keep the overlay around if the video itself fails to play.
const FALLBACK_PLAY_MS = 1800

type Phase = 'idle' | 'playing' | 'exiting'

export default function EnterOverlay({ onEnter }: EnterOverlayProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [phase, setPhase] = useState<Phase>('idle')
  const videoRef = useRef<HTMLVideoElement>(null)
  // Guards against the onEnded handler firing twice (or after a manual fallback).
  const exitedRef = useRef(false)

  // Show once per session. The overlay is intentionally suppressed on
  // sub-pages reached via a redirect (e.g. /lookbook → /#lookbook) because
  // the parent layout only mounts it on the public site.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const hasEntered = sessionStorage.getItem('frontrow-entered')
    if (!hasEntered) {
      setIsVisible(true)
    }
  }, [])

  // Force the first frame to render so the overlay isn't a black void while
  // the user decides to click. Some browsers won't paint frame 0 until the
  // playhead is moved, so we nudge currentTime by a hair after metadata loads.
  useEffect(() => {
    if (!isVisible) return
    const video = videoRef.current
    if (!video) return

    const showFirstFrame = () => {
      try {
        video.pause()
        if (video.currentTime === 0) {
          video.currentTime = 0.001
        }
      } catch {
        /* Some browsers throw on currentTime before the seekable range exists. */
      }
    }

    if (video.readyState >= 1) {
      showFirstFrame()
    } else {
      video.addEventListener('loadedmetadata', showFirstFrame, { once: true })
      return () => video.removeEventListener('loadedmetadata', showFirstFrame)
    }
  }, [isVisible])

  const finishExit = useCallback(() => {
    if (exitedRef.current) return
    exitedRef.current = true
    setPhase('exiting')
    window.setTimeout(() => {
      setIsVisible(false)
      onEnter()
    }, EXIT_DURATION_MS)
  }, [onEnter])

  const handleEnter = useCallback(() => {
    sessionStorage.setItem('frontrow-entered', 'true')
    setPhase('playing')

    const video = videoRef.current
    if (!video) {
      finishExit()
      return
    }

    video.muted = true
    video.playsInline = true
    video.currentTime = 0
    const playPromise = video.play()

    if (playPromise && typeof playPromise.then === 'function') {
      playPromise.catch(() => {
        // Autoplay was rejected even after the click — bail to the landing
        // page after a short hold so the user isn't stuck on the overlay.
        window.setTimeout(finishExit, FALLBACK_PLAY_MS)
      })
    }
  }, [finishExit])

  if (!isVisible) return null

  return (
    <div
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center gap-8 md:gap-10 bg-black px-6 transition-opacity duration-700 ${
        phase === 'exiting' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
      aria-hidden={phase === 'exiting'}
    >
      {/* Contained webm so the wordmark sits centered on a black field rather
          than filling the viewport. object-contain preserves the artwork's
          aspect ratio at any breakpoint. */}
      <video
        ref={videoRef}
        src={ANIMATION_SRC}
        muted
        playsInline
        preload="auto"
        onEnded={finishExit}
        className="w-auto h-auto max-w-[min(82vw,900px)] max-h-[55vh] object-contain"
      />

      {/* CTA sits beneath the wordmark. Once the user clicks, it fades out
          and the webm is allowed to play uninterrupted. */}
      <button
        type="button"
        onClick={handleEnter}
        className={`px-10 py-4 rounded-full text-xs uppercase tracking-[0.3em] text-white border border-white/40 backdrop-blur-sm bg-black/20 hover:bg-white/10 active:scale-95 transition-all duration-500 ${
          phase === 'idle' ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-label="Enter The Front Row"
      >
        Enter
      </button>
    </div>
  )
}
