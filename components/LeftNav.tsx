'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

type NavItem = {
  href: string
  label: string
  subLabel?: string
}

// Toggle visibility of Tickets link (set true to show)
const SHOW_TICKETS_PAGE = false
// Toggle visibility of Partners link (set true to show)
const SHOW_PARTNERS_PAGE = false

const navItems: NavItem[] = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  ...(SHOW_TICKETS_PAGE ? [{ href: '/tickets', label: 'Tickets' }] : []),
  ...(SHOW_PARTNERS_PAGE ? [{ href: '/partners', label: 'Partners' }] : []),
  { href: '/services', label: 'Services' },
  { href: '/experiences', label: 'Experiences' },
  { href: '/lookbook', label: 'Projects' },
  { href: '/contact', label: 'Contact' },
]

export default function LeftNav() {
  const pathname = usePathname()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const isHome = pathname === '/'

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  // Prevent background scroll when menu is open
  useEffect(() => {
    if (typeof document === 'undefined') return
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [menuOpen])

  return (
    <>
      {/* Mobile hamburger button - top left, hidden on desktop */}
      <button
        type="button"
        onClick={() => setMenuOpen((prev) => !prev)}
        className="md:hidden fixed top-4 left-4 z-[100] h-10 w-10 flex flex-col items-center justify-center gap-1.5 focus:outline-none safe-top"
        style={{ marginTop: 'env(safe-area-inset-top, 0px)' }}
        aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={menuOpen}
      >
        <span
          className={`block h-[2px] w-6 bg-black transition-transform duration-300 ${
            menuOpen ? 'translate-y-[7px] rotate-45' : ''
          }`}
        />
        <span
          className={`block h-[2px] w-6 bg-black transition-opacity duration-300 ${
            menuOpen ? 'opacity-0' : ''
          }`}
        />
        <span
          className={`block h-[2px] w-6 bg-black transition-transform duration-300 ${
            menuOpen ? '-translate-y-[7px] -rotate-45' : ''
          }`}
        />
      </button>

      {/* Mobile menu overlay - hidden on desktop via md:hidden */}
      <div
        className={`md:hidden z-[95] flex flex-col items-center justify-center gap-6 px-6 text-center transition-all duration-300 ${
          menuOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
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
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMenuOpen(false)}
            className={`text-xl uppercase tracking-[0.3em] text-black ${
              pathname === item.href ? 'opacity-100' : 'opacity-60'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {/* Desktop navigation - hidden on mobile via hidden md:block */}
      <nav 
        className={`hidden md:block fixed top-0 bottom-0 h-full z-50 ${isHome ? 'w-auto' : 'w-64 border-r border-gray-200 bg-white'}`}
        style={{ left: isHome ? '48px' : '0px' }}
      >
        <div className="flex flex-col h-full p-8">
          {!isHome && (
            <div className="mb-12">
              <h1 className="font-la-foonte text-2xl font-normal tracking-tight">
                THE FRONT ROW
              </h1>
            </div>
          )}
          
          <ul className={`flex flex-col gap-10 ${isHome ? 'mt-32' : ''}`}>
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const isHovered = hoveredItem === item.href
              const shouldBlur = hoveredItem !== null && hoveredItem !== item.href

              return (
                <li key={item.href} className="nav-item">
                  <Link
                    href={item.href}
                    className="block text-black relative"
                    style={{
                      filter: isHovered || (isActive && hoveredItem === null)
                        ? 'blur(0px)'
                        : shouldBlur || (!isActive && hoveredItem === null)
                        ? 'blur(1px)'
                        : 'blur(0px)',
                      opacity: isHovered || (isActive && hoveredItem === null)
                        ? 1
                        : shouldBlur || (!isActive && hoveredItem === null)
                        ? 0.6
                        : 1,
                      transition: 'filter 280ms ease-out, opacity 280ms ease-out',
                    }}
                    onMouseEnter={() => setHoveredItem(item.href)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <span>{item.label}</span>
                    {item.subLabel && (
                      <span 
                        className="absolute left-4 text-sm text-gray-500 whitespace-nowrap pointer-events-none"
                        style={{
                          top: '100%',
                          marginTop: '4px',
                          opacity: isHovered ? 1 : 0,
                          transform: isHovered ? 'translateY(0)' : 'translateY(-8px)',
                          transition: 'all 250ms ease-out',
                        }}
                      >
                        {item.subLabel}
                      </span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </nav>
    </>
  )
}

