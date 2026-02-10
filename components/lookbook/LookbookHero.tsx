'use client'

import { useRef, useState, useEffect } from 'react'

interface LookbookHeroProps {
  label: string
  title: string
  videoSrc: string
  posterSrc: string
  ctaText: string
}

export default function LookbookHero({ label, title, videoSrc, posterSrc, ctaText }: LookbookHeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [isInView, setIsInView] = useState(false)

  // Intersection Observer for lazy loading
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting)
      },
      { threshold: 0.25 }
    )

    observer.observe(video)
    return () => observer.disconnect()
  }, [])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      video.play()
      setIsPlaying(true)
    } else {
      video.pause()
      setIsPlaying(false)
    }
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    video.muted = !video.muted
    setIsMuted(video.muted)
  }

  const handleWatchFilm = async () => {
    const video = videoRef.current
    if (!video) return

    video.scrollIntoView({ behavior: 'smooth', block: 'center' })
    video.muted = false
    setIsMuted(false)

    // Try to enter fullscreen for the video
    const anyVideo = video as HTMLVideoElement & {
      webkitEnterFullscreen?: () => void
      webkitRequestFullscreen?: () => Promise<void>
      msRequestFullscreen?: () => Promise<void>
    }
    try {
      if (video.requestFullscreen) {
        await video.requestFullscreen()
      } else if (anyVideo.webkitEnterFullscreen) {
        anyVideo.webkitEnterFullscreen()
      } else if (anyVideo.webkitRequestFullscreen) {
        await anyVideo.webkitRequestFullscreen()
      } else if (anyVideo.msRequestFullscreen) {
        await anyVideo.msRequestFullscreen()
      }
    } catch {
      // Ignore fullscreen errors and continue playback
    }

    setTimeout(() => {
      video.play()
      setIsPlaying(true)
    }, 150)
  }

  return (
    <section className="bg-white text-black py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <p className="text-xs tracking-widest uppercase text-gray-500 mb-4">
            {label}
          </p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-la-foonte uppercase tracking-wide">
            {title}
          </h1>
        </div>

        {/* Video Container */}
        <div className="relative max-w-5xl mx-auto">
          <div className="relative aspect-video bg-gray-900">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              preload="auto"
              playsInline
              muted={isMuted}
              loop
              onLoadedData={() => {
                const video = videoRef.current
                if (!video) return
                // Ensure the first frame is visible as the poster
                video.currentTime = 0
                video.pause()
              }}
            >
              {isInView && <source src={videoSrc} type="video/mp4" />}
            </video>

            {/* Video Controls */}
            <div className="absolute bottom-4 left-4 flex gap-2">
              <button
                onClick={togglePlay}
                className="w-10 h-10 bg-black/80 hover:bg-black flex items-center justify-center transition-colors"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <svg className="w-4 h-4" fill="white" viewBox="0 0 24 24">
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="white" viewBox="0 0 24 24">
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                )}
              </button>
              <button
                onClick={toggleMute}
                className="w-10 h-10 bg-black/80 hover:bg-black flex items-center justify-center transition-colors"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? (
                  <svg className="w-4 h-4" fill="white" viewBox="0 0 24 24">
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="white" viewBox="0 0 24 24">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* CTA Link */}
          <button
            onClick={handleWatchFilm}
            className="flex items-center justify-center gap-2 mx-auto mt-8 text-sm tracking-wider text-gray-500 hover:text-black transition-colors group"
          >
            <span className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-current border-b-[5px] border-b-transparent group-hover:border-l-black transition-colors" />
            {ctaText}
          </button>
        </div>
      </div>
    </section>
  )
}
