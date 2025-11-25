'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

export default function LogoHeader() {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const [showLogo, setShowLogo] = useState(!isHome)
  const [showText, setShowText] = useState(isHome)

  useEffect(() => {
    if (!isHome) {
      setShowLogo(true)
      setShowText(false)
      return
    }

    const handleScroll = () => {
      const threshold = 100
      if (window.scrollY > threshold) {
        setShowLogo(true)
        setShowText(false)
      } else {
        setShowLogo(false)
        setShowText(true)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isHome])

  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
      <div className="relative flex items-center justify-center">
        {showText && (
          <h1 className="font-la-foonte text-xl font-normal tracking-tight whitespace-nowrap transition-opacity duration-300 text-black">
            THE FRONT ROW
          </h1>
        )}
        {showLogo && (
          <Link href="/" className="pointer-events-auto cursor-pointer">
            <video
              src="/Noa%203-D%20logo.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-24 h-24 object-contain transition-opacity duration-300"
            />
          </Link>
        )}
      </div>
    </div>
  )
}

