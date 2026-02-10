'use client'

import ScrollReveal from '@/components/ScrollReveal'
import { useState, useEffect } from 'react'

// ========================================
// ABOUT PAGE IMAGES - Easy to replace
// ========================================
const ABOUT_IMAGE_MOBILE = '/About%20Page%20Photos/noa%20duo%20red%201.jpg'
const ABOUT_IMAGE_DESKTOP = '/About%20Page%20Photos/Desktop%20Image.jpg'
const ABOUT_IMAGE_RACK = '/About%20Page%20Photos/noa%20website%20rack%20pic.jpg'
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
            <span className="font-typekit">Fashion-Forward Environments and </span>
            <span className="font-typekit-italic">Editorial Experiences.</span>
          </h1>
        </ScrollReveal>

        <ScrollReveal>
          <p className="text-base leading-relaxed">
            <span className="font-typekit-italic">The Studio</span>
            <br />
            The Front Row is a creative studio specializing in fashion-led experiences, visual storytelling, and cultural moments. Blending runway, styling, and environment design into editorial-grade productions.
          </p>
        </ScrollReveal>

        <div className="mt-8 md:mt-10 relative left-1/2 right-1/2 w-screen -translate-x-1/2">
          <img
            src={ABOUT_IMAGE_RACK}
            alt="Noa website rack"
            className="w-full object-cover"
            style={{
              clipPath: imageRevealed
                ? 'inset(0 0% 0 0%)'
                : 'inset(0 30% 0 30%)',
              transition: 'clip-path 1.3s ease-out',
            }}
          />
        </div>

        <ScrollReveal>
          <div className="mt-6 text-base leading-relaxed">
            <p>
              <span className="font-typekit-italic">Founder</span>
              <br />
              Noa Cohen
              <br />
              Creative Director & Stylist
              <br />
              <a href="mailto:noa@thefrontrow.vegas" className="underline underline-offset-4">
                noa@thefrontrow.vegas
              </a>
            </p>
            <p className="mt-4">
              Noa Cohen is a creative director and stylist working at the intersection of fashion,
              experience, and visual storytelling. With a background in business and marketing, Noa
              founded The Front Row to create editorial-grade environments that bring runway energy
              into real-world spaces. Her work centers on narrative-driven styling, immersive
              production, and culturally relevant fashion experiences.
            </p>
          </div>
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
      {/* Desktop image - full width edge to edge */}
      <div className="hidden md:block mt-10 -mx-8 px-0">
        <img
          src={ABOUT_IMAGE_DESKTOP}
          alt="About"
          className="w-full object-cover"
        />
      </div>

      {/* Text below image */}
      <div className="max-w-3xl md:max-w-6xl mx-auto mt-4 md:mt-6 text-center">
        <ScrollReveal>
          <p className="text-sm leading-relaxed">
            Oct 6 | Las Vegas | Fashion Week Watch Party
            <br />
            Jan 28 | Bel-Aire Lounge | A Style Experience
          </p>
        </ScrollReveal>
      </div>
    </div>
  )
}



