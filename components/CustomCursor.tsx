'use client'

import { useEffect, useRef, useState } from 'react'

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const [isHovering, setIsHovering] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)
  
  // Mouse position refs for smooth animation
  const mousePosition = useRef({ x: 0, y: 0 })
  const cursorPosition = useRef({ x: 0, y: 0 })
  const animationFrameRef = useRef<number>()

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

    // Track mouse position
    const handleMouseMove = (e: MouseEvent) => {
      mousePosition.current = { x: e.clientX, y: e.clientY }
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

    // Smooth cursor animation with easing
    const animateCursor = () => {
      // Slow, refined easing factor (lower = smoother/slower)
      const ease = 0.12
      
      cursorPosition.current.x += (mousePosition.current.x - cursorPosition.current.x) * ease
      cursorPosition.current.y += (mousePosition.current.y - cursorPosition.current.y) * ease

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${cursorPosition.current.x}px, ${cursorPosition.current.y}px) translate(-50%, -50%)`
      }

      animationFrameRef.current = requestAnimationFrame(animateCursor)
    }

    // Start animation loop
    animationFrameRef.current = requestAnimationFrame(animateCursor)

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
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isVisible])

  // Don't render on mobile or if reduced motion is preferred
  if (!shouldRender) return null

  return (
    <div
      ref={cursorRef}
      className="pointer-events-none fixed top-0 left-0 z-[9999]"
      style={{
        width: isHovering ? '48px' : '28px',
        height: isHovering ? '48px' : '28px',
        border: '1.5px solid white',
        borderRadius: '50%',
        backgroundColor: 'transparent',
        opacity: isVisible ? 1 : 0,
        transition: 'width 0.4s cubic-bezier(0.25, 0.1, 0.25, 1), height 0.4s cubic-bezier(0.25, 0.1, 0.25, 1), opacity 0.3s ease',
        mixBlendMode: 'difference',
        willChange: 'transform',
      }}
      aria-hidden="true"
    />
  )
}
