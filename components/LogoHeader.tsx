'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

export default function LogoHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(max-width: 768px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault()
      if (pathname !== '/') {
        router.push('/#home')
        return
      }
      const target = document.getElementById('home')
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
      if (window.history.replaceState) {
        window.history.replaceState(null, '', '/')
      }
    },
    [pathname, router]
  )

  return (
    <div
      className={`tfr-floating-chrome fixed z-40 left-1/2 -translate-x-1/2 pointer-events-none ${
        isMobile ? 'top-5 safe-top' : 'top-8'
      }`}
      style={{ mixBlendMode: 'difference' }}
    >
      <a
        href="/#home"
        onClick={handleClick}
        className="pointer-events-auto inline-block select-none text-white"
        aria-label="The Front Row — return to top"
      >
        <span
          className={`font-edition tracking-[0.08em] leading-none ${
            isMobile ? 'text-3xl' : 'text-4xl md:text-5xl'
          }`}
        >
          TFR
        </span>
      </a>
    </div>
  )
}
