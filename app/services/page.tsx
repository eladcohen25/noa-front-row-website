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
            <h2 className="text-xl font-typekit-italic">Creative Direction</h2>
            <ul className="list-disc pl-5 text-base leading-relaxed">
              <li>Concept development</li>
              <li>Visual narrative</li>
              <li>Styling direction</li>
              <li>Editorial frameworks</li>
            </ul>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className="space-y-3">
            <h2 className="text-xl font-typekit-italic">Experiential Production</h2>
            <ul className="list-disc pl-5 text-base leading-relaxed">
              <li>Runway or presentation formats</li>
              <li>Brand environments</li>
              <li>Guest experience design</li>
              <li>Creative production oversight</li>
            </ul>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className="space-y-3">
            <h2 className="text-xl font-typekit-italic">Styling</h2>
            <ul className="list-disc pl-5 text-base leading-relaxed">
              <li>Campaign styling</li>
              <li>Look development</li>
              <li>Talent dressing</li>
            </ul>
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
