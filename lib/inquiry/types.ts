export type {
  InquirerType,
  Inquiry,
  HotelDetails,
  ClubDetails,
  BrandDetails,
  CreativeDetails,
  CommunityDetails,
  Contact,
} from './schema'

export interface InquiryFormState {
  inquirerType?: 'hotel' | 'club' | 'brand' | 'creative' | 'community'
  details: Record<string, unknown>
  contact: Partial<{
    name: string
    email: string
    phone: string
    city: string
    howHeard: string
  }>
  files: File[]
  website: string
}
