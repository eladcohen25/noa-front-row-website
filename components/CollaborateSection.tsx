'use client'

import ScrollReveal from '@/components/ScrollReveal'
import { useFormOverlay } from '@/components/FormOverlayProvider'
import type { ReactNode } from 'react'

interface CollaborateSectionProps {
  headline?: string
  body?: string
}

interface CollaborateCard {
  number: string
  title: string
  description: string
  icon: ReactNode
  ctaLabel: string
  onActivate: () => void
}

// Simple, line-only icons keep the cards feeling editorial rather than
// utility — they read more as marks than UI affordances.
const VenueIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.25"
    strokeLinecap="square"
    strokeLinejoin="miter"
    aria-hidden="true"
    className="w-5 h-5"
  >
    <path d="M3 21V9l9-6 9 6v12" />
    <path d="M9 21v-7h6v7" />
  </svg>
)

const BrandIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.25"
    strokeLinecap="square"
    strokeLinejoin="miter"
    aria-hidden="true"
    className="w-5 h-5"
  >
    <path d="M4 7h16l-1.5 13H5.5L4 7z" />
    <path d="M9 10V6a3 3 0 0 1 6 0v4" />
  </svg>
)

const CreativeIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.25"
    strokeLinecap="square"
    strokeLinejoin="miter"
    aria-hidden="true"
    className="w-5 h-5"
  >
    <path d="M3 7h4l2-2h6l2 2h4v12H3z" />
    <circle cx="12" cy="13" r="3.5" />
  </svg>
)

const ModelIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.25"
    strokeLinecap="square"
    strokeLinejoin="miter"
    aria-hidden="true"
    className="w-5 h-5"
  >
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 21c0-3.5 3-6 7-6s7 2.5 7 6" />
  </svg>
)

export default function CollaborateSection({
  headline = 'Work with us',
  body = 'Select an option below to get started.',
}: CollaborateSectionProps) {
  const { openInquiry, openCasting } = useFormOverlay()

  const cards: CollaborateCard[] = [
    {
      number: '01',
      title: 'Venues',
      description: 'Hotels, restaurants, lounges, and private clubs hosting events.',
      icon: VenueIcon,
      ctaLabel: 'Inquire as a venue',
      // Restrict the type-selector to the two venue paths. The user still
      // picks Hotel vs. Private Club so the right branch loads.
      onActivate: () => openInquiry({ restrictTypes: ['hotel', 'club'] }),
    },
    {
      number: '02',
      title: 'Brands',
      description: 'Campaigns, sponsorships, activations, editorial partnerships.',
      icon: BrandIcon,
      ctaLabel: 'Inquire as a brand',
      onActivate: () => openInquiry({ presetInquirerType: 'brand' }),
    },
    {
      number: '03',
      title: 'Creatives',
      description: 'Photographers, stylists, MUAs, media, and collaborators.',
      icon: CreativeIcon,
      ctaLabel: 'Inquire as a creative',
      onActivate: () => openInquiry({ presetInquirerType: 'creative' }),
    },
    {
      number: '04',
      title: 'Models',
      description: 'Talent seeking runway and editorial opportunities.',
      icon: ModelIcon,
      ctaLabel: 'Submit for casting',
      onActivate: () => openCasting(),
    },
  ]

  return (
    <div className="bg-white pt-28 md:pt-40 pb-28 md:pb-32 px-5 md:px-12">
      <div className="max-w-3xl mx-auto text-center">
        <ScrollReveal>
          <h1 className="font-typekit text-4xl md:text-6xl leading-tight">
            {headline}
          </h1>
        </ScrollReveal>

        {body && (
          <ScrollReveal>
            <p className="mt-6 text-base md:text-lg text-black/70 leading-relaxed max-w-xl mx-auto">
              {body}
            </p>
          </ScrollReveal>
        )}
      </div>

      {/* 2 × 2 hairline grid on desktop, single column on mobile. Mirrors
          the Services section's grid language so the two read as a pair. */}
      <div className="max-w-5xl mx-auto mt-14 md:mt-20 grid grid-cols-1 md:grid-cols-2 gap-px bg-black/10">
        {cards.map((card) => (
          <ScrollReveal key={card.number}>
            <button
              type="button"
              onClick={card.onActivate}
              aria-label={card.ctaLabel}
              className="group h-full w-full text-left bg-white p-8 md:p-10 lg:p-12 transition-colors duration-500 hover:bg-[#fafafa] focus:outline-none focus-visible:ring-2 focus-visible:ring-black/40"
            >
              <div className="flex items-start justify-between mb-8">
                <span
                  aria-hidden
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-black/15 text-black/70 transition-colors duration-500 group-hover:border-black/40 group-hover:text-black"
                >
                  {card.icon}
                </span>
                <span className="text-[10px] uppercase tracking-[0.4em] text-black/40">
                  {card.number}
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl font-typekit-italic leading-tight mb-4">
                {card.title}
              </h2>

              <p className="text-sm md:text-[15px] leading-relaxed text-black/65">
                {card.description}
              </p>

              <div className="mt-8 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-black/55 transition-colors duration-300 group-hover:text-black">
                <span>{card.ctaLabel}</span>
                <span
                  aria-hidden
                  className="inline-block translate-x-0 transition-transform duration-300 group-hover:translate-x-1"
                >
                  →
                </span>
              </div>
            </button>
          </ScrollReveal>
        ))}
      </div>
    </div>
  )
}
