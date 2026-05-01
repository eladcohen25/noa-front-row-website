import type { Metadata } from 'next'
import InquiryForm from '@/components/inquiry/InquiryForm'

export const metadata: Metadata = {
  title: 'Inquire — The Front Row',
  description: 'Tell us about your project, property, brand, or community.',
}

export default function InquirePage() {
  return <InquiryForm />
}
