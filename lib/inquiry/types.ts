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
  /**
   * Optional UI-only filter. When set, the "What best describes you?" step
   * only renders the listed inquirer types. Used by Collaborate cards that
   * pre-narrow the audience (e.g. Venues → hotel + club).
   */
  restrictTypes?: Array<'hotel' | 'club' | 'brand' | 'creative' | 'community'>
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
