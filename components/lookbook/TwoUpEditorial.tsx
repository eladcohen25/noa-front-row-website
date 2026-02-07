'use client'

import Image from 'next/image'

interface TwoUpEditorialProps {
  images: { src: string; alt: string }[]
}

export default function TwoUpEditorial({ images }: TwoUpEditorialProps) {
  return (
    <section className="py-8 md:py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {images.slice(0, 2).map((image, index) => (
            <div key={index} className="relative aspect-[4/5] overflow-hidden">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
