import type {
  EYE_COLORS,
  GENDER_IDENTITY_OPTIONS,
  HAIR_COLORS,
  HOW_HEARD_OPTIONS,
  SIZE_OPTIONS,
  TRAVEL_OPTIONS,
} from './schema'

export type GenderIdentity = (typeof GENDER_IDENTITY_OPTIONS)[number]
export type Size = (typeof SIZE_OPTIONS)[number]
export type HairColor = (typeof HAIR_COLORS)[number]
export type EyeColor = (typeof EYE_COLORS)[number]
export type TravelOption = (typeof TRAVEL_OPTIONS)[number]
export type HowHeard = (typeof HOW_HEARD_OPTIONS)[number]

/**
 * UI-side form state. Photos are kept as in-memory File objects until
 * the user submits. The API route uploads them to Supabase Storage.
 */
export interface ModelFormState {
  fullName: string
  email: string
  phone: string

  genderIdentity?: GenderIdentity
  genderIdentityOther: string

  city: string

  dateOfBirth: string

  // Stored in cm in state too — the input handles toggle locally.
  heightCm?: number
  bustCm?: number
  waistCm?: number
  hipsCm?: number

  sizeTops?: Size
  sizeBottoms?: Size
  sizeDressSuit?: Size
  shoeSizeUs?: number

  hairColor?: HairColor
  hairColorOther: string
  eyeColor?: EyeColor
  eyeColorOther: string

  modelingExperience: string
  hasAgency?: boolean
  agencyName: string

  photos: {
    headshot?: File
    fullbody?: File
    profileLeft?: File
    profileRight?: File
    additional: File[]
  }

  instagramHandle: string
  tiktokHandle: string
  portfolioUrl: string

  travelAvailability?: TravelOption

  whyTfr: string
  howHeard?: HowHeard
  howHeardOther: string
  additionalNotes: string

  website: string // honeypot
}

export const INITIAL_MODEL_FORM_STATE: ModelFormState = {
  fullName: '',
  email: '',
  phone: '',
  genderIdentity: undefined,
  genderIdentityOther: '',
  city: '',
  dateOfBirth: '',
  heightCm: undefined,
  bustCm: undefined,
  waistCm: undefined,
  hipsCm: undefined,
  sizeTops: undefined,
  sizeBottoms: undefined,
  sizeDressSuit: undefined,
  shoeSizeUs: undefined,
  hairColor: undefined,
  hairColorOther: '',
  eyeColor: undefined,
  eyeColorOther: '',
  modelingExperience: '',
  hasAgency: undefined,
  agencyName: '',
  photos: {
    headshot: undefined,
    fullbody: undefined,
    profileLeft: undefined,
    profileRight: undefined,
    additional: [],
  },
  instagramHandle: '',
  tiktokHandle: '',
  portfolioUrl: '',
  travelAvailability: undefined,
  whyTfr: '',
  howHeard: undefined,
  howHeardOther: '',
  additionalNotes: '',
  website: '',
}
