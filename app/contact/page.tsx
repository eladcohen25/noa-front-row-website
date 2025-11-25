import ScrollReveal from '@/components/ScrollReveal'

export default function Contact() {
  return (
    <div className="min-h-screen bg-white pt-32 pb-24 px-8">
      <div className="max-w-3xl mx-auto">
        <ScrollReveal>
          <h1 className="text-5xl font-la-foonte mb-12">Contact</h1>
        </ScrollReveal>

        <ScrollReveal className="mb-8">
          <p className="text-lg leading-relaxed mb-6">
            Get in touch with THE FRONT ROW team.
          </p>
        </ScrollReveal>

        <ScrollReveal className="mb-8">
          <p className="text-lg leading-relaxed mb-6">
            For inquiries about tickets, partnerships, or general information, please reach out to us.
          </p>
        </ScrollReveal>

        <ScrollReveal>
          <p className="text-lg leading-relaxed">
            We look forward to hearing from you.
          </p>
        </ScrollReveal>
      </div>
    </div>
  )
}



