import { z } from 'zod'
import { ageFromDob } from './units'

export const GENDER_IDENTITY_OPTIONS = [
  'Woman',
  'Man',
  'Non-binary',
  'Prefer to self-describe',
  'Prefer not to say',
] as const

export const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const

export const HAIR_COLORS = [
  'Black',
  'Brown',
  'Blonde',
  'Red / auburn',
  'Gray / silver',
  'Other',
] as const

export const EYE_COLORS = [
  'Brown',
  'Blue',
  'Green',
  'Hazel',
  'Gray',
  'Other',
] as const

export const TRAVEL_OPTIONS = [
  'Yes, anywhere',
  'Yes, within the US',
  'Yes, within Nevada / nearby states',
  'Local only',
] as const

export const HOW_HEARD_OPTIONS = [
  'Instagram',
  'Referral',
  'Press',
  'Event',
  'Search',
  'Other',
] as const

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const igHandleRe = /^[a-zA-Z0-9._]{1,30}$/

export const modelSubmissionSchema = z.object({
  // Identity
  fullName: z.string().min(2, 'Required'),
  email: z.string().regex(emailRe, 'Enter a valid email'),
  phone: z.string().min(7, 'Enter a valid phone number'),
  genderIdentity: z.enum(GENDER_IDENTITY_OPTIONS),
  genderIdentityOther: z.string().optional().nullable(),
  city: z.string().min(1, 'Required'),
  dateOfBirth: z
    .string()
    .refine((v) => {
      const d = new Date(v)
      return !Number.isNaN(d.getTime())
    }, 'Enter a valid date')
    .refine((v) => {
      // Server-side guard: reject under-18 directly via the schema.
      const d = new Date(v)
      const now = new Date()
      let age = now.getFullYear() - d.getFullYear()
      const m = now.getMonth() - d.getMonth()
      if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--
      return age >= 18
    }, 'You must be 18 or older'),

  // Stats — always cm in the persisted form
  heightCm: z.number().min(120).max(230),
  bustCm: z.number().min(50).max(150),
  waistCm: z.number().min(50).max(150),
  hipsCm: z.number().min(50).max(150),

  // Sizing
  sizeTops: z.enum(SIZE_OPTIONS),
  sizeBottoms: z.enum(SIZE_OPTIONS),
  sizeDressSuit: z.enum(SIZE_OPTIONS),
  shoeSizeUs: z.number().min(4).max(18),

  // Appearance
  hairColor: z.enum(HAIR_COLORS),
  hairColorOther: z.string().optional().nullable(),
  eyeColor: z.enum(EYE_COLORS),
  eyeColorOther: z.string().optional().nullable(),

  // Experience
  modelingExperience: z.string().min(1, 'Required'),
  hasAgency: z.boolean(),
  agencyName: z.string().optional().nullable(),
  // Links
  instagramHandle: z
    .string()
    .min(1, 'Required')
    .refine((raw) => {
      const handle = raw.replace(/^@/, '').replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/$/, '')
      return igHandleRe.test(handle)
    }, 'Enter a valid Instagram handle'),
  tiktokHandle: z.string().optional().nullable(),
  portfolioUrl: z.string().optional().nullable(),

  // Availability
  travelAvailability: z.enum(TRAVEL_OPTIONS),

  // Closing
  whyTfr: z.string().optional().nullable(),
  howHeard: z.enum(HOW_HEARD_OPTIONS),
  howHeardOther: z.string().optional().nullable(),
  additionalNotes: z.string().optional().nullable(),

  // Honeypot
  website: z.string().optional().default(''),
})

export type ModelSubmission = z.infer<typeof modelSubmissionSchema>

/**
 * Server-side guard that re-derives age from DOB. Use in the API route.
 */
export function isAgeValid(dateOfBirth: string): boolean {
  return ageFromDob(dateOfBirth) >= 18
}

/**
 * Cleans the Instagram handle to a bare alphanumeric (no @, no URL prefix).
 */
export function normalizeInstagramHandle(raw: string): string {
  return raw
    .replace(/^@/, '')
    .replace(/^https?:\/\/(www\.)?instagram\.com\//, '')
    .replace(/\/$/, '')
}

/** Auto-prepend https:// when given a bare host. */
export function normalizeUrl(raw: string | null | undefined): string | null {
  if (!raw) return null
  const t = raw.trim()
  if (!t) return null
  if (/^https?:\/\//i.test(t)) return t
  return `https://${t}`
}
