'use client'

import { useRef, useEffect } from 'react'
import Image from 'next/image'

interface HorizontalScrollGalleryProps {
  images: { src: string; alt: string }[]
  height?: { mobile: number; desktop: number }
}

export default function HorizontalScrollGallery({ 
  images, 
  height = { mobile: 280, desktop: 400 } 
}: HorizontalScrollGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Convert vertical scroll to horizontal scroll
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleWheel = (e: WheelEvent) => {
      // Only intercept if scrolling vertically
      if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return

      const atStart = container.scrollLeft <= 0
      const atEnd = container.scrollLeft >= container.scrollWidth - container.clientWidth - 1

      // Allow natural page scroll at boundaries
      if ((e.deltaY < 0 && atStart) || (e.deltaY > 0 && atEnd)) {
        return
      }

      e.preventDefault()
      container.scrollLeft += e.deltaY
    }

    container.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      container.removeEventListener('wheel', handleWheel)
    }
  }, [])

  return (
    <section className="bg-white py-4">
      {/* Gallery Container */}
      <div
        ref={containerRef}
        className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide px-4 md:px-8"
        style={{
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {images.map((image, index) => (
          <div
            key={index}
            className="flex-shrink-0 relative"
            style={{ 
              height: `clamp(${height.mobile}px, 40vw, ${height.desktop}px)`,
              width: 'auto',
            }}
          >
            <Image
              src={image.src}
              alt={image.alt}
              width={400}
              height={height.desktop}
              className="h-full w-auto object-cover"
              sizes="(max-width: 768px) 60vw, 30vw"
            />
          </div>
        ))}
      </div>

      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  )
}
