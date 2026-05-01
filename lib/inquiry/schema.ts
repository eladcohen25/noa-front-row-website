import { z } from 'zod'

export const ATTENDANCE_OPTIONS = [
  'Under 50',
  '50–150',
  '150–300',
  '300–500',
  '500+',
] as const

export const EVENT_TIMELINE_OPTIONS = [
  'Within 30 days',
  '1–3 months',
  '3–6 months',
  '6+ months',
  'Flexible',
] as const

export const DECISION_TIMELINE_OPTIONS = [
  'Ready to move now',
  'Within 2 weeks',
  'Within a month',
  'Just exploring',
] as const

export const BUDGET_OPTIONS = [
  'Under $5,000',
  '$5,000 – $15,000',
  '$15,000 – $30,000',
  '$30,000 – $75,000',
  '$75,000+',
  'Prefer to discuss',
] as const

export const BRAND_BUDGET_OPTIONS = [
  'Under $5,000',
  '$5,000 – $15,000',
  '$15,000 – $30,000',
  '$30,000+',
  'Prefer to discuss',
] as const

export const HOW_HEARD_OPTIONS = [
  'Instagram',
  'Referral',
  'Press',
  'Event',
  'Search',
  'Other',
] as const

export const HOTEL_ACTIVATION_TYPES = [
  'Runway presentation',
  'Branded programming',
  'One-off editorial event',
  'Ongoing creative partnership',
  'Not sure yet — open to ideas',
] as const

export const HOTEL_GOALS = [
  'Drive F&B revenue',
  'Increase brand or property awareness',
  'Generate social coverage',
  'Attract new clientele',
  'Differentiate the property from competitors',
  'Create a recurring cultural moment',
] as const

export const CLUB_ACTIVATION_TYPES = [
  'Seasonal cultural moments calendar',
  'Designer or creative residency',
  'Intimate editorial dinners',
  'Member-facing runway or presentation',
  'A recurring fashion or lifestyle series',
  'Open to a fully custom concept',
] as const

export const CLUB_ENGAGEMENT_TYPES = [
  'One-time activation',
  'A short pilot series (2–3 events)',
  'Ongoing partnership',
  'Not sure yet',
] as const

export const BRAND_CATEGORIES = [
  'Fashion / apparel',
  'Beauty / fragrance',
  'Food & beverage',
  'Hospitality / travel',
  'Spirits',
  'Lifestyle',
  'Tech',
  'Other',
] as const

export const BRAND_ACTIVATION_TYPES = [
  'Sponsor a TFR event (presenting, title, or supporting sponsor)',
  'Editorial shoot sponsorship or creative direction',
  'Style or dress talent for a production',
  'Brand activation or installation at an event',
  'Product placement or gifting',
  'Full co-production of an experience',
  'Open to a proposal',
  'Other',
] as const

export const CREATIVE_ROLES = [
  'Model',
  'Photographer',
  'Stylist',
  'Hair',
  'Makeup',
  'Director / DP',
  'Producer',
  'Designer',
  'Other',
] as const

export const COMMUNITY_INVOLVEMENT = [
  'Press / media',
  'Volunteer / intern',
  'Content collaborator',
  'Attend events',
  'Other',
] as const

const urlField = z
  .string()
  .min(1, 'Required')
  .transform((v) => (v.startsWith('http://') || v.startsWith('https://') ? v : `https://${v}`))
  .refine((v) => /^https?:\/\/[^\s.]+\.[^\s]+/.test(v), 'Enter a valid link')

const phoneField = z
  .string()
  .optional()
  .refine(
    (v) => !v || v.replace(/\D/g, '').length >= 7,
    'Enter a valid phone number',
  )

const emailField = z.string().email('Enter a valid email')

const contactSchema = z.object({
  name: z.string().min(1, 'Required'),
  email: emailField,
  phone: phoneField,
  city: z.string().min(1, 'Required'),
  howHeard: z.enum(HOW_HEARD_OPTIONS).optional(),
})

const baseDetails = {
  additionalNotes: z.string().optional(),
}

export const hotelDetailsSchema = z.object({
  propertyName: z.string().min(1, 'Required'),
  spaceType: z.string().min(1, 'Required'),
  activationTypes: z.array(z.enum(HOTEL_ACTIVATION_TYPES)).min(1, 'Pick at least one'),
  expectedAttendance: z.enum(ATTENDANCE_OPTIONS),
  eventTimeline: z.enum(EVENT_TIMELINE_OPTIONS),
  budget: z.enum(BUDGET_OPTIONS),
  goals: z.array(z.enum(HOTEL_GOALS)).min(1, 'Pick at least one'),
  ...baseDetails,
})

export const clubDetailsSchema = z.object({
  clubName: z.string().min(1, 'Required'),
  activationTypes: z.array(z.enum(CLUB_ACTIVATION_TYPES)).min(1, 'Pick at least one'),
  engagementType: z.enum(CLUB_ENGAGEMENT_TYPES),
  expectedAttendance: z.enum(ATTENDANCE_OPTIONS),
  eventTimeline: z.enum(EVENT_TIMELINE_OPTIONS),
  budget: z.enum(BUDGET_OPTIONS),
  ...baseDetails,
})

export const brandDetailsSchema = z.object({
  brandName: z.string().min(1, 'Required'),
  brandCategory: z.enum(BRAND_CATEGORIES),
  brandCategoryOther: z.string().optional(),
  activationTypes: z.array(z.enum(BRAND_ACTIVATION_TYPES)).min(1, 'Pick at least one'),
  activationTypesOther: z.string().optional(),
  budget: z.enum(BRAND_BUDGET_OPTIONS),
  pastActivation: z.string().optional(),
  ...baseDetails,
})

export const creativeDetailsSchema = z.object({
  primaryRole: z.enum(CREATIVE_ROLES),
  workInterest: z.string().min(1, 'Required'),
  portfolioUrl: urlField,
  ...baseDetails,
})

export const communityDetailsSchema = z.object({
  involvement: z.array(z.enum(COMMUNITY_INVOLVEMENT)).min(1, 'Pick at least one'),
  aboutYou: z.string().min(1, 'Required'),
  portfolioUrl: urlField,
  ...baseDetails,
})

export const inquirySchema = z.discriminatedUnion('inquirerType', [
  z.object({
    inquirerType: z.literal('hotel'),
    details: hotelDetailsSchema,
    contact: contactSchema,
  }),
  z.object({
    inquirerType: z.literal('club'),
    details: clubDetailsSchema,
    contact: contactSchema,
  }),
  z.object({
    inquirerType: z.literal('brand'),
    details: brandDetailsSchema,
    contact: contactSchema,
  }),
  z.object({
    inquirerType: z.literal('creative'),
    details: creativeDetailsSchema,
    contact: contactSchema,
  }),
  z.object({
    inquirerType: z.literal('community'),
    details: communityDetailsSchema,
    contact: contactSchema,
  }),
])

export const inquirySubmissionSchema = z.object({
  payload: inquirySchema,
  fileUrls: z.array(z.string().url()).max(3).optional(),
  website: z.string().optional(),
})

export type InquirerType = 'hotel' | 'club' | 'brand' | 'creative' | 'community'
export type Inquiry = z.infer<typeof inquirySchema>
export type HotelDetails = z.infer<typeof hotelDetailsSchema>
export type ClubDetails = z.infer<typeof clubDetailsSchema>
export type BrandDetails = z.infer<typeof brandDetailsSchema>
export type CreativeDetails = z.infer<typeof creativeDetailsSchema>
export type CommunityDetails = z.infer<typeof communityDetailsSchema>
export type Contact = z.infer<typeof contactSchema>
