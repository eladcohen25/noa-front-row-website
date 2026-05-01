import { z } from 'zod'
import { ageFromDob } from './units'

export const PRONOUN_OPTIONS = [
  'she / her',
  'he / him',
  'they / them',
  'she / they',
  'he / they',
  'other',
] as const

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

export const UNIONS = ['SAG-AFTRA', 'Equity', 'Other', 'None / not applicable'] as const

export const SPECIAL_SKILLS = [
  'Dance',
  'Athletics / sports',
  'Horseback riding',
  'Swimming',
  'Driving (manual / motorcycle)',
  'Music / instrument',
  'Languages',
  'Combat / fight choreography',
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
  pronouns: z.enum(PRONOUN_OPTIONS),
  pronounsOther: z.string().optional().nullable(),
  genderIdentity: z.enum(GENDER_IDENTITY_OPTIONS).optional().nullable(),
  genderIdentityOther: z.string().optional().nullable(),
  city: z.string().min(1, 'Required'),
  stateRegion: z.string().min(1, 'Required'),
  country: z.string().min(1, 'Required'),
  dateOfBirth: z.string().refine((v) => {
    const d = new Date(v)
    return !Number.isNaN(d.getTime())
  }, 'Enter a valid date'),
  isAdult: z.boolean(),

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
  heritage: z.string().optional().nullable(),

  // Experience
  modelingExperience: z.string().min(1, 'Required'),
  hasAgency: z.boolean(),
  agencyName: z.string().optional().nullable(),
  unions: z.array(z.enum(UNIONS)).optional().default([]),
  unionsOther: z.string().optional().nullable(),
  specialSkills: z.array(z.enum(SPECIAL_SKILLS)).optional().default([]),
  specialSkillsOther: z.string().optional().nullable(),
  languagesNote: z.string().optional().nullable(),

  // Markings
  markingsNotes: z.string().optional().nullable(),

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
  earliestAvailable: z.string().optional().nullable(),

  // Closing
  whyTfr: z.string().min(1, 'Required'),
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
