import ScrollReveal from '@/components/ScrollReveal'

export default function Tickets() {
  return (
    <div className="min-h-screen bg-white pt-32 pb-24 px-8">
      <div className="max-w-3xl mx-auto">
        <ScrollReveal>
          <h1 className="text-5xl font-la-foonte mb-12">Tickets</h1>
        </ScrollReveal>

        <ScrollReveal className="mb-8">
          <p className="text-lg leading-relaxed mb-6">
            Secure your spot at THE FRONT ROW. Early access tickets will be available soon.
          </p>
        </ScrollReveal>

        <ScrollReveal className="mb-8">
          <p className="text-lg leading-relaxed mb-6">
            Sign up for early access to be notified when tickets go on sale.
          </p>
        </ScrollReveal>

        <ScrollReveal>
          <p className="text-lg leading-relaxed">
            Limited availability. Reserve your place in the front row today.
          </p>
        </ScrollReveal>
      </div>
    </div>
  )
}



