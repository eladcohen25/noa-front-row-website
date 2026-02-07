'use client'

import { useState } from 'react'
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

// Generate runway look images (Look 1.jpg through Look 12.jpg)
const runwayImages = Array.from({ length: 12 }, (_, i) => ({
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

// Scroll images under runway (ordered: 1, 1.1, 2, 2.1, etc.)
const scrollImages = [
  { src: createImagePath('Scroll Under Runway', 'Scroll 1', 'jpg'), alt: 'Scroll 1' },
  { src: createImagePath('Scroll Under Runway', 'Scroll 1.1', 'jpg'), alt: 'Scroll 1.1' },
  { src: createImagePath('Scroll Under Runway', 'Scroll 2', 'jpg'), alt: 'Scroll 2' },
  { src: createImagePath('Scroll Under Runway', 'Scroll 2.1', 'jpg'), alt: 'Scroll 2.1' },
  { src: createImagePath('Scroll Under Runway', 'Scroll 3', 'jpg'), alt: 'Scroll 3' },
  { src: createImagePath('Scroll Under Runway', 'Scroll 3.1', 'jpg'), alt: 'Scroll 3.1' },
  { src: createImagePath('Scroll Under Runway', 'Scroll 3.2', 'jpg'), alt: 'Scroll 3.2' },
  { src: createImagePath('Scroll Under Runway', 'Scroll 4', 'jpg'), alt: 'Scroll 4' },
  { src: createImagePath('Scroll Under Runway', 'Scroll 4.1', 'jpg'), alt: 'Scroll 4.1' },
  { src: createImagePath('Scroll Under Runway', 'Scroll 5', 'jpg'), alt: 'Scroll 5' },
  { src: createImagePath('Scroll Under Runway', 'Scroll 6', 'jpg'), alt: 'Scroll 6' },
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
    videoSrc: '/lookbook/hero-video.mp4',
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

      {/* Horizontal Scroll Gallery Strip */}
      <HorizontalScrollGallery
        images={scrollImages}
        height={{ mobile: 280, desktop: 380 }}
      />

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

      {/* Bottom spacing */}
      <div className="h-24 bg-white" />

      {/* All Looks Overlay */}
      <AllLooksOverlay
        images={runwayImages}
        isOpen={overlayOpen}
        onClose={() => setOverlayOpen(false)}
        initialIndex={overlayIndex}
        initialView={overlayView}
      />
    </div>
  )
}
