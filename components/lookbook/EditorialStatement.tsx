'use client'

interface EditorialStatementProps {
  paragraphs: string[]
  author: string
}

export default function EditorialStatement({ paragraphs, author }: EditorialStatementProps) {
  return (
    <section className="bg-white text-black py-12 md:py-16">
      <div className="max-w-2xl mx-auto px-6 md:px-8 text-center">
        <div className="space-y-5 md:space-y-6">
          {paragraphs.map((paragraph, index) => (
            <p
              key={index}
              className="text-sm md:text-base leading-relaxed tracking-wide text-gray-700"
              style={{ fontStyle: index === 0 ? 'italic' : 'normal' }}
            >
              {paragraph}
            </p>
          ))}
        </div>
        
        <p className="mt-8 text-sm tracking-widest uppercase text-gray-500">
          {author}
        </p>
      </div>
    </section>
  )
}
