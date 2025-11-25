import ScrollReveal from '@/components/ScrollReveal'

export default function About() {
  return (
    <div className="min-h-screen bg-white pt-32 pb-24 px-8">
      <div className="max-w-3xl mx-auto">
        <ScrollReveal>
          <h1 className="text-5xl font-la-foonte mb-12">About</h1>
        </ScrollReveal>

        <ScrollReveal className="mb-8">
          <p className="text-lg leading-relaxed mb-6">
            Welcome to THE FRONT ROW, an exclusive experience coming to Las Vegas in January 2026.
          </p>
        </ScrollReveal>

        <ScrollReveal className="mb-8">
          <p className="text-lg leading-relaxed mb-6">
            This is a premium event designed for those who appreciate the finest in entertainment and culture.
          </p>
        </ScrollReveal>

        <ScrollReveal>
          <p className="text-lg leading-relaxed">
            Join us for an unforgettable experience that will redefine what it means to be in the front row.
          </p>
        </ScrollReveal>
      </div>
    </div>
  )
}



