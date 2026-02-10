"use client"

import ScrollReveal from "@/components/ScrollReveal"
import Image from "next/image"

const EXPERIENCE_IMAGES = [
  "/Expirience%20Page%20Photos/TFR-119%20copy.jpg",
  "/Expirience%20Page%20Photos/TFR-183%20copy.jpg",
]

export default function Experiences() {
  return (
    <div className="min-h-screen bg-white pt-28 md:pt-40 pb-24 px-4 md:px-8">
      <div className="max-w-3xl mx-auto md:text-center">
        <ScrollReveal>
          <h1 className="text-5xl mb-12">
            <span className="font-typekit-italic">Experiences</span>
          </h1>
        </ScrollReveal>

        <ScrollReveal>
          <p className="text-base leading-relaxed">
            Partnering with brands, designers, and cultural creatives to produce editorial fashion experiences.
          </p>
        </ScrollReveal>
      </div>

      <div className="max-w-3xl mx-auto mt-10 md:mt-14 text-center">
        <ScrollReveal>
          <p className="text-base leading-relaxed text-gray-600">
            We design immersive moments that translate creative vision into real-world impact — blending
            runway, styling, narrative, and environment into elevated cultural experiences.
          </p>
        </ScrollReveal>
      </div>

      <div className="max-w-5xl mx-auto mt-10 md:mt-16 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12">
        <div className="space-y-6">
          <div className="relative w-full aspect-[4/5] bg-gray-100">
            <Image src={EXPERIENCE_IMAGES[0]} alt="Experience" fill className="object-cover" />
          </div>
          <ScrollReveal>
            <div className="space-y-3">
              <h2 className="text-xl font-typekit-italic">Concept & Creative Direction</h2>
              <p className="text-base leading-relaxed">
                Every experience begins with a story.
                <br />
                We lead concept development from the ground up. Through visual narratives, editorial
                frameworks, and creative direction guiding the full experience.
              </p>
            </div>
          </ScrollReveal>
        </div>

        <div className="space-y-6">
          <div className="relative w-full aspect-[4/5] bg-gray-100">
            <Image src={EXPERIENCE_IMAGES[1]} alt="Experience" fill className="object-cover" />
          </div>
          <ScrollReveal>
            <div className="space-y-3">
              <h2 className="text-xl font-typekit-italic">Production</h2>
              <p className="text-base leading-relaxed">
                We oversee execution from idea to reality.
                <br />
                The Front Row manages end-to-end production, translating creative direction into immersive
                experiences.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-12 md:mt-16">
        <ScrollReveal>
          <p className="text-lg md:text-xl leading-relaxed font-typekit-italic">
            We assemble and direct creative teams — including models, hair and makeup artists, and production
            support — to execute each experience with editorial consistency and visual cohesion.
            <br />
            <br />
            Designed to be felt in person and live beyond one moment
          </p>
        </ScrollReveal>
      </div>
    </div>
  )
}
