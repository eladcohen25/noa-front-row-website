'use client'

import AboutContent from '@/components/AboutContent'
import { EditModeProvider } from '@/components/admin/EditModeProvider'
import EditModeToolbar from '@/components/admin/EditModeToolbar'
import LookbookContent from '@/components/LookbookContent'

interface EditModeShellProps {
  page: string
  pageLabel: string
  livePath: string
  content: Record<string, string>
}

export default function EditModeShell({ page, pageLabel, livePath, content }: EditModeShellProps) {
  return (
    <EditModeProvider isEditMode page={page} pageLabel={pageLabel} livePath={livePath}>
      <div className="bg-white -mx-6 -my-8 min-h-[60vh]">
        {page === 'home' && <HomePreview content={content} />}
        {page === 'about' && <AboutPreview content={content} />}
        {page === 'services' && <ServicesPreview content={content} />}
        {page === 'fw26' && <Fw26Preview content={content} />}
      </div>
      <EditModeToolbar />
    </EditModeProvider>
  )
}

// --- Lightweight previews that mirror the public pages, wrapping editable spans ---

import Editable from '@/components/admin/Editable'

function HomePreview({ content }: { content: Record<string, string> }) {
  return (
    <div className="px-8 py-16 text-center">
      <p className="text-[11px] uppercase tracking-[0.3em] text-zinc-500 mb-4">Home — Hero</p>
      <h1 className="text-4xl md:text-5xl font-la-foonte uppercase tracking-wide mb-6">
        <Editable contentKey="home_hero_headline" type="text" value={content.home_hero_headline}>
          {content.home_hero_headline || 'Creative Direction & Experiential Production Studio'}
        </Editable>
      </h1>
      <span className="inline-block px-8 py-3 rounded-full text-xs uppercase tracking-wider border border-black/30">
        <Editable contentKey="home_hero_cta_label" type="text" value={content.home_hero_cta_label}>
          {content.home_hero_cta_label || 'INQUIRE NOW'}
        </Editable>
      </span>
      <p className="mt-4 text-xs text-zinc-500">
        CTA links to{' '}
        <Editable contentKey="home_hero_cta_link" type="url" value={content.home_hero_cta_link}>
          {content.home_hero_cta_link || '/inquire'}
        </Editable>
      </p>
      <p className="mt-12 text-xs text-zinc-500 max-w-md mx-auto">
        The full hero (with the spotlight video) renders on the live homepage; this preview shows
        the editable text bits only.
      </p>
    </div>
  )
}

function AboutPreview({ content }: { content: Record<string, string> }) {
  // Render the real AboutContent, but wrap key strings in Editable.
  // We pass them as already-wrapped React nodes via children — but AboutContent
  // expects strings. Easiest: use AboutContent in a non-editable preview state,
  // and overlay an Editable on hover via an outer wrapper. For v1 we'll instead
  // render a structural mirror that wraps strings in Editable.
  return (
    <div className="min-h-[40vh] bg-white pt-12 pb-16 px-4 md:px-8">
      <div className="max-w-3xl mx-auto md:text-center">
        <h1 className="text-5xl mb-12">
          <span className="font-typekit">
            <Editable contentKey="about_title_part1" type="text" value={content.about_title_part1}>
              {content.about_title_part1}
            </Editable>
          </span>
          <span className="font-typekit-italic">
            <Editable contentKey="about_title_part2" type="text" value={content.about_title_part2}>
              {content.about_title_part2}
            </Editable>
          </span>
        </h1>
        <p className="text-base leading-relaxed">
          <span className="font-typekit-italic">
            <Editable contentKey="about_studio_label" type="text" value={content.about_studio_label}>
              {content.about_studio_label}
            </Editable>
          </span>
          <br />
          <Editable contentKey="about_studio_body" type="textarea" value={content.about_studio_body}>
            {content.about_studio_body}
          </Editable>
        </p>
        <div className="mt-8 text-base leading-relaxed text-left md:text-center">
          <p>
            <span className="font-typekit-italic">
              <Editable contentKey="about_founder_label" type="text" value={content.about_founder_label}>
                {content.about_founder_label}
              </Editable>
            </span>
            <br />
            <Editable contentKey="about_founder_name" type="text" value={content.about_founder_name}>
              {content.about_founder_name}
            </Editable>
            <br />
            <Editable contentKey="about_founder_role" type="text" value={content.about_founder_role}>
              {content.about_founder_role}
            </Editable>
            <br />
            <Editable contentKey="about_founder_email" type="text" value={content.about_founder_email}>
              {content.about_founder_email}
            </Editable>
          </p>
          <p className="mt-4 whitespace-pre-line">
            <Editable contentKey="about_founder_bio" type="textarea" value={content.about_founder_bio}>
              {content.about_founder_bio}
            </Editable>
          </p>
        </div>
        <p className="text-sm leading-relaxed mt-8 whitespace-pre-line">
          <Editable contentKey="about_dates" type="textarea" value={content.about_dates}>
            {content.about_dates || 'Add event dates here, one per line.'}
          </Editable>
        </p>
        <p className="text-[11px] text-zinc-400 mt-12">
          Layout images render only on the live page. Edit them via the{' '}
          <a href="/admin/content/about" className="underline">
            form editor
          </a>
          .
        </p>
      </div>
    </div>
  )
}

function ServicesPreview({ content }: { content: Record<string, string> }) {
  const sections = [1, 2, 3, 4]
  return (
    <div className="min-h-[40vh] bg-white pt-12 pb-16 px-4 md:px-8">
      <div className="max-w-3xl mx-auto md:text-center">
        <h1 className="text-5xl mb-8 font-typekit-italic">
          <Editable contentKey="services_headline_italic" type="text" value={content.services_headline_italic}>
            {content.services_headline_italic}
          </Editable>
        </h1>
        <p className="text-base leading-relaxed">
          <Editable contentKey="services_intro" type="textarea" value={content.services_intro}>
            {content.services_intro}
          </Editable>
        </p>
      </div>
      <div className="max-w-3xl mx-auto mt-10 space-y-8">
        {sections.map((n) => (
          <div key={n} className="space-y-2 border-t border-zinc-100 pt-6">
            <h2 className="text-xl font-typekit-italic">
              <Editable contentKey={`services_s${n}_title`} type="text" value={content[`services_s${n}_title`]}>
                {content[`services_s${n}_title`]}
              </Editable>
            </h2>
            <pre className="text-sm leading-relaxed whitespace-pre-wrap font-sans">
              <Editable
                contentKey={`services_s${n}_bullets`}
                type="textarea"
                value={content[`services_s${n}_bullets`]}
              >
                {content[`services_s${n}_bullets`]}
              </Editable>
            </pre>
            <p className="text-base leading-relaxed">
              <Editable
                contentKey={`services_s${n}_body`}
                type="textarea"
                value={content[`services_s${n}_body`]}
              >
                {content[`services_s${n}_body`]}
              </Editable>
            </p>
          </div>
        ))}
        <p className="italic text-center pt-4">
          <Editable contentKey="services_closing_1" type="textarea" value={content.services_closing_1}>
            {content.services_closing_1}
          </Editable>
        </p>
        <p className="italic text-center">
          <Editable contentKey="services_closing_2" type="textarea" value={content.services_closing_2}>
            {content.services_closing_2}
          </Editable>
        </p>
      </div>
    </div>
  )
}

function Fw26Preview({ content }: { content: Record<string, string> }) {
  return (
    <div className="min-h-[40vh] bg-white pt-12 pb-16 px-4 md:px-8">
      <p className="text-[11px] uppercase tracking-[0.3em] text-zinc-500 mb-2">
        <Editable contentKey="fw26_hero_label" type="text" value={content.fw26_hero_label}>
          {content.fw26_hero_label}
        </Editable>
      </p>
      <h1 className="text-5xl font-typekit mb-6">
        <Editable contentKey="fw26_hero_title" type="text" value={content.fw26_hero_title}>
          {content.fw26_hero_title}
        </Editable>
      </h1>
      <p className="text-sm text-zinc-700 mb-10">
        CTA:{' '}
        <Editable contentKey="fw26_hero_cta" type="text" value={content.fw26_hero_cta}>
          {content.fw26_hero_cta}
        </Editable>
      </p>
      <div className="max-w-2xl space-y-4 text-base leading-relaxed">
        {[1, 2, 3].map((n) => (
          <p key={n}>
            <Editable
              contentKey={`fw26_statement_p${n}`}
              type="textarea"
              value={content[`fw26_statement_p${n}`]}
            >
              {content[`fw26_statement_p${n}`]}
            </Editable>
          </p>
        ))}
        <p className="text-sm italic text-zinc-500">
          —{' '}
          <Editable contentKey="fw26_statement_author" type="text" value={content.fw26_statement_author}>
            {content.fw26_statement_author}
          </Editable>
        </p>
      </div>
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-zinc-200 rounded-md p-4">
          <p className="text-xs text-zinc-500 mb-1">Fittings</p>
          <p>
            <Editable contentKey="fw26_fittings_date" type="text" value={content.fw26_fittings_date}>
              {content.fw26_fittings_date}
            </Editable>{' '}
            ·{' '}
            <Editable contentKey="fw26_fittings_title" type="text" value={content.fw26_fittings_title}>
              {content.fw26_fittings_title}
            </Editable>
          </p>
        </div>
        <div className="border border-zinc-200 rounded-md p-4">
          <p className="text-xs text-zinc-500 mb-1">Details</p>
          <p>
            <Editable contentKey="fw26_details_date" type="text" value={content.fw26_details_date}>
              {content.fw26_details_date}
            </Editable>{' '}
            ·{' '}
            <Editable contentKey="fw26_details_title" type="text" value={content.fw26_details_title}>
              {content.fw26_details_title}
            </Editable>
          </p>
        </div>
      </div>
      <div className="mt-10 bg-black text-white p-6 rounded-md">
        <p className="text-3xl font-la-foonte uppercase tracking-wide whitespace-pre-line">
          <Editable contentKey="fw26_footer_text" type="textarea" value={content.fw26_footer_text}>
            {content.fw26_footer_text}
          </Editable>
        </p>
      </div>
    </div>
  )
}
