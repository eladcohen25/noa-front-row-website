'use client'

import ScrollReveal from '@/components/ScrollReveal'
import Image from 'next/image'

// ========================================
// PARTNERS - Easy to add more partners here
// ========================================
const partners = [
  { 
    name: 'Bel-Aire Lounge', 
    image: '/Partners%20Page%20Logos/BEL-AIRE%20RENDERED.png' 
  },
  { 
    name: 'Durango Casino & Resort', 
    image: '/Partners%20Page%20Logos/durango%20logo.png' 
  },
  { 
    name: 'Bonded Permanent Jewelry', 
    image: '/Partners%20Page%20Logos/Bonded%20Permanent%20Jewelry.png' 
  },
  { 
    name: 'Highland Collection', 
    image: '/Partners%20Page%20Logos/Highland%20Collection.png' 
  },
  { 
    name: 'Lights Off Media', 
    image: '/Partners%20Page%20Logos/Lights%20Off%20Media.png' 
  },
  { 
    name: 'AGLOW Media Collective', 
    image: '/Partners%20Page%20Logos/AGLOW%20Media%20Collective.png' 
  },
  { 
    name: 'Skin with Katy', 
    image: '/Partners%20Page%20Logos/Skin%20with%20Katy.png' 
  },
  { 
    name: 'TM Soak', 
    image: '/Partners%20Page%20Logos/TM%20SOAK.png',
    size: { width: 160, height: 120 }
  },
  { 
    name: 'Kérastase Paris', 
    image: '/Partners%20Page%20Logos/Kerastase-logo-1.png' 
  },
  { 
    name: 'Crown Affair', 
    image: '/Partners%20Page%20Logos/crown%20affair.png' 
  },
  { 
    name: 'The Now', 
    image: '/Partners%20Page%20Logos/The%20Now.png' 
  },
  { 
    name: 'Summer House', 
    image: '/Partners%20Page%20Logos/Summer%20House%20logo.png' 
  },
  { 
    name: 'Sephora', 
    image: '/Partners%20Page%20Logos/Sephora.jpeg' 
  },
]
// ========================================

// ========================================
// PAGE VISIBILITY TOGGLE
// Set to true to show the Partners page
// ========================================
const SHOW_PARTNERS_PAGE = false
// ========================================

export default function Partners() {
  if (!SHOW_PARTNERS_PAGE) {
    return null
  }
  return (
    <div className="min-h-screen bg-white pt-28 md:pt-40 pb-24 px-4 md:px-8">
      <div className="max-w-3xl mx-auto md:text-center mb-16">
        <ScrollReveal>
          <h1 className="text-5xl font-typekit-italic mb-12">Partners</h1>
        </ScrollReveal>

        <ScrollReveal>
          <p className="font-typekit text-lg leading-relaxed tracking-wide">
            The community elevating the experience.
          </p>
        </ScrollReveal>
      </div>

      {/* Partners Scroll (auto, side-by-side) */}
      <div className="max-w-6xl mx-auto">
        <div className="partners-marquee">
          <div className="partners-marquee__inner">
            <div className="partners-marquee__track">
              {partners.map((partner) => (
                <div key={partner.name} className="partner-item">
                  <div
                    className="relative w-full mb-4"
                    style={{
                      maxWidth: partner.size?.width ? `${partner.size.width}px` : '200px',
                      height: partner.size?.height ? `${partner.size.height}px` : '120px',
                    }}
                  >
                    <Image src={partner.image} alt={partner.name} fill className="object-contain" />
                  </div>
                  <p className="font-typekit text-sm tracking-wide text-center">{partner.name}</p>
                </div>
              ))}
            </div>
            <div className="partners-marquee__track" aria-hidden="true">
              {partners.map((partner) => (
                <div key={`${partner.name}-dup`} className="partner-item">
                  <div
                    className="relative w-full mb-4"
                    style={{
                      maxWidth: partner.size?.width ? `${partner.size.width}px` : '200px',
                      height: partner.size?.height ? `${partner.size.height}px` : '120px',
                    }}
                  >
                    <Image src={partner.image} alt={partner.name} fill className="object-contain" />
                  </div>
                  <p className="font-typekit text-sm tracking-wide text-center">{partner.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .partners-marquee {
          overflow: hidden;
          width: 100%;
        }
        .partners-marquee__inner {
          display: flex;
          align-items: center;
          width: max-content;
          animation: partners-scroll 35s linear infinite;
          will-change: transform;
        }
        .partners-marquee__track {
          display: flex;
          align-items: center;
          gap: 48px;
          padding: 12px 0;
          white-space: nowrap;
        }
        .partner-item {
          flex: 0 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-width: 220px;
        }
        @keyframes partners-scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        @media (max-width: 768px) {
          .partners-marquee__inner {
            animation-duration: 45s;
          }
          .partners-marquee__track {
            gap: 32px;
          }
          .partner-item {
            min-width: 180px;
          }
        }
      `}</style>
    </div>
  )
}



