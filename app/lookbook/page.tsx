import LookbookContent from '@/components/LookbookContent'
import PreviewBanner from '@/components/admin/PreviewBanner'
import { getPageContent, isPreviewing } from '@/lib/admin/content'

export const revalidate = 60

export default async function Lookbook() {
  const c = await getPageContent('fw26')
  const preview = await isPreviewing('fw26')

  const statementParagraphs = [
    c.fw26_statement_p1 || 'A lesson in restraint.',
    c.fw26_statement_p2 ||
      'Life teaches us many lessons, this runway curation explores the lesson in restraint or the journey (masa) one goes through to find their truly realized self.',
    c.fw26_statement_p3 ||
      'Beginning guarded and undone to eventually finding a minimalistic sophistication. Knowing you carry the confidence not the clothes.',
  ].filter(Boolean)

  return (
    <>
    {preview && <PreviewBanner pageLabel="FW26 @ Bel-Aire" />}
    <LookbookContent
      heroLabel={c.fw26_hero_label || 'Show'}
      heroTitle={c.fw26_hero_title || 'TFR FW26'}
      heroCta={c.fw26_hero_cta || 'Watch The TFR FW26 Film'}
      statementParagraphs={statementParagraphs}
      statementAuthor={c.fw26_statement_author || 'Noa Cohen'}
      fittingsDate={c.fw26_fittings_date || '01.21.2026'}
      fittingsTitle={c.fw26_fittings_title || 'FITTINGS'}
      detailsDate={c.fw26_details_date || '01.28.2026'}
      detailsTitle={c.fw26_details_title || 'DETAILS'}
      footerText={c.fw26_footer_text || 'Editorial experiences in real life'}
    />
    </>
  )
}
