import ContactContent, {
  CONTACT_FALLBACK_IMAGES,
  type ContactPerson,
} from '@/components/ContactContent'
import PreviewBanner from '@/components/admin/PreviewBanner'
import { getPageContent, isPreviewing } from '@/lib/admin/content'

export const revalidate = 60

export default async function Contact() {
  const c = await getPageContent('contact')
  const preview = await isPreviewing('contact')

  const contacts: ContactPerson[] = [
    {
      image: CONTACT_FALLBACK_IMAGES.noaCohen,
      name: c.contact_c1_name || 'Noa Cohen',
      role: c.contact_c1_role ?? 'Founder & Creative Director',
      email: c.contact_c1_email || 'noa@thefrontrow.vegas',
      instagram: c.contact_c1_instagram_handle || '@noacohen.23',
      instagramUrl:
        c.contact_c1_instagram_url || 'https://www.instagram.com/noacohen.23',
    },
    {
      image: CONTACT_FALLBACK_IMAGES.theFrontRowLv,
      name: c.contact_c2_name || 'THE FRONT ROW',
      role: c.contact_c2_role ?? '',
      email: c.contact_c2_email || 'info@thefrontrow.vegas',
      instagram: c.contact_c2_instagram_handle || '@thefrontrowlv',
      instagramUrl:
        c.contact_c2_instagram_url || 'https://www.instagram.com/thefrontrowlv',
    },
  ]

  return (
    <>
      {preview && <PreviewBanner pageLabel="Contact" />}
      <ContactContent headline={c.contact_headline || 'Contact'} contacts={contacts} />
    </>
  )
}
