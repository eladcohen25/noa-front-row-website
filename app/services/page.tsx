'use client'

import ScrollReveal from '@/components/ScrollReveal'

export default function Services() {
  return (
    <div className="min-h-screen bg-white pt-28 md:pt-40 pb-24 px-4 md:px-8">
      <div className="max-w-3xl mx-auto md:text-center">
        <ScrollReveal>
          <h1 className="text-5xl mb-12">
            <span className="font-typekit-italic">Services</span>
          </h1>
        </ScrollReveal>

        <ScrollReveal>
          <p className="text-base leading-relaxed">
            Rooted in fashion, executed like editorial, experienced in real life.
          </p>
        </ScrollReveal>
      </div>

      <div className="max-w-4xl mx-auto mt-12 md:mt-16 space-y-10">
        <ScrollReveal>
          <div className="space-y-3">
            <h2 className="text-xl font-typekit-italic">Experiential Production</h2>
            <ul className="list-disc pl-5 text-base leading-relaxed">
              <li>End-to-end concept + execution</li>
              <li>Runway integration</li>
              <li>Guest flow & environment design</li>
            </ul>
            <p className="text-base leading-relaxed mt-3">
              We oversee execution from idea to reality. The Front Row produces immersive experiences from concept to completion. Managing production, spatial design, and runway integration with precision.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className="space-y-3">
            <h2 className="text-xl font-typekit-italic">Creative Direction</h2>
            <ul className="list-disc pl-5 text-base leading-relaxed">
              <li>Editorial concept development</li>
              <li>Campaign & shoot direction</li>
              <li>Visual identity & storytelling</li>
            </ul>
            <p className="text-base leading-relaxed mt-3">
              We develop the concept, narrative, and visual language behind each project — from brand campaigns and editorial shoots to full-scale experiences.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className="space-y-3">
            <h2 className="text-xl font-typekit-italic">Experiential Programming</h2>
            <ul className="list-disc pl-5 text-base leading-relaxed">
              <li>On going and project based</li>
              <li>Runway & event programming</li>
              <li>Guest experience design</li>
            </ul>
            <p className="text-base leading-relaxed mt-3">
              We translate creative direction into live experiences — shaping how an event unfolds, from runway structure to pacing, energy, and audience interaction.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className="space-y-3">
            <h2 className="text-xl font-typekit-italic">Brand & Runway Integration</h2>
            <ul className="list-disc pl-5 text-base leading-relaxed">
              <li>Runway Partners</li>
              <li>Sponsor placements</li>
              <li>Guest activations</li>
              <li>Strategic partnerships</li>
            </ul>
            <p className="text-base leading-relaxed mt-3">
              We create opportunities for brands to live inside the experience — from runway partnerships and styled product placement to immersive activations and sponsor visibility woven throughout the event.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <p className="text-base leading-relaxed italic text-center">
            We assemble and direct creative teams — including models, hair and makeup artists, and production support — to execute each experience with editorial consistency and visual cohesion.
          </p>
        </ScrollReveal>

        <ScrollReveal>
          <p className="text-base leading-relaxed italic text-center">
            Designed to be felt in person and live beyond one moment
          </p>
        </ScrollReveal>
      </div>
    </div>
  )
}
