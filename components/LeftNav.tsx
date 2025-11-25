'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const navItems = [
  { href: '/', label: 'Home', subLabel: 'Jan. 2026, Las Vegas' },
  { href: '/about', label: 'About' },
  { href: '/tickets', label: 'Tickets' },
  { href: '/partners', label: 'Partners' },
  { href: '/contact', label: 'Contact' },
]

export default function LeftNav() {
  const pathname = usePathname()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const isHome = pathname === '/'

  return (
    <nav className={`fixed ${isHome ? 'left-12' : 'left-0'} top-0 h-full ${isHome ? 'w-auto' : 'w-64 border-r border-gray-200 bg-white'} z-50`}>
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
  )
}

