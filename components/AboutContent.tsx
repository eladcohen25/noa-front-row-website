'use client'

import ScrollReveal from '@/components/ScrollReveal'
import { useEffect, useRef, useState } from 'react'

const FALLBACK_IMAGE_FIRST = '/About%20Page%20Photos/TFR%20-258%20copy.jpg'
const FALLBACK_IMAGE_SECOND = '/About%20Page%20Photos/noa%20website%20rack%20pic.jpg'

interface AboutContentProps {
  titlePart1?: string
  titlePart2?: string
  studioLabel?: string
  studioBody?: string
  image1?: string
  founderLabel?: string
  founderName?: string
  founderRole?: string
  founderEmail?: string
  founderBio?: string
  image2?: string
  dates?: string
}

export default function AboutContent({
  titlePart1,
  titlePart2,
  studioLabel,
  studioBody,
  image1,
  founderLabel,
  founderName,
  founderRole,
  founderEmail,
  founderBio,
  image2,
  dates,
}: AboutContentProps) {
  const [imageRevealed, setImageRevealed] = useState(false)
  const imageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const node = imageRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setImageRevealed(true)
            observer.disconnect()
            break
          }
        }
      },
      { threshold: 0.15 }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const image1Src = image1 || FALLBACK_IMAGE_FIRST
  const image2Src = image2 || FALLBACK_IMAGE_SECOND
  const dateLines = (dates ?? '').split(/\r?\n/).filter(Boolean)

  return (
    <div className="min-h-screen bg-white pt-28 md:pt-40 pb-24 px-4 md:px-8">
      <div className="max-w-3xl mx-auto md:text-center">
        <ScrollReveal>
          <h1 className="text-5xl mb-12">
            <span className="font-typekit">{titlePart1}</span>
            <span className="font-typekit-italic">{titlePart2}</span>
          </h1>
        </ScrollReveal>

        <ScrollReveal>
          <p className="text-base leading-relaxed">
            <span className="font-typekit-italic">{studioLabel}</span>
            <br />
            {studioBody}
          </p>
        </ScrollReveal>

        <div
          ref={imageRef}
          className="mt-8 md:mt-10 relative left-1/2 right-1/2 w-screen -translate-x-1/2"
        >
          <img
            src={image1Src}
            alt="About"
            loading="lazy"
            decoding="async"
            className="w-full object-cover"
            style={{
              clipPath: imageRevealed ? 'inset(0 0% 0 0%)' : 'inset(0 30% 0 30%)',
              transition: 'clip-path 1.3s ease-out',
            }}
          />
        </div>

        <ScrollReveal>
          <div className="mt-6 text-base leading-relaxed">
            <p>
              <span className="font-typekit-italic">{founderLabel}</span>
              <br />
              {founderName}
              <br />
              {founderRole}
              <br />
              {founderEmail && (
                <a
                  href={`mailto:${founderEmail}`}
                  className="underline underline-offset-4"
                >
                  {founderEmail}
                </a>
              )}
            </p>
            <p className="mt-4 whitespace-pre-line">{founderBio}</p>
          </div>
        </ScrollReveal>
      </div>

      <div className="mt-8 md:mt-10 relative left-1/2 right-1/2 w-screen -translate-x-1/2">
        <img
          src={image2Src}
          alt="About"
          loading="lazy"
          decoding="async"
          className="w-full object-cover"
        />
      </div>

      <div className="max-w-3xl md:max-w-6xl mx-auto mt-4 md:mt-6 text-center">
        <ScrollReveal>
          <p className="text-sm leading-relaxed">
            {dateLines.map((line, i) => (
              <span key={i}>
                {line}
                {i < dateLines.length - 1 && <br />}
              </span>
            ))}
          </p>
        </ScrollReveal>
      </div>
    </div>
  )
}
