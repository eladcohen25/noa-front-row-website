import Hero from '@/components/Hero'
import LogoHeader from '@/components/LogoHeader'
import PreviewBanner from '@/components/admin/PreviewBanner'
import { getPageContent, isPreviewing } from '@/lib/admin/content'

// Re-render at most once per minute so CMS edits show up automatically.
// Saving in /admin/content also explicitly revalidates this path.
export const revalidate = 60

export default async function Home() {
  const c = await getPageContent('home')
  const preview = await isPreviewing('home')
  return (
    <div className="relative h-screen w-full">
      {preview && <PreviewBanner pageLabel="Home" />}
      <LogoHeader />
      <Hero
        headline={c.home_hero_headline}
        ctaLabel={c.home_hero_cta_label}
        ctaHref={c.home_hero_cta_link}
      />
    </div>
  )
}
