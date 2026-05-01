import ModelForm from '@/components/models/ModelForm'
import { getPageContent } from '@/lib/admin/content'

export const revalidate = 60

export const metadata = {
  title: 'Cast with The Front Row',
  description:
    'Submit your details and recent photos. We review every submission and reach out when there\u2019s a fit.',
}

export default async function ModelsPage() {
  const c = await getPageContent('models')

  return (
    <div className="bg-white">
      <header className="max-w-3xl mx-auto px-5 md:px-12 pt-24 md:pt-32 pb-4 text-center">
        <h1 className="font-typekit text-4xl md:text-6xl leading-tight">
          {c.models_intro_headline || 'Cast with The Front Row'}
        </h1>
        {c.models_intro_body && (
          <p className="mt-5 text-base md:text-lg text-black/70 leading-relaxed max-w-xl mx-auto">
            {c.models_intro_body}
          </p>
        )}
      </header>
      <ModelForm />
    </div>
  )
}
