import ScrollReveal from '@/components/ScrollReveal'

// ========================================
// TICKETING LINK - Easy to update
// ========================================
const TICKETING_URL = 'https://thefrontrow.ticketspice.com/the-front-row-a-style-experience'
// ========================================

export default function Tickets() {
  return (
    <div className="min-h-screen bg-white pt-28 md:pt-40 pb-24 px-4 md:px-8">
      <div className="max-w-3xl mx-auto md:text-center">
        <ScrollReveal>
          <h1 className="text-5xl font-typekit mb-12">Tickets</h1>
        </ScrollReveal>

        <ScrollReveal>
          <p className="text-base leading-relaxed mb-10">
            Debuting January 2026 — an immersive fashion event in Las Vegas where every guest holds a front-row seat to the future.
          </p>
        </ScrollReveal>

        <ScrollReveal>
          <a
            href={TICKETING_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-block px-10 py-4 bg-black text-white text-sm tracking-widest uppercase transition-all duration-300 hover:bg-gray-900 hover:scale-[1.02]"
          >
            Get Tickets
          </a>
        </ScrollReveal>
      </div>
    </div>
  )
}



