'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { useFormOverlay } from '@/components/FormOverlayProvider'
import { scrollToSection } from '@/lib/scrollToSection'

type NavItem = {
  id: string
  label: string
}

// Single source of truth — these 4 entries drive the inline hero nav,
// the floating desktop nav, and the mobile menu so the labels never drift.
const navItems: NavItem[] = [
  { id: 'lookbook', label: 'Work' },
  { id: 'about', label: 'Studio' },
  { id: 'services', label: 'Services' },
  { id: 'models', label: 'Collaborate' },
]

export default function LeftNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { openInquiry } = useFormOverlay()
  const [activeId, setActiveId] = useState<string>('lookbook')
  const [pastHero, setPastHero] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  // Close mobile menu whenever the active section changes via scroll/click.
  useEffect(() => {
    setMenuOpen(false)
  }, [activeId, pathname])

  // Prevent background scroll while mobile overlay is open.
  useEffect(() => {
    if (typeof document === 'undefined') return
    if (menuOpen) {
      const previous = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = previous
      }
    }
  }, [menuOpen])

  // Detect whether the hero is still in view. While it is, the inline nav
  // inside <Hero /> is the only surface — the floating nav stays hidden.
  useEffect(() => {
    if (pathname !== '/') {
      setPastHero(true)
      return
    }
    if (typeof window === 'undefined') return
    const hero = document.getElementById('home')
    if (!hero) {
      setPastHero(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Treat the hero as "past" once less than 15% of it remains on screen.
        setPastHero(!entry.isIntersecting || entry.intersectionRatio < 0.15)
      },
      { threshold: [0, 0.15, 0.5, 0.85, 1] }
    )
    observer.observe(hero)
    return () => observer.disconnect()
  }, [pathname])

  // Track which section is in view so the nav can highlight it.
  useEffect(() => {
    if (pathname !== '/') return
    if (typeof window === 'undefined') return

    const sections = navItems
      .map(({ id }) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el))

    if (sections.length === 0) return

    const visibility = new Map<string, number>()

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          visibility.set(entry.target.id, entry.intersectionRatio)
        })
        let best = activeId
        let bestRatio = 0
        visibility.forEach((ratio, id) => {
          if (ratio > bestRatio) {
            bestRatio = ratio
            best = id
          }
        })
        if (bestRatio > 0 && best !== activeId) {
          setActiveId(best)
        }
      },
      {
        rootMargin: '-30% 0px -50% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [pathname, activeId])

  // Honor a deep-link hash (e.g. /#about) on first paint and when arriving
  // from a redirected legacy URL.
  useEffect(() => {
    if (pathname !== '/') return
    if (typeof window === 'undefined') return
    const hash = window.location.hash.replace('#', '')
    if (!hash) return
    requestAnimationFrame(() => {
      scrollToSection(hash)
    })
  }, [pathname])

  const handleNavClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      event.preventDefault()
      setMenuOpen(false)
      // The Work section can be in either gallery or case-study mode. Clicking
      // "Work" in the nav should always bounce the user back to the gallery
      // grid, so broadcast an event the WorkSection listens for.
      if (id === 'lookbook' && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tfr:work-reset'))
      }
      if (pathname !== '/') {
        router.push(`/#${id}`)
        return
      }
      setActiveId(id)
      scrollToSection(id)
    },
    [pathname, router]
  )

  return (
    <>
      {/* Mobile hamburger button. Hidden while the hero is on screen so the
          inline hero nav is the only mobile entry point; fades in once the
          user scrolls past it. */}
      <button
        type="button"
        onClick={() => setMenuOpen((prev) => !prev)}
        className="tfr-floating-chrome md:hidden fixed top-4 left-4 z-[100] h-10 w-10 flex flex-col items-center justify-center gap-1.5 focus:outline-none safe-top"
        style={{
          marginTop: 'env(safe-area-inset-top, 0px)',
          mixBlendMode: menuOpen ? 'normal' : 'difference',
          opacity: pastHero || menuOpen ? 1 : 0,
          pointerEvents: pastHero || menuOpen ? 'auto' : 'none',
          transition: 'opacity 260ms ease-out',
        }}
        aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={menuOpen}
        aria-hidden={!pastHero && !menuOpen}
      >
        <span
          className={`block h-[2px] w-6 transition-transform duration-300 ${
            menuOpen ? 'translate-y-[7px] rotate-45 bg-black' : 'bg-white'
          }`}
        />
        <span
          className={`block h-[2px] w-6 transition-opacity duration-300 ${
            menuOpen ? 'opacity-0 bg-black' : 'bg-white'
          }`}
        />
        <span
          className={`block h-[2px] w-6 transition-transform duration-300 ${
            menuOpen ? '-translate-y-[7px] -rotate-45 bg-black' : 'bg-white'
          }`}
        />
      </button>

      {/* Mobile menu overlay */}
      <div
        className={`tfr-floating-chrome md:hidden z-[95] flex flex-col items-center justify-center gap-6 px-6 text-center transition-opacity duration-300 ${
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'white',
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {navItems.map((item) => {
          const isActive = activeId === item.id && pathname === '/'
          return (
            <a
              key={item.id}
              href={`/#${item.id}`}
              onClick={(event) => handleNavClick(event, item.id)}
              className={`text-xl uppercase tracking-[0.3em] text-black transition-opacity duration-300 ${
                isActive ? 'opacity-100' : 'opacity-60'
              }`}
            >
              {item.label}
            </a>
          )
        })}
        <button
          type="button"
          onClick={() => {
            setMenuOpen(false)
            openInquiry()
          }}
          className="mt-4 text-xs uppercase tracking-[0.3em] text-black/70 border border-black/30 rounded-full px-6 py-2 hover:bg-black hover:text-white transition-colors"
        >
          Inquire
        </button>
      </div>

      {/* Desktop floating top-left nav. Horizontal row of 4 items that fades
          in once the user has scrolled past the hero. White text with
          mix-blend-mode: difference so it stays legible over both dark and
          light sections. */}
      <nav
        className="tfr-floating-chrome hidden md:block fixed z-50 top-6 left-6 lg:top-8 lg:left-8 pointer-events-none"
        style={{
          mixBlendMode: 'difference',
          opacity: pastHero ? 1 : 0,
          transform: pastHero ? 'translateY(0)' : 'translateY(-6px)',
          transition: 'opacity 320ms ease-out, transform 320ms ease-out',
        }}
        aria-hidden={!pastHero}
      >
        <ul className="flex flex-row items-center gap-x-6 lg:gap-x-8 pointer-events-auto">
          {navItems.map((item) => {
            const isActive = activeId === item.id && pathname === '/'
            return (
              <li key={item.id}>
                <a
                  href={`/#${item.id}`}
                  onClick={(event) => handleNavClick(event, item.id)}
                  className={`block whitespace-nowrap text-[11px] lg:text-xs uppercase tracking-[0.3em] text-white transition-opacity hover:opacity-100 ${
                    isActive ? 'opacity-100' : 'opacity-70'
                  }`}
                >
                  {item.label}
                </a>
              </li>
            )
          })}
        </ul>
      </nav>
    </>
  )
}
