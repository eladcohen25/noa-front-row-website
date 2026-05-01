import type {
  GENDER_IDENTITY_OPTIONS,
  HOW_HEARD_OPTIONS,
  SIZE_OPTIONS,
  TRAVEL_OPTIONS,
} from './schema'

export type GenderIdentity = (typeof GENDER_IDENTITY_OPTIONS)[number]
export type Size = (typeof SIZE_OPTIONS)[number]
export type TravelOption = (typeof TRAVEL_OPTIONS)[number]
export type HowHeard = (typeof HOW_HEARD_OPTIONS)[number]

export interface ModelFormState {
  fullName: string
  email: string
  phone: string

  genderIdentity?: GenderIdentity
  genderIdentityOther: string

  city: string

  dateOfBirth: string
  isAdult: boolean

  heightCm?: number
  bustCm?: number
  bustUnsure: boolean
  waistCm?: number
  waistUnsure: boolean
  hipsCm?: number
  hipsUnsure: boolean

  sizeTops?: Size
  sizeBottoms?: Size
  sizeDressSuit?: Size
  shoeSizeUs?: number

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

  website: string
}

export const INITIAL_MODEL_FORM_STATE: ModelFormState = {
  fullName: '',
  email: '',
  phone: '',
  genderIdentity: undefined,
  genderIdentityOther: '',
  city: '',
  dateOfBirth: '',
  isAdult: false,
  heightCm: undefined,
  bustCm: undefined,
  bustUnsure: false,
  waistCm: undefined,
  waistUnsure: false,
  hipsCm: undefined,
  hipsUnsure: false,
  sizeTops: undefined,
  sizeBottoms: undefined,
  sizeDressSuit: undefined,
  shoeSizeUs: undefined,
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
