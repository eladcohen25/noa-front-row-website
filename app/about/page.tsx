import AboutContent from '@/components/AboutContent'
import PreviewBanner from '@/components/admin/PreviewBanner'
import { getPageContent, isPreviewing } from '@/lib/admin/content'

export const revalidate = 60

export default async function About() {
  const c = await getPageContent('about')
  const preview = await isPreviewing('about')
  return (
    <>
      {preview && <PreviewBanner pageLabel="About" />}
    <AboutContent
      titlePart1={c.about_title_part1}
      titlePart2={c.about_title_part2}
      studioLabel={c.about_studio_label}
      studioBody={c.about_studio_body}
      image1={c.about_image_1}
      founderLabel={c.about_founder_label}
      founderName={c.about_founder_name}
      founderRole={c.about_founder_role}
      founderEmail={c.about_founder_email}
      founderBio={c.about_founder_bio}
      image2={c.about_image_2}
      dates={c.about_dates}
    />
    </>
  )
}
