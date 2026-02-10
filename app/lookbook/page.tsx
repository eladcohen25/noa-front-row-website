'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  LookbookHero,
  EditorialStatement,
  ImageGridWithLightbox,
  HorizontalScrollGallery,
  TwoUpEditorial,
  SectionHeader,
  AllLooksOverlay,
} from '@/components/lookbook'

// ========================================
// IMAGE PATH HELPERS
// ========================================
// Generate image paths with URL encoding for spaces
const createImagePath = (folder: string, name: string, ext: string) => 
  `/lookbook/${folder}/${encodeURIComponent(name)}.${ext}`

// Generate runway look images (Look 1.jpg through Look 18.jpg)
const runwayImages = Array.from({ length: 18 }, (_, i) => ({
  src: createImagePath('runway', `Look ${i + 1}`, 'jpg'),
  alt: `Look ${i + 1}`,
}))

// Generate fitting images
const fittingsImages = [
  { src: createImagePath('fittings', 'Fitting 1', 'jpg'), alt: 'Fitting 1' },
  { src: createImagePath('fittings', 'Fitting 2', 'jpg'), alt: 'Fitting 2' },
  { src: createImagePath('fittings', 'Fitting 3', 'png'), alt: 'Fitting 3' },
]

// Generate detail images with mixed extensions (Detail 1-17)
const detailImages = [
  { src: createImagePath('details', 'Detail 1', 'jpg'), alt: 'Detail 1' },
  { src: createImagePath('details', 'Detail 2', 'jpg'), alt: 'Detail 2' },
  { src: createImagePath('details', 'Detail 3', 'JPEG'), alt: 'Detail 3' },
  { src: createImagePath('details', 'Detail 4', 'jpg'), alt: 'Detail 4' },
  { src: createImagePath('details', 'Detail 5', 'JPG'), alt: 'Detail 5' },
  { src: createImagePath('details', 'Detail 6', 'jpg'), alt: 'Detail 6' },
  { src: createImagePath('details', 'Detail 7', 'JPG'), alt: 'Detail 7' },
  { src: createImagePath('details', 'Detail 8', 'jpg'), alt: 'Detail 8' },
  { src: createImagePath('details', 'Detail 9', 'jpg'), alt: 'Detail 9' },
  { src: createImagePath('details', 'Detail 10', 'JPG'), alt: 'Detail 10' },
  { src: createImagePath('details', 'Detail 11', 'JPEG'), alt: 'Detail 11' },
  { src: createImagePath('details', 'Detail 12', 'jpg'), alt: 'Detail 12' },
  { src: createImagePath('details', 'Detail 13', 'jpg'), alt: 'Detail 13' },
  { src: createImagePath('details', 'Detail 14', 'JPG'), alt: 'Detail 14' },
  { src: createImagePath('details', 'Detail 15', 'JPG'), alt: 'Detail 15' },
  { src: createImagePath('details', 'Detail 16', 'JPEG'), alt: 'Detail 16' },
  { src: createImagePath('details', 'Detail 17', 'JPEG'), alt: 'Detail 17' },
]

// Partners (mirrors partners page)
const partners = [
  { name: 'Bel-Aire Lounge', image: '/Partners%20Page%20Logos/BEL-AIRE%20RENDERED.png' },
  { name: 'Durango Casino & Resort', image: '/Partners%20Page%20Logos/durango%20logo.png' },
  { name: 'Bonded Permanent Jewelry', image: '/Partners%20Page%20Logos/Bonded%20Permanent%20Jewelry.png' },
  { name: 'Highland Collection', image: '/Partners%20Page%20Logos/Highland%20Collection.png' },
  { name: 'Lights Off Media', image: '/Partners%20Page%20Logos/Lights%20Off%20Media.png' },
  { name: 'AGLOW Media Collective', image: '/Partners%20Page%20Logos/AGLOW%20Media%20Collective.png' },
  { name: 'Skin with Katy', image: '/Partners%20Page%20Logos/Skin%20with%20Katy.png' },
  { name: 'TM Soak', image: '/Partners%20Page%20Logos/TM%20SOAK.png', size: { width: 160, height: 120 } },
  { name: 'Kérastase Paris', image: '/Partners%20Page%20Logos/Kerastase-logo-1.png' },
  { name: 'Crown Affair', image: '/Partners%20Page%20Logos/crown%20affair.png' },
  { name: 'The Now', image: '/Partners%20Page%20Logos/The%20Now.png' },
  { name: 'Summer House', image: '/Partners%20Page%20Logos/Summer%20House%20logo.png' },
  { name: 'Sephora', image: '/Partners%20Page%20Logos/Sephora.jpeg' },
]

// Large photo under fittings
const largeFittingPhoto = {
  src: createImagePath('Large Photo Under Fittings', 'Big Pic 1', 'JPEG'),
  alt: 'Editorial Photo',
}

// ========================================
// LOOKBOOK DATA
// ========================================
const lookbookData = {
  // Hero Section
  hero: {
    label: 'Show',
    title: 'TFR FW26',
    videoSrc: '/lookbook/Main%20Video/Project%20Page%20main%20video.mov',
    posterSrc: '/lookbook/hero-poster.jpg',
    ctaText: 'Watch The TFR FW26 Film',
  },

  // Editorial Statement
  statement: {
    paragraphs: [
      'A lesson in restraint.',
      'Life teaches us many lessons, this runway curation explores the lesson in restraint or the journey (masa) one goes through to find their truly realized self.',
      'Beginning guarded and undone to eventually finding a minimalistic sophistication. Knowing you carry the confidence not the clothes.',
    ],
    author: 'Noa Cohen',
  },

  // Fittings Section
  fittings: {
    date: '01.21.2026',
    title: 'FITTINGS',
  },

  // Details Section
  details: {
    date: '01.28.2026',
    title: 'DETAILS',
  },
}
// ========================================

export default function Lookbook() {
  const [overlayOpen, setOverlayOpen] = useState(false)
  const [overlayView, setOverlayView] = useState<'single' | 'grid'>('grid')
  const [overlayIndex, setOverlayIndex] = useState(0)

  // Open overlay in single view when clicking a runway image
  const handleImageClick = (index: number) => {
    setOverlayIndex(index)
    setOverlayView('single')
    setOverlayOpen(true)
  }

  // Open overlay in grid view when clicking "See All"
  const handleSeeAll = () => {
    setOverlayIndex(0)
    setOverlayView('grid')
    setOverlayOpen(true)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <LookbookHero
        label={lookbookData.hero.label}
        title={lookbookData.hero.title}
        videoSrc={lookbookData.hero.videoSrc}
        posterSrc={lookbookData.hero.posterSrc}
        ctaText={lookbookData.hero.ctaText}
      />

      {/* Editorial Statement */}
      <EditorialStatement
        paragraphs={lookbookData.statement.paragraphs}
        author={lookbookData.statement.author}
      />

      {/* Runway Grid - Show first 12, click to open single view */}
      <ImageGridWithLightbox 
        images={runwayImages.slice(0, 12)} 
        onImageClick={handleImageClick}
      />

      {/* See All Button */}
      <div className="bg-white py-8 text-center">
        <button
          onClick={handleSeeAll}
          className="inline-flex items-center gap-2 text-sm tracking-wider text-gray-600 hover:text-black transition-colors group"
        >
          <span className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[6px] border-l-current border-b-[4px] border-b-transparent" />
          <span className="underline underline-offset-4">See All</span>
        </button>
      </div>

      {/* Fittings Section */}
      <SectionHeader
        date={lookbookData.fittings.date}
        title={lookbookData.fittings.title}
      />
      <TwoUpEditorial images={fittingsImages.slice(0, 2)} />

      {/* Large Editorial Photo - Full vertical display */}
      <div className="bg-white py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <img
            src={largeFittingPhoto.src}
            alt={largeFittingPhoto.alt}
            className="w-full h-auto"
          />
        </div>
      </div>

      {/* Details Section */}
      <SectionHeader
        date={lookbookData.details.date}
        title={lookbookData.details.title}
      />
      <HorizontalScrollGallery
        images={detailImages}
        height={{ mobile: 320, desktop: 420 }}
      />

      {/* Partners Section */}
      <SectionHeader title="Partners" />
      <div className="bg-white pb-16 md:pb-24 px-4 md:px-8">
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
      </div>

      {/* Bottom spacing */}
      <div className="h-24 bg-white" />

      {/* Footer */}
      <div className="bg-black py-16 md:py-24 px-6 md:px-12">
        <div className="max-w-3xl text-left">
          <p className="text-4xl md:text-6xl font-la-foonte uppercase tracking-wide text-white leading-tight">
            Editorial experiences in real life
          </p>
          <div className="mt-10 flex items-center gap-8">
            <a
              href="https://www.instagram.com/thefrontrowlv"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-white"
            >
              <Image
                src="/Contact%20Page%20Photos/instagram-icon.png"
                alt="Instagram"
                width={18}
                height={18}
                className="invert"
              />
              Instagram
            </a>
            <a
              href="mailto:info@thefrontrow.vegas"
              className="text-sm uppercase tracking-[0.3em] text-white"
            >
              info@thefrontrow.vegas
            </a>
          </div>
        </div>
      </div>

      {/* All Looks Overlay */}
      <AllLooksOverlay
        images={runwayImages}
        isOpen={overlayOpen}
        onClose={() => setOverlayOpen(false)}
        initialIndex={overlayIndex}
        initialView={overlayView}
      />

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
