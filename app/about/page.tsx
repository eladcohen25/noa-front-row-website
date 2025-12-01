'use client'

import ScrollReveal from '@/components/ScrollReveal'
import { useState, useEffect } from 'react'

// ========================================
// ABOUT PAGE IMAGES - Easy to replace
// ========================================
const ABOUT_IMAGE_MOBILE = '/About%20Page%20Photos/noa%20duo%20red%201.jpg'
const ABOUT_IMAGE_DESKTOP = '/About%20Page%20Photos/Desktop%20Image.jpg'
// ========================================

export default function About() {
  const [imageRevealed, setImageRevealed] = useState(false)

  useEffect(() => {
    // Wait for page loader to finish (~3300ms) before starting reveal animation
    const timer = setTimeout(() => {
      setImageRevealed(true)
    }, 3400)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-white pt-28 md:pt-40 pb-24 px-4 md:px-8">
      <div className="max-w-3xl mx-auto md:text-center">
        <ScrollReveal>
          <h1 className="text-5xl mb-12">
            <span className="font-typekit">A Style </span>
            <span className="font-typekit-italic">Experience.</span>
          </h1>
        </ScrollReveal>

        <ScrollReveal>
          <p className="text-base leading-relaxed">
            Every element curated with intention, inviting guests to step inside a world rather than simply watch one. Crafted to be felt not just seen.
          </p>
        </ScrollReveal>
      </div>

      {/* Image section */}
      {/* Mobile image - constrained width */}
      <div className="mt-8 max-w-3xl mx-auto md:hidden">
        <img
          src={ABOUT_IMAGE_MOBILE}
          alt="About"
          className="w-full object-cover rounded-xl"
        />
      </div>
      {/* Desktop image - full width edge to edge with center-expand reveal */}
      <div className="hidden md:block mt-10 -mx-8 px-0">
        <img
          src={ABOUT_IMAGE_DESKTOP}
          alt="About"
          className="w-full object-cover"
          style={{
            clipPath: imageRevealed 
              ? 'inset(0 0% 0 0%)' 
              : 'inset(0 30% 0 30%)',
            transition: 'clip-path 1.3s ease-out',
          }}
        />
      </div>

      {/* Text below image */}
      <div className="max-w-3xl md:max-w-6xl mx-auto mt-4 md:mt-6 text-center">
        <ScrollReveal>
          <p className="text-sm leading-relaxed">
            This January marks its debut. A new seat in fashion begins here.
          </p>
        </ScrollReveal>
      </div>
    </div>
  )
}



