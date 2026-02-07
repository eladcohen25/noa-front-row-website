'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'

interface AllLooksOverlayProps {
  images: { src: string; alt: string }[]
  isOpen: boolean
  onClose: () => void
  initialIndex?: number
  initialView?: 'single' | 'grid'
}

export default function AllLooksOverlay({
  images,
  isOpen,
  onClose,
  initialIndex = 0,
  initialView = 'grid',
}: AllLooksOverlayProps) {
  const [viewMode, setViewMode] = useState<'single' | 'grid'>(initialView)
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [mounted, setMounted] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const thumbRef = useRef<HTMLDivElement>(null)

  // Wait for client mount (portal needs document.body)
  useEffect(() => { setMounted(true) }, [])

  const scrollToTop = useCallback(() => {
    requestAnimationFrame(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = 0
    })
  }, [])

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setViewMode(initialView)
      setCurrentIndex(initialIndex)
      scrollToTop()
    }
  }, [isOpen, initialView, initialIndex, scrollToTop])

  // Lock background scroll
  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [isOpen])

  // Keyboard nav
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (viewMode === 'single') {
        if (e.key === 'ArrowRight') setCurrentIndex((p) => (p + 1) % images.length)
        if (e.key === 'ArrowLeft') setCurrentIndex((p) => (p - 1 + images.length) % images.length)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose, viewMode, images.length])

  // Auto-scroll thumbnail into view
  useEffect(() => {
    if (viewMode === 'single' && thumbRef.current) {
      const el = thumbRef.current.children[currentIndex] as HTMLElement
      el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }, [currentIndex, viewMode])

  if (!isOpen || !mounted) return null

  // =============================================
  // Render via portal into document.body
  // This escapes any ancestor with CSS filter/transform
  // that would trap position:fixed elements
  // =============================================
  const overlayContent = (
    <>
      {/* OVERLAY: fixed full-screen, flex column layout */}
      <div
        id="lookbook-overlay"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 99990,
          background: '#fff',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* HEADER — flex-shrink:0 means it never scrolls away */}
        <div
          style={{
            flexShrink: 0,
            background: '#fff',
            borderBottom: '1px solid #e5e5e5',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          {/* Title bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 24px',
              height: '56px',
            }}
          >
            <span
              style={{
                fontSize: '13px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontWeight: 500,
                color: '#000',
              }}
            >
              {viewMode === 'single' ? `Look ${currentIndex + 1}` : 'All Looks'}
            </span>
            <button
              onClick={onClose}
              style={{
                fontSize: '13px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontWeight: 500,
                color: '#000',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px 0',
              }}
            >
              Close
            </button>
          </div>

          {/* Thumbnail strip — single view only */}
          {viewMode === 'single' && (
            <div style={{ borderTop: '1px solid #f0f0f0', background: '#fff' }}>
              <div
                ref={thumbRef}
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '4px',
                  overflowX: 'auto',
                  padding: '8px 16px',
                  msOverflowStyle: 'none',
                  scrollbarWidth: 'none',
                }}
              >
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    style={{
                      flexShrink: 0,
                      position: 'relative',
                      width: '40px',
                      height: '56px',
                      overflow: 'hidden',
                      opacity: i === currentIndex ? 1 : 0.45,
                      outline: i === currentIndex ? '2px solid #000' : 'none',
                      outlineOffset: '-2px',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      transition: 'opacity 0.15s',
                    }}
                  >
                    <Image src={img.src} alt={img.alt} fill className="object-cover" sizes="40px" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SCROLLABLE CONTENT — flex:1 fills remaining space */}
        <div
          ref={scrollRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {viewMode === 'single' ? (
            /* Single image view */
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                padding: '16px',
              }}
            >
              <Image
                src={images[currentIndex].src}
                alt={images[currentIndex].alt}
                width={600}
                height={900}
                style={{
                  width: 'auto',
                  maxWidth: '100%',
                  height: 'auto',
                  maxHeight: 'calc(100vh - 160px)',
                  objectFit: 'contain',
                }}
                sizes="(max-width: 768px) 100vw, 600px"
                priority
              />
            </div>
          ) : (
            /* Grid view */
            <div style={{ padding: '24px 16px 32px' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '16px',
                  maxWidth: '1200px',
                  margin: '0 auto',
                }}
              >
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setCurrentIndex(i)
                      setViewMode('single')
                      scrollToTop()
                    }}
                    style={{
                      position: 'relative',
                      aspectRatio: '3/4',
                      overflow: 'hidden',
                      background: '#f5f5f5',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                    }}
                    className="group"
                  >
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FLOATING TOGGLE — completely separate, bottom-right */}
      <div
        id="lookbook-toggle"
        style={{
          position: 'fixed',
          bottom: '28px',
          right: '28px',
          zIndex: 99999,
          display: 'flex',
          boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
          borderRadius: '4px',
          overflow: 'hidden',
        }}
      >
        <button
          onClick={() => { setViewMode('grid'); scrollToTop() }}
          style={{
            width: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: viewMode === 'grid' ? 'none' : '1px solid #d1d5db',
            background: viewMode === 'grid' ? '#000' : '#fff',
            cursor: 'pointer',
            padding: 0,
          }}
          aria-label="Grid view"
        >
          <svg width="16" height="16" viewBox="0 0 24 24">
            <circle cx="7" cy="7" r="2.5" fill={viewMode === 'grid' ? '#fff' : '#000'} />
            <circle cx="17" cy="7" r="2.5" fill={viewMode === 'grid' ? '#fff' : '#000'} />
            <circle cx="7" cy="17" r="2.5" fill={viewMode === 'grid' ? '#fff' : '#000'} />
            <circle cx="17" cy="17" r="2.5" fill={viewMode === 'grid' ? '#fff' : '#000'} />
          </svg>
        </button>
        <button
          onClick={() => { setViewMode('single'); scrollToTop() }}
          style={{
            width: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: viewMode === 'single' ? 'none' : '1px solid #d1d5db',
            background: viewMode === 'single' ? '#000' : '#fff',
            cursor: 'pointer',
            padding: 0,
          }}
          aria-label="Single view"
        >
          <svg width="16" height="16" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3" fill={viewMode === 'single' ? '#fff' : '#000'} />
          </svg>
        </button>
      </div>

      <style>{`
        #lookbook-overlay *::-webkit-scrollbar { display: none; }
        #lookbook-overlay * { scrollbar-width: none; }
        @media (max-width: 640px) {
          #lookbook-overlay [style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  )

  return createPortal(overlayContent, document.body)
}
