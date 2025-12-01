'use client'

import ScrollReveal from '@/components/ScrollReveal'
import { useState, useEffect } from 'react'

// ========================================
// CONTACT PAGE IMAGES - Easy to replace
// ========================================
const CONTACT_IMAGES = {
  noaCohen: '/Contact%20Page%20Photos/noa-cohen.jpg',
  briannaBrown: '/Contact%20Page%20Photos/brianna-brown.jpg',
  theFrontRowLv: '/Contact%20Page%20Photos/the-front-row-lv.jpg',
  instagramIcon: '/Contact%20Page%20Photos/instagram-icon.png',
}
// ========================================

const contacts = [
  {
    image: CONTACT_IMAGES.noaCohen,
    name: 'Noa Cohen',
    role: 'Founder & Creative Director',
    email: 'noacohenbiz@gmail.com',
    instagram: '@noacohen.23',
    instagramUrl: 'https://www.instagram.com/noacohen.23',
  },
  {
    image: CONTACT_IMAGES.briannaBrown,
    name: 'Brianna O. Brown',
    role: 'Director of Beauty & Cosmetics',
    email: 'srbbrianna@gmail.com',
    instagram: '@brianna.o.brown',
    instagramUrl: 'https://www.instagram.com/brianna.o.brown',
  },
  {
    image: CONTACT_IMAGES.theFrontRowLv,
    name: 'THE FRONT ROW LV',
    role: '',
    email: 'info@thefrontrow.vegas',
    instagram: '@thefrontrowlv',
    instagramUrl: 'https://www.instagram.com/thefrontrowlv',
  },
]

export default function Contact() {
  const [cardsRevealed, setCardsRevealed] = useState(false)

  useEffect(() => {
    // Wait for page loader to finish (~3300ms) before starting reveal animation
    const timer = setTimeout(() => {
      setCardsRevealed(true)
    }, 3400)

    return () => clearTimeout(timer)
  }, [])

  // Get reveal style for each card (desktop only)
  // Index 1 (Brianna) is always visible, 0 and 2 fade in
  const getCardRevealStyle = (index: number) => {
    if (index === 1) {
      // Center card (Brianna) - always visible
      return {}
    }
    // Left and right cards - fade in with clip-path reveal expanding outward from center
    return {
      opacity: cardsRevealed ? 1 : 0,
      clipPath: cardsRevealed 
        ? 'inset(0 0% 0 0%)' 
        : index === 0 
          ? 'inset(0 0% 0 100%)' // Left card reveals from left (expanding outward)
          : 'inset(0 100% 0 0%)', // Right card reveals from right (expanding outward)
      transition: 'opacity 1.3s cubic-bezier(0.2, 0.8, 0.2, 1), clip-path 1.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
    }
  }

  return (
    <div className="min-h-screen bg-white pt-28 md:pt-40 pb-24 px-4 md:px-8">
      <div className="max-w-3xl mx-auto md:text-center mb-12 md:mb-16">
        <ScrollReveal>
          <h1 className="text-5xl font-typekit mb-12">Contact</h1>
        </ScrollReveal>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 max-w-5xl mx-auto">
        {contacts.map((contact, index) => (
          <div 
            key={index}
            className="hidden md:block"
            style={getCardRevealStyle(index)}
          >
            <div className="text-center">
              {/* Contact Image */}
              <img
                src={contact.image}
                alt={contact.name}
                className="w-full object-cover mb-6"
              />

              {/* Name */}
              <p className="text-base font-semibold mb-1">
                {contact.name}
              </p>

              {/* Role */}
              {contact.role && (
                <p className="text-sm text-gray-600 mb-3">
                  {contact.role}
                </p>
              )}

              {/* Email */}
              <p className="text-sm mb-3">
                {contact.email}
              </p>

              {/* Instagram */}
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
            </div>
          </div>
        ))}

        {/* Mobile cards - no reveal animation */}
        {contacts.map((contact, index) => (
          <ScrollReveal key={`mobile-${index}`} className="md:hidden">
            <div className="text-center">
              {/* Contact Image */}
              <img
                src={contact.image}
                alt={contact.name}
                className="w-full object-cover mb-6"
              />

              {/* Name */}
              <p className="text-base font-semibold mb-1">
                {contact.name}
              </p>

              {/* Role */}
              {contact.role && (
                <p className="text-sm text-gray-600 mb-3">
                  {contact.role}
                </p>
              )}

              {/* Email */}
              <p className="text-sm mb-3">
                {contact.email}
              </p>

              {/* Instagram */}
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
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  )
}



