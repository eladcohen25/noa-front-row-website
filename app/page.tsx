import Hero from '@/components/Hero'
import AboutContent from '@/components/AboutContent'
import ServicesContent from '@/components/ServicesContent'
import LookbookContent from '@/components/LookbookContent'
import CollaborateSection from '@/components/CollaborateSection'
import WorkSection, { type WorkProject } from '@/components/WorkSection'
import SiteFooter from '@/components/SiteFooter'
import PreviewBanner from '@/components/admin/PreviewBanner'
import { getPageContent, isPreviewing } from '@/lib/admin/content'

// Re-render at most once per minute so CMS edits show up automatically.
// Saving in /admin/content also explicitly revalidates this path.
export const revalidate = 60

export default async function Home() {
  // Fetch all section content in parallel. The "contact" CMS slice now drives
  // the SiteFooter (email + Instagram) instead of a dedicated section.
  const [home, about, services, fw26, contact, preview] = await Promise.all([
    getPageContent('home'),
    getPageContent('about'),
    getPageContent('services'),
    getPageContent('fw26'),
    getPageContent('contact'),
    isPreviewing('home'),
  ])

  const serviceSections = [
    {
      title: services.services_s1_title || 'Experiential Production',
      bullets: services.services_s1_bullets,
      body:
        services.services_s1_body ||
        'We oversee execution from idea to reality. The Front Row produces immersive experiences from concept to completion. Managing production, spatial design, and runway integration with precision.',
    },
    {
      title: services.services_s2_title || 'Creative Direction',
      bullets: services.services_s2_bullets,
      body:
        services.services_s2_body ||
        'We develop the concept, narrative, and visual language behind each project — from brand campaigns and editorial shoots to full-scale experiences.',
    },
    {
      title: services.services_s3_title || 'Experiential Programming',
      bullets: services.services_s3_bullets,
      body:
        services.services_s3_body ||
        'We translate creative direction into live experiences — shaping how an event unfolds, from runway structure to pacing, energy, and audience interaction.',
    },
    {
      title: services.services_s4_title || 'Brand & Runway Integration',
      bullets: services.services_s4_bullets,
      body:
        services.services_s4_body ||
        'We create opportunities for brands to live inside the experience — from runway partnerships and styled product placement to immersive activations and sponsor visibility woven throughout the event.',
    },
  ]

  const statementParagraphs = [
    fw26.fw26_statement_p1 || 'A lesson in restraint.',
    fw26.fw26_statement_p2 ||
      'Life teaches us many lessons, this runway curation explores the lesson in restraint or the journey (masa) one goes through to find their truly realized self.',
    fw26.fw26_statement_p3 ||
      'Beginning guarded and undone to eventually finding a minimalistic sophistication. Knowing you carry the confidence not the clothes.',
  ].filter(Boolean)

  // Project deck for the Work section. Each project carries its own case-
  // study content so the WorkSection can swap between the gallery and the
  // selected project without reaching into the rest of the page tree.
  const workProjects: WorkProject[] = [
    {
      id: 'fw26',
      title: 'FW26 @ Bel-Aire',
      subtitle: '01.21.2026 · Las Vegas',
      coverImage: '/lookbook/runway/Look%201.jpg',
      content: (
        <LookbookContent
          heroLabel={fw26.fw26_hero_label || 'Show'}
          heroTitle={fw26.fw26_hero_title || 'TFR FW26'}
          heroCta={fw26.fw26_hero_cta || 'Watch The TFR FW26 Film'}
          statementParagraphs={statementParagraphs}
          statementAuthor={fw26.fw26_statement_author || 'Noa Cohen'}
          fittingsDate={fw26.fw26_fittings_date || '01.21.2026'}
          fittingsTitle={fw26.fw26_fittings_title || 'FITTINGS'}
          detailsDate={fw26.fw26_details_date || '01.28.2026'}
          detailsTitle={fw26.fw26_details_title || 'DETAILS'}
          footerText={fw26.fw26_footer_text || 'Editorial experiences in real life'}
        />
      ),
    },
  ]

  return (
    <>
      {preview && <PreviewBanner pageLabel="Home" />}

      <section id="home" className="relative">
        <Hero
          headline={home.home_hero_headline}
          ctaLabel={home.home_hero_cta_label}
          ctaHref={home.home_hero_cta_link}
        />
      </section>

      {/* Work sits directly under the hero so it's the first thing visitors
          land on after entering the site. Section id stays "lookbook" so the
          existing Work nav anchor (#lookbook) keeps working. */}
      <section id="lookbook">
        <WorkSection projects={workProjects} />
      </section>

      <section id="about">
        <AboutContent
          titlePart1={about.about_title_part1}
          titlePart2={about.about_title_part2}
          studioLabel={about.about_studio_label}
          studioBody={about.about_studio_body}
          image1={about.about_image_1}
          founderLabel={about.about_founder_label}
          founderName={about.about_founder_name}
          founderRole={about.about_founder_role}
          founderEmail={about.about_founder_email}
          founderBio={about.about_founder_bio}
          image2={about.about_image_2}
          dates={about.about_dates}
        />
      </section>

      <section id="services">
        <ServicesContent
          headlineItalic={services.services_headline_italic || 'Services'}
          intro={
            services.services_intro ||
            'Rooted in fashion, executed like editorial, experienced in real life.'
          }
          sections={serviceSections}
          closing1={services.services_closing_1}
          closing2={services.services_closing_2}
        />
      </section>

      {/* Collaborate hub — four cards route to the right form. Section id
          stays "models" so the existing /#models nav anchor keeps working.
          Uses the component's "Work with us" defaults; the previous models-
          only CMS copy is intentionally bypassed since this section now
          covers all four collaboration paths. */}
      <section id="models">
        <CollaborateSection />
      </section>

      <SiteFooter
        email={contact.contact_c2_email || 'info@thefrontrow.vegas'}
        instagramHandle={contact.contact_c2_instagram_handle || '@thefrontrowlv'}
        instagramUrl={
          contact.contact_c2_instagram_url ||
          'https://www.instagram.com/thefrontrowlv'
        }
      />
    </>
  )
}
