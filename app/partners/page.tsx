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
    name: 'Galindo Group Real Estate', 
    image: '/Partners%20Page%20Logos/galindo%20logo.png' 
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

export default function Partners() {
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

      {/* Partners Grid */}
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-16">
          {partners.map((partner, index) => (
            <ScrollReveal key={index}>
              <div className="flex flex-col items-center text-center">
                {/* Logo */}
                <div 
                  className="relative w-full mb-6"
                  style={{ 
                    maxWidth: partner.size?.width ? `${partner.size.width}px` : '200px',
                    height: partner.size?.height ? `${partner.size.height}px` : '120px'
                  }}
                >
                  <Image
                    src={partner.image}
                    alt={partner.name}
                    fill
                    className="object-contain"
                  />
                </div>

                {/* Partner Name */}
                <p className="font-typekit text-sm tracking-wide">
                  {partner.name}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </div>
  )
}



