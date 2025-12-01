'use client'

import { useEffect, useState } from 'react'

interface LoadingScreenProps {
  onComplete?: () => void
  onFiftyPercent?: () => void // Called at 50% (page switch)
  onScaleDownStart?: () => void // Called when scale-down starts (blur effect)
}

export default function LoadingScreen({ onComplete, onFiftyPercent, onScaleDownStart }: LoadingScreenProps) {
  const [animationPhase, setAnimationPhase] = useState<'initial' | 'scale-up' | 'hold' | 'scale-down' | 'done'>('initial')
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    setIsMobile(window.matchMedia('(max-width: 768px)').matches)
  }, [])

  useEffect(() => {
    console.log('✅ LoadingScreen mounted - Animation starting')
    
    // Start animation after a brief delay
    const startTimer = setTimeout(() => setAnimationPhase('scale-up'), 100)

    // 50% milestone: 1650ms (switch to new page when heart fills screen)
    const fiftyPercentTimer = setTimeout(() => {
      if (onFiftyPercent) onFiftyPercent()
    }, 1650)

    // Phase 1: Scale up to full (100ms-1600ms = 1500ms)
    const scaleUpTimer = setTimeout(() => setAnimationPhase('hold'), 1600)

    // Phase 2: Hold at full (1600ms-1800ms = 200ms)
    // When scale-down starts, trigger blur effect
    const holdTimer = setTimeout(() => {
      setAnimationPhase('scale-down')
      if (onScaleDownStart) onScaleDownStart()
    }, 1800)

    // Phase 3: Scale down (1800ms-3300ms = 1500ms)
    const scaleDownTimer = setTimeout(() => {
      setAnimationPhase('done')
      if (onComplete) onComplete()
    }, 3300)

    return () => {
      clearTimeout(startTimer)
      clearTimeout(fiftyPercentTimer)
      clearTimeout(scaleUpTimer)
      clearTimeout(holdTimer)
      clearTimeout(scaleDownTimer)
    }
  }, [onComplete, onFiftyPercent, onScaleDownStart])

  if (animationPhase === 'done') return null

  // Calculate scale value
  const getScale = () => {
    if (animationPhase === 'initial') return 0.1 // Start tiny
    if (animationPhase === 'scale-up') return 50 // Grow to fill screen
    if (animationPhase === 'hold') return 50 // Stay big
    if (animationPhase === 'scale-down') return 0.1 // Shrink back to tiny
    return 0.1
  }

  // Calculate transition
  const getTransition = () => {
    if (animationPhase === 'scale-up') return 'transform 1500ms cubic-bezier(0.4, 0.0, 0.2, 1)'
    if (animationPhase === 'scale-down') return 'transform 1500ms cubic-bezier(0.4, 0.0, 0.2, 1)'
    return 'none'
  }

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden pointer-events-none">
      {/* White heart shape that scales */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="will-change-transform"
          style={{
            transform: `scale(${getScale()})`,
            transition: getTransition(),
            transformOrigin: 'center center',
          }}
        >
          <svg
            width="120"
            height="120"
            viewBox="0 0 120 120"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M60,100 C60,100 20,70 20,45 C20,32 27,20 40,20 C48,20 54,24 60,32 C66,24 72,20 80,20 C93,20 100,32 100,45 C100,70 60,100 60,100 Z"
              fill="white"
              stroke="#FFD700"
              strokeWidth="2"
              style={{
                shapeRendering: 'geometricPrecision',
              }}
            />
          </svg>
        </div>
      </div>

      {/* Logo - video on desktop, text on mobile */}
      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
        {/* Desktop: 3D video */}
        {!isMobile && (
          <video
            src="/Noa%203-D%20logo.mp4"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="w-40 h-40 object-contain mix-blend-multiply"
            style={{
              transform: 
                animationPhase === 'initial' ? 'scale(0.5)' :
                animationPhase === 'scale-up' ? 'scale(1)' :
                animationPhase === 'hold' ? 'scale(1)' :
                animationPhase === 'scale-down' ? 'scale(0.5)' :
                'scale(0.5)',
              opacity:
                animationPhase === 'initial' ? 0 :
                animationPhase === 'scale-up' ? 1 :
                animationPhase === 'hold' ? 1 :
                animationPhase === 'scale-down' ? 0 :
                0,
              transition: 
                animationPhase === 'scale-up' ? 'transform 1500ms cubic-bezier(0.4, 0.0, 0.2, 1), opacity 1500ms ease-out' :
                animationPhase === 'scale-down' ? 'transform 1500ms cubic-bezier(0.4, 0.0, 0.2, 1), opacity 800ms ease-in' :
                'none',
            }}
          />
        )}

        {/* Mobile: TFR text logo */}
        {isMobile && (
          <div
            className="font-la-foonte text-3xl tracking-tight text-black"
            style={{
              transform: 
                animationPhase === 'initial' ? 'scale(0.5)' :
                animationPhase === 'scale-up' ? 'scale(1)' :
                animationPhase === 'hold' ? 'scale(1)' :
                animationPhase === 'scale-down' ? 'scale(0.5)' :
                'scale(0.5)',
              opacity:
                animationPhase === 'initial' ? 0 :
                animationPhase === 'scale-up' ? 1 :
                animationPhase === 'hold' ? 1 :
                animationPhase === 'scale-down' ? 0 :
                0,
              transition: 
                animationPhase === 'scale-up' ? 'transform 1500ms cubic-bezier(0.4, 0.0, 0.2, 1), opacity 1500ms ease-out' :
                animationPhase === 'scale-down' ? 'transform 1500ms cubic-bezier(0.4, 0.0, 0.2, 1), opacity 800ms ease-in' :
                'none',
            }}
          >
            TFR
          </div>
        )}
      </div>
    </div>
  )
}