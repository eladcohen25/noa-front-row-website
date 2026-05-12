import ScrollReveal from '@/components/ScrollReveal'

interface ServiceSection {
  title: string
  bullets: string
  body: string
}

function parseBullets(raw: string | undefined): string[] {
  return (raw ?? '')
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
}

interface ServicesContentProps {
  headlineItalic: string
  intro: string
  sections: ServiceSection[]
  closing1?: string
  closing2?: string
}

export default function ServicesContent({
  headlineItalic,
  intro,
  sections,
  closing1,
  closing2,
}: ServicesContentProps) {
  return (
    <div className="bg-white pt-28 md:pt-40 pb-28 md:pb-32 px-5 md:px-12">
      <div className="max-w-3xl mx-auto md:text-center">
        <ScrollReveal>
          <h1 className="text-5xl mb-10">
            <span className="font-typekit-italic">{headlineItalic}</span>
          </h1>
        </ScrollReveal>

        <ScrollReveal>
          <p className="text-base leading-relaxed text-black/75">{intro}</p>
        </ScrollReveal>
      </div>

      {/* 2 × 2 card grid on desktop, single column on mobile. Hairline border
          on each card gives a clean editorial feel without feeling boxed-in. */}
      <div className="max-w-5xl mx-auto mt-14 md:mt-20 grid grid-cols-1 md:grid-cols-2 gap-px bg-black/10">
        {sections.map((section, idx) => {
          const bullets = parseBullets(section.bullets)
          const number = String(idx + 1).padStart(2, '0')
          return (
            <ScrollReveal key={idx}>
              <article className="h-full bg-white p-8 md:p-10 lg:p-12 transition-colors duration-500 hover:bg-[#fafafa]">
                <div className="flex items-start justify-between mb-8">
                  <span className="text-[10px] uppercase tracking-[0.4em] text-black/40">
                    {number}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.4em] text-black/40">
                    Service
                  </span>
                </div>

                <h2 className="text-2xl md:text-3xl font-typekit-italic leading-tight mb-5">
                  {section.title}
                </h2>

                {bullets.length > 0 && (
                  <ul className="space-y-2 mb-6">
                    {bullets.map((b, i) => (
                      <li
                        key={i}
                        className="text-sm md:text-base text-black/85 flex items-start gap-3 leading-relaxed"
                      >
                        <span
                          aria-hidden
                          className="mt-[0.55em] w-1 h-1 bg-black/45 rounded-full flex-shrink-0"
                        />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {section.body && (
                  <p className="text-sm md:text-[15px] leading-relaxed text-black/65 whitespace-pre-line">
                    {section.body}
                  </p>
                )}
              </article>
            </ScrollReveal>
          )
        })}
      </div>

      {(closing1 || closing2) && (
        <div className="max-w-3xl mx-auto mt-16 md:mt-20 space-y-6 text-center">
          {closing1 && (
            <ScrollReveal>
              <p className="text-base md:text-lg leading-relaxed italic text-black/70 whitespace-pre-line">
                {closing1}
              </p>
            </ScrollReveal>
          )}
          {closing2 && (
            <ScrollReveal>
              <p className="text-base md:text-lg leading-relaxed italic text-black/70 whitespace-pre-line">
                {closing2}
              </p>
            </ScrollReveal>
          )}
        </div>
      )}
    </div>
  )
}
