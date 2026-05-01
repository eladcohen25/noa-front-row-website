import { z } from 'zod'
import { ageFromDob } from './units'

export const GENDER_IDENTITY_OPTIONS = [
  'Woman',
  'Man',
  'Non-binary',
  'Prefer to self-describe',
  'Prefer not to say',
] as const

export const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Unsure'] as const

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

const phoneDigitsOk = (s: string) => s.replace(/\D/g, '').length >= 7

export const modelSubmissionSchema = z
  .object({
    fullName: z.string().min(2, 'Required'),
    email: z.string().regex(emailRe, 'Enter a valid email'),
    phone: z.string().refine(phoneDigitsOk, 'Enter a valid phone number'),
    genderIdentity: z.enum(GENDER_IDENTITY_OPTIONS),
    genderIdentityOther: z.string().optional().nullable(),
    city: z.string().min(1, 'Required'),
    dateOfBirth: z
      .string()
      .refine((v) => !Number.isNaN(new Date(v).getTime()), 'Enter a valid date')
      .refine((v) => ageFromDob(v) >= 18, 'You must be 18 or older'),
    isAdult: z.literal(true),

    heightCm: z.number().min(120).max(230),
    bustCm: z.number().min(50).max(150).optional().nullable(),
    bustUnsure: z.boolean().optional().default(false),
    waistCm: z.number().min(50).max(150).optional().nullable(),
    waistUnsure: z.boolean().optional().default(false),
    hipsCm: z.number().min(50).max(150).optional().nullable(),
    hipsUnsure: z.boolean().optional().default(false),

    sizeTops: z.enum(SIZE_OPTIONS),
    sizeBottoms: z.enum(SIZE_OPTIONS),
    sizeDressSuit: z.enum(SIZE_OPTIONS),
    shoeSizeUs: z.number().min(4).max(18),

    modelingExperience: z.string().min(1, 'Required'),
    hasAgency: z.boolean(),
    agencyName: z.string().optional().nullable(),
    instagramHandle: z
      .string()
      .min(1, 'Required')
      .refine((raw) => {
        const handle = raw
          .replace(/^@/, '')
          .replace(/^https?:\/\/(www\.)?instagram\.com\//, '')
          .replace(/\/$/, '')
        return igHandleRe.test(handle)
      }, 'Enter a valid Instagram handle'),
    tiktokHandle: z.string().optional().nullable(),
    portfolioUrl: z.string().optional().nullable(),

    travelAvailability: z.enum(TRAVEL_OPTIONS),

    whyTfr: z.string().optional().nullable(),
    howHeard: z.enum(HOW_HEARD_OPTIONS),
    howHeardOther: z.string().optional().nullable(),
    additionalNotes: z.string().optional().nullable(),

    website: z.string().optional().default(''),
  })
  .superRefine((data, ctx) => {
    if (
      data.genderIdentity === 'Prefer to self-describe' &&
      !data.genderIdentityOther?.trim()
    ) {
      ctx.addIssue({ code: 'custom', path: ['genderIdentityOther'], message: 'Required' })
    }
    if (data.hasAgency && !data.agencyName?.trim()) {
      ctx.addIssue({ code: 'custom', path: ['agencyName'], message: 'Required' })
    }
    if (!data.bustUnsure && (data.bustCm === undefined || data.bustCm === null)) {
      ctx.addIssue({ code: 'custom', path: ['bustCm'], message: 'Enter a measurement or tap Not sure' })
    }
    if (!data.waistUnsure && (data.waistCm === undefined || data.waistCm === null)) {
      ctx.addIssue({ code: 'custom', path: ['waistCm'], message: 'Enter a measurement or tap Not sure' })
    }
    if (!data.hipsUnsure && (data.hipsCm === undefined || data.hipsCm === null)) {
      ctx.addIssue({ code: 'custom', path: ['hipsCm'], message: 'Enter a measurement or tap Not sure' })
    }
  })

export type ModelSubmission = z.infer<typeof modelSubmissionSchema>

export function isAgeValid(dateOfBirth: string): boolean {
  return ageFromDob(dateOfBirth) >= 18
}

export function normalizeInstagramHandle(raw: string): string {
  return raw
    .replace(/^@/, '')
    .replace(/^https?:\/\/(www\.)?instagram\.com\//, '')
    .replace(/\/$/, '')
}

export function normalizeUrl(raw: string | null | undefined): string | null {
  if (!raw) return null
  const t = raw.trim()
  if (!t) return null
  if (/^https?:\/\//i.test(t)) return t
  return `https://${t}`
}
