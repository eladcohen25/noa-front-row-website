'use client'

import { useEffect, useRef, useState } from 'react'

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const [isHovering, setIsHovering] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Check for mobile/touch device - don't render on mobile
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches
    if (isTouchDevice) {
      setShouldRender(false)
      return
    }

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setShouldRender(false)
      return
    }

    setShouldRender(true)

    // Hide default cursor globally
    document.documentElement.style.cursor = 'none'
    document.body.style.cursor = 'none'

    // Track mouse position - instant update, no lag
    const handleMouseMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`
      }
      if (!isVisible) setIsVisible(true)
    }

    // Track hover on clickable elements
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const clickable = target.closest('a, button, [role="button"], input, textarea, select, [onclick], [tabindex]:not([tabindex="-1"])')
      if (clickable) {
        setIsHovering(true)
      }
    }

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const clickable = target.closest('a, button, [role="button"], input, textarea, select, [onclick], [tabindex]:not([tabindex="-1"])')
      if (clickable) {
        setIsHovering(false)
      }
    }

    // Hide cursor when mouse leaves window
    const handleMouseLeave = () => {
      setIsVisible(false)
    }

    const handleMouseEnter = () => {
      setIsVisible(true)
    }

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseover', handleMouseOver)
    document.addEventListener('mouseout', handleMouseOut)
    document.documentElement.addEventListener('mouseleave', handleMouseLeave)
    document.documentElement.addEventListener('mouseenter', handleMouseEnter)

    return () => {
      // Restore default cursor
      document.documentElement.style.cursor = ''
      document.body.style.cursor = ''
      
      // Cleanup
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseover', handleMouseOver)
      document.removeEventListener('mouseout', handleMouseOut)
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave)
      document.documentElement.removeEventListener('mouseenter', handleMouseEnter)
    }
  }, [isVisible])

  // Don't render on mobile or if reduced motion is preferred
  if (!shouldRender) return null

  return (
    <div
      ref={cursorRef}
      className="pointer-events-none fixed top-0 left-0 z-[999999]"
      style={{
        width: isHovering ? '28px' : '18px',
        height: isHovering ? '28px' : '18px',
        border: '1px solid white',
        borderRadius: '50%',
        backgroundColor: 'transparent',
        opacity: isVisible ? 1 : 0,
        transition: 'width 0.2s ease, height 0.2s ease, opacity 0.15s ease',
        mixBlendMode: 'difference',
      }}
      aria-hidden="true"
    />
  )
}
