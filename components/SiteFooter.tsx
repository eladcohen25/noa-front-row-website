'use client'

import { useFormOverlay } from '@/components/FormOverlayProvider'

interface SiteFooterProps {
  email?: string
  instagramHandle?: string
  instagramUrl?: string
  location?: string
}

interface FooterColumn {
  heading: string
  links: Array<{
    label: string
    href?: string
    onClick?: () => void
    external?: boolean
  }>
}

export default function SiteFooter({
  email = 'info@thefrontrow.vegas',
  instagramHandle = '@thefrontrowlv',
  instagramUrl = 'https://www.instagram.com/thefrontrowlv',
  location = 'Las Vegas, NV',
}: SiteFooterProps) {
  const { openInquiry, openCasting } = useFormOverlay()

  const columns: FooterColumn[] = [
    {
      heading: 'Studio',
      links: [
        { label: 'About', href: '/#about' },
        { label: 'Services', href: '/#services' },
      ],
    },
    {
      heading: 'Work',
      links: [{ label: 'FW26 @ Bel-Aire', href: '/#lookbook' }],
    },
    {
      heading: 'Collaborate',
      links: [
        { label: 'Inquire', onClick: () => openInquiry() },
        { label: 'Cast', onClick: () => openCasting() },
      ],
    },
    {
      heading: 'Follow',
      links: [
        { label: instagramHandle, href: instagramUrl, external: true },
        { label: email, href: `mailto:${email}` },
      ],
    },
  ]

  const year = new Date().getFullYear()

  return (
    <footer className="bg-white border-t border-black/10 px-6 md:px-12 pt-14 md:pt-20 pb-8">
      <div className="max-w-7xl mx-auto">
        {/* Column links — heading + items per column. Mirrors Jacquemus's
            stacked groups but stays purely textual (no dropdown chrome) so
            it reads as editorial, not utility. */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8 mb-14 md:mb-20">
          {columns.map((col) => (
            <div key={col.heading}>
              <h3 className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-black/55 mb-5">
                {col.heading}
              </h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.onClick ? (
                      <button
                        type="button"
                        onClick={link.onClick}
                        className="text-sm text-black/85 hover:text-black hover:opacity-100 opacity-90 transition-opacity"
                      >
                        {link.label}
                      </button>
                    ) : (
                      <a
                        href={link.href}
                        {...(link.external
                          ? { target: '_blank', rel: 'noreferrer' }
                          : {})}
                        className="text-sm text-black/85 hover:text-black hover:opacity-100 opacity-90 transition-opacity"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Big wordmark — full "THE FRONT ROW" in the Edition serif. Set
            generously across the footer so it reads as the brand sign-off. */}
        <div className="border-t border-black/10 pt-10 md:pt-12 pb-2">
          <a
            href="/#home"
            aria-label="The Front Row — return to top"
            className="block w-full text-center select-none leading-none"
          >
            <span className="font-edition tracking-[0.04em] text-[clamp(2.75rem,11vw,9rem)] block">
              THE FRONT ROW
            </span>
          </a>
        </div>

        {/* Bottom meta row: copyright on left, location on right, with the
            wordmark above acting as the centered logo. Mirrors the Jacquemus
            ©/logo/locale pattern. */}
        <div className="mt-8 md:mt-10 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-6">
          <p className="text-[10px] uppercase tracking-[0.3em] text-black/50 order-2 md:order-1">
            © The Front Row {year}
          </p>
          <p className="text-[10px] uppercase tracking-[0.3em] text-black/50 order-1 md:order-2">
            {location}
          </p>
        </div>
      </div>
    </footer>
  )
}
