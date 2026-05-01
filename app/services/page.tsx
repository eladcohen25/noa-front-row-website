import ScrollReveal from '@/components/ScrollReveal'
import PreviewBanner from '@/components/admin/PreviewBanner'
import { getPageContent, isPreviewing } from '@/lib/admin/content'

export const revalidate = 60

interface ServiceSection {
  title: string
  bullets: string
  body: string
}

function parseBullets(raw: string | undefined): string[] {
  return (raw ?? '')
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
}

export default async function Services() {
  const c = await getPageContent('services')
  const preview = await isPreviewing('services')

  const sections: ServiceSection[] = [
    {
      title: c.services_s1_title || 'Experiential Production',
      bullets: c.services_s1_bullets,
      body:
        c.services_s1_body ||
        'We oversee execution from idea to reality. The Front Row produces immersive experiences from concept to completion. Managing production, spatial design, and runway integration with precision.',
    },
    {
      title: c.services_s2_title || 'Creative Direction',
      bullets: c.services_s2_bullets,
      body:
        c.services_s2_body ||
        'We develop the concept, narrative, and visual language behind each project — from brand campaigns and editorial shoots to full-scale experiences.',
    },
    {
      title: c.services_s3_title || 'Experiential Programming',
      bullets: c.services_s3_bullets,
      body:
        c.services_s3_body ||
        'We translate creative direction into live experiences — shaping how an event unfolds, from runway structure to pacing, energy, and audience interaction.',
    },
    {
      title: c.services_s4_title || 'Brand & Runway Integration',
      bullets: c.services_s4_bullets,
      body:
        c.services_s4_body ||
        'We create opportunities for brands to live inside the experience — from runway partnerships and styled product placement to immersive activations and sponsor visibility woven throughout the event.',
    },
  ]

  return (
    <>
    {preview && <PreviewBanner pageLabel="Services" />}
    <div className="min-h-screen bg-white pt-28 md:pt-40 pb-24 px-4 md:px-8">
      <div className="max-w-3xl mx-auto md:text-center">
        <ScrollReveal>
          <h1 className="text-5xl mb-12">
            <span className="font-typekit-italic">
              {c.services_headline_italic || 'Services'}
            </span>
          </h1>
        </ScrollReveal>

        <ScrollReveal>
          <p className="text-base leading-relaxed">
            {c.services_intro ||
              'Rooted in fashion, executed like editorial, experienced in real life.'}
          </p>
        </ScrollReveal>
      </div>

      <div className="max-w-4xl mx-auto mt-12 md:mt-16 space-y-10">
        {sections.map((section, idx) => {
          const bullets = parseBullets(section.bullets)
          return (
            <ScrollReveal key={idx}>
              <div className="space-y-3">
                <h2 className="text-xl font-typekit-italic">{section.title}</h2>
                {bullets.length > 0 && (
                  <ul className="list-disc pl-5 text-base leading-relaxed">
                    {bullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                )}
                {section.body && (
                  <p className="text-base leading-relaxed mt-3 whitespace-pre-line">
                    {section.body}
                  </p>
                )}
              </div>
            </ScrollReveal>
          )
        })}

        {c.services_closing_1 && (
          <ScrollReveal>
            <p className="text-base leading-relaxed italic text-center whitespace-pre-line">
              {c.services_closing_1}
            </p>
          </ScrollReveal>
        )}

        {c.services_closing_2 && (
          <ScrollReveal>
            <p className="text-base leading-relaxed italic text-center whitespace-pre-line">
              {c.services_closing_2}
            </p>
          </ScrollReveal>
        )}
      </div>
    </div>
    </>
  )
}
