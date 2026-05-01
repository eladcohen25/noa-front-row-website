'use client'

import ScrollReveal from '@/components/ScrollReveal'
import { useState, useEffect } from 'react'

const CONTACT_IMAGES = {
  noaCohen: '/Contact%20Page%20Photos/noa-cohen.jpg',
  theFrontRowLv: '/Contact%20Page%20Photos/final%20contact%20photo.png',
  instagramIcon: '/Contact%20Page%20Photos/instagram-icon.png',
}

export interface ContactPerson {
  image: string
  name: string
  role: string
  email: string
  instagram: string
  instagramUrl: string
}

interface ContactContentProps {
  headline: string
  contacts: ContactPerson[]
}

export default function ContactContent({ headline, contacts }: ContactContentProps) {
  const [cardsRevealed, setCardsRevealed] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setCardsRevealed(true)
    }, 3400)
    return () => clearTimeout(timer)
  }, [])

  const getCardRevealStyle = (index: number) => ({
    opacity: cardsRevealed ? 1 : 0,
    clipPath: cardsRevealed
      ? 'inset(0 0% 0 0%)'
      : index === 0
        ? 'inset(0 0% 0 100%)'
        : 'inset(0 100% 0 0%)',
    transition:
      'opacity 1.3s cubic-bezier(0.2, 0.8, 0.2, 1), clip-path 1.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
  })

  return (
    <div className="min-h-screen bg-white pt-28 md:pt-40 pb-24 px-4 md:px-8">
      <div className="max-w-3xl mx-auto md:text-center mb-12 md:mb-16">
        <ScrollReveal>
          <h1 className="text-5xl font-typekit mb-12">{headline}</h1>
        </ScrollReveal>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 max-w-3xl mx-auto">
        {contacts.map((contact, index) => (
          <div key={index} className="hidden md:block" style={getCardRevealStyle(index)}>
            <ContactCard contact={contact} />
          </div>
        ))}

        {contacts.map((contact, index) => (
          <ScrollReveal key={`mobile-${index}`} className="md:hidden">
            <ContactCard contact={contact} />
          </ScrollReveal>
        ))}
      </div>
    </div>
  )
}

function ContactCard({ contact }: { contact: ContactPerson }) {
  return (
    <div className="text-center">
      <img src={contact.image} alt={contact.name} className="w-full object-cover mb-6" />
      <p className="text-base font-semibold mb-1">{contact.name}</p>
      {contact.role && <p className="text-sm text-gray-600 mb-3">{contact.role}</p>}
      {contact.email && (
        <a
          href={`mailto:${contact.email}`}
          className="text-sm mb-3 block hover:opacity-70 transition-opacity"
        >
          {contact.email}
        </a>
      )}
      {contact.instagramUrl && (
        <a
          href={contact.instagramUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-sm hover:opacity-70 transition-opacity"
        >
          <img
            src={CONTACT_IMAGES.instagramIcon}
            alt="Instagram"
            className="w-4 h-4"
          />
          {contact.instagram}
        </a>
      )}
    </div>
  )
}

export const CONTACT_FALLBACK_IMAGES = CONTACT_IMAGES
