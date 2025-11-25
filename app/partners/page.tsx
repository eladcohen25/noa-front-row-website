import ScrollReveal from '@/components/ScrollReveal'

export default function Partners() {
  return (
    <div className="min-h-screen bg-white pt-32 pb-24 px-8">
      <div className="max-w-3xl mx-auto">
        <ScrollReveal>
          <h1 className="text-5xl font-la-foonte mb-12">Partners</h1>
        </ScrollReveal>

        <ScrollReveal className="mb-8">
          <p className="text-lg leading-relaxed mb-6">
            THE FRONT ROW is made possible through partnerships with leading brands and organizations.
          </p>
        </ScrollReveal>

        <ScrollReveal className="mb-8">
          <p className="text-lg leading-relaxed mb-6">
            Interested in becoming a partner? We'd love to hear from you.
          </p>
        </ScrollReveal>

        <ScrollReveal>
          <p className="text-lg leading-relaxed">
            Contact us to explore partnership opportunities and join us in creating an exceptional experience.
          </p>
        </ScrollReveal>
      </div>
    </div>
  )
}



