'use client'

import { useState } from 'react'
import DateInput from '../Inputs/DateInput'
import MeasurementInput from '../Inputs/MeasurementInput'
import MultiPhotoUpload from '../Inputs/MultiPhotoUpload'
import ShoeInput from '../Inputs/ShoeInput'
import MultiSelectButtons from '@/components/inquiry/Inputs/MultiSelectButtons'
import SelectButtons from '@/components/inquiry/Inputs/SelectButtons'
import TextArea from '@/components/inquiry/Inputs/TextArea'
import TextInput from '@/components/inquiry/Inputs/TextInput'
import {
  EYE_COLORS,
  GENDER_IDENTITY_OPTIONS,
  HAIR_COLORS,
  HOW_HEARD_OPTIONS,
  PRONOUN_OPTIONS,
  SIZE_OPTIONS,
  SPECIAL_SKILLS,
  TRAVEL_OPTIONS,
  UNIONS,
  normalizeInstagramHandle,
} from '@/lib/models/schema'
import { ageFromDob } from '@/lib/models/units'
import type { ModelStepDef, ModelStepProps } from './types'

// --- Generic field helpers ----------------------------------------------------

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function textStep(config: {
  key: string
  prompt: string
  helper?: string
  placeholder?: string
  field: string
  type?: 'text' | 'email' | 'tel' | 'url'
  required?: boolean
  validate?: (v: string) => string | null
}): ModelStepDef {
  const required = config.required !== false
  const Component = ({ state, setState, advance }: ModelStepProps) => {
    const [touched, setTouched] = useState(false)
    const value = ((state as unknown as Record<string, string>)[config.field] || '') as string
    const trimmed = value.trim()
    const error =
      required && !trimmed
        ? 'Required'
        : config.validate && trimmed
          ? config.validate(trimmed)
          : null
    return (
      <TextInput
        type={config.type ?? 'text'}
        autoFocus
        placeholder={config.placeholder}
        value={value}
        onChange={(e) =>
          setState((prev) => ({
            ...prev,
            [config.field]: e.target.value,
          }))
        }
        onBlur={() => setTouched(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !error) {
            e.preventDefault()
            advance()
          }
        }}
        showError={touched}
        error={error || undefined}
      />
    )
  }
  return {
    key: config.key,
    prompt: config.prompt,
    helper: config.helper,
    isValid: (state) => {
      const value = ((state as unknown as Record<string, string>)[config.field] || '') as string
      const t = value.trim()
      if (required && !t) return false
      if (config.validate && t && config.validate(t)) return false
      return true
    },
    isOptional: !required,
    Component,
  }
}

function textAreaStep(config: {
  key: string
  prompt: string
  helper?: string
  placeholder?: string
  field: string
  required?: boolean
}): ModelStepDef {
  const required = config.required !== false
  const Component = ({ state, setState }: ModelStepProps) => {
    const [touched, setTouched] = useState(false)
    const value = ((state as unknown as Record<string, string>)[config.field] || '') as string
    const error = required && !value.trim() ? 'Required' : null
    return (
      <TextArea
        autoFocus
        placeholder={config.placeholder}
        value={value}
        onChange={(e) =>
          setState((prev) => ({
            ...prev,
            [config.field]: e.target.value,
          }))
        }
        onBlur={() => setTouched(true)}
        showError={touched}
        error={error || undefined}
      />
    )
  }
  return {
    key: config.key,
    prompt: config.prompt,
    helper: config.helper,
    isValid: (state) => {
      const v = ((state as unknown as Record<string, string>)[config.field] || '') as string
      return required ? !!v.trim() : true
    },
    isOptional: !required,
    Component,
  }
}

function selectStep<T extends string>(config: {
  key: string
  prompt: string
  helper?: string
  field: string
  options: readonly T[]
  otherOption?: T
  otherField?: string
  otherPlaceholder?: string
}): ModelStepDef {
  const Component = ({ state, setState }: ModelStepProps) => {
    const value = (state as unknown as Record<string, T | undefined>)[config.field]
    const otherText = config.otherField
      ? ((state as unknown as Record<string, string>)[config.otherField] || '')
      : ''
    return (
      <SelectButtons
        options={config.options}
        value={value || undefined}
        onChange={(next) =>
          setState((prev) => {
            const updated = { ...prev, [config.field]: next } as Record<string, unknown>
            if (config.otherField && next !== config.otherOption) {
              updated[config.otherField] = ''
            }
            return updated as unknown as ModelFormStateType
          })
        }
        otherOption={config.otherOption}
        otherText={otherText}
        onOtherTextChange={
          config.otherField
            ? (text) =>
                setState((prev) => ({
                  ...prev,
                  [config.otherField as string]: text,
                }))
            : undefined
        }
        otherPlaceholder={config.otherPlaceholder}
      />
    )
  }
  return {
    key: config.key,
    prompt: config.prompt,
    helper: config.helper,
    isValid: (state) => {
      const v = (state as unknown as Record<string, T | undefined>)[config.field]
      if (!v) return false
      if (config.otherOption && config.otherField && v === config.otherOption) {
        const text = ((state as unknown as Record<string, string>)[config.otherField] || '')
        if (!text.trim()) return false
      }
      return true
    },
    Component,
  }
}

function multiSelectStep<T extends string>(config: {
  key: string
  prompt: string
  helper?: string
  field: string
  options: readonly T[]
  otherOption?: T
  otherField?: string
  otherPlaceholder?: string
  required?: boolean
}): ModelStepDef {
  const required = config.required !== false
  const Component = ({ state, setState }: ModelStepProps) => {
    const value = ((state as unknown as Record<string, T[] | undefined>)[config.field] || []) as T[]
    const otherText = config.otherField
      ? ((state as unknown as Record<string, string>)[config.otherField] || '')
      : ''
    return (
      <MultiSelectButtons
        options={config.options}
        value={value}
        onChange={(next) =>
          setState((prev) => {
            const updated = { ...prev, [config.field]: next } as Record<string, unknown>
            if (
              config.otherField &&
              config.otherOption &&
              !next.includes(config.otherOption)
            ) {
              updated[config.otherField] = ''
            }
            return updated as unknown as ModelFormStateType
          })
        }
        otherOption={config.otherOption}
        otherText={otherText}
        onOtherTextChange={
          config.otherField
            ? (text) =>
                setState((prev) => ({
                  ...prev,
                  [config.otherField as string]: text,
                }))
            : undefined
        }
        otherPlaceholder={config.otherPlaceholder}
      />
    )
  }
  return {
    key: config.key,
    prompt: config.prompt,
    helper: config.helper ?? 'Select all that apply',
    isOptional: !required,
    isValid: (state) => {
      const v = ((state as unknown as Record<string, T[] | undefined>)[config.field] || []) as T[]
      if (required && v.length < 1) return false
      if (config.otherOption && config.otherField && v.includes(config.otherOption)) {
        const text = ((state as unknown as Record<string, string>)[config.otherField] || '')
        if (!text.trim()) return false
      }
      return true
    },
    Component,
  }
}

// avoid `any` while still letting setState updaters return the broad shape
type ModelFormStateType = Parameters<ModelStepProps['setState']>[0] extends (
  prev: infer P,
) => infer R
  ? R
  : never

// --- Section 1: Identity ------------------------------------------------------

const identitySteps: ModelStepDef[] = [
  textStep({
    key: 'fullName',
    prompt: 'What\u2019s your full name?',
    field: 'fullName',
    placeholder: 'First and last',
  }),
  textStep({
    key: 'email',
    prompt: 'And your email?',
    field: 'email',
    type: 'email',
    placeholder: 'you@example.com',
    validate: (v) => (emailRe.test(v) ? null : 'Enter a valid email'),
  }),
  textStep({
    key: 'phone',
    prompt: 'Best phone number to reach you?',
    field: 'phone',
    type: 'tel',
    placeholder: '+1 555 555 5555',
    validate: (v) => (v.replace(/\D/g, '').length >= 7 ? null : 'Enter a valid phone number'),
  }),
  selectStep({
    key: 'pronouns',
    prompt: 'What are your pronouns?',
    field: 'pronouns',
    options: PRONOUN_OPTIONS,
    otherOption: 'other',
    otherField: 'pronounsOther',
    otherPlaceholder: 'Tell us your pronouns',
  }),
  selectStep({
    key: 'genderIdentity',
    prompt: 'How do you describe your gender?',
    helper: 'Optional',
    field: 'genderIdentity',
    options: GENDER_IDENTITY_OPTIONS,
    otherOption: 'Prefer to self-describe',
    otherField: 'genderIdentityOther',
    otherPlaceholder: 'Self-describe',
  }),
  textStep({ key: 'city', prompt: 'What city are you based in?', field: 'city' }),
  textStep({
    key: 'stateRegion',
    prompt: 'State or region?',
    field: 'stateRegion',
    placeholder: 'e.g. NV',
  }),
  textStep({
    key: 'country',
    prompt: 'Country?',
    field: 'country',
    placeholder: 'United States',
  }),
  {
    key: 'dateOfBirth',
    prompt: 'When were you born?',
    helper: 'You must be 18 or older to submit',
    isValid: (state) => {
      if (!state.dateOfBirth) return false
      return ageFromDob(state.dateOfBirth) >= 18
    },
    Component: ({ state, setState }) => {
      const [touched, setTouched] = useState(false)
      const today = new Date()
      const max = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
        .toISOString()
        .slice(0, 10)
      const tooYoung =
        state.dateOfBirth && ageFromDob(state.dateOfBirth) < 18
          ? 'You must be 18 or older to submit'
          : null
      return (
        <div onBlur={() => setTouched(true)}>
          <DateInput
            autoFocus
            value={state.dateOfBirth}
            onChange={(v) =>
              setState((prev) => ({
                ...prev,
                dateOfBirth: v,
                isAdult: ageFromDob(v) >= 18,
              }))
            }
            max={max}
          />
          {touched && tooYoung && (
            <p className="mt-3 text-xs uppercase tracking-[0.2em] text-rose-700">{tooYoung}</p>
          )}
          {state.dateOfBirth && !tooYoung && (
            <p className="mt-3 text-xs uppercase tracking-[0.2em] text-black/50">
              You are {ageFromDob(state.dateOfBirth)} years old
            </p>
          )}
        </div>
      )
    },
  },
  {
    key: 'isAdult',
    prompt: 'Confirm you are 18 or older',
    helper: 'Required',
    isValid: (state) => state.isAdult === true,
    Component: ({ state, setState }) => {
      return (
        <button
          type="button"
          onClick={() => setState((prev) => ({ ...prev, isAdult: !prev.isAdult }))}
          className={`flex items-center gap-4 text-left px-5 py-4 md:py-5 rounded-full border transition-all min-h-[52px] ${
            state.isAdult
              ? 'border-black bg-black text-white'
              : 'border-gold/60 text-black hover:border-gold hover:bg-gold/[0.06]'
          }`}
        >
          <span
            className={`flex-shrink-0 w-5 h-5 rounded-sm border flex items-center justify-center transition-colors ${
              state.isAdult ? 'border-white bg-white' : 'border-gold/70'
            }`}
          >
            {state.isAdult && (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2 6L5 9L10 3"
                  stroke="black"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </span>
          <span className="text-sm md:text-base">
            I confirm I am 18 years of age or older.
          </span>
        </button>
      )
    },
  },
]

// --- Section 2: Stats ---------------------------------------------------------

function measurementStep(
  key: string,
  prompt: string,
  field: 'heightCm' | 'bustCm' | 'waistCm' | 'hipsCm',
  variant: 'height' | 'simple',
  range: [number, number],
): ModelStepDef {
  return {
    key,
    prompt,
    helper: variant === 'height' ? 'Toggle ft / in or cm' : 'Toggle in or cm',
    isValid: (state) => {
      const v = state[field]
      if (typeof v !== 'number') return false
      return v >= range[0] && v <= range[1]
    },
    Component: ({ state, setState }) => (
      <MeasurementInput
        autoFocus
        valueCm={state[field]}
        onChange={(cm) => setState((prev) => ({ ...prev, [field]: cm }))}
        variant={variant}
        minCm={range[0]}
        maxCm={range[1]}
      />
    ),
  }
}

const statsSteps: ModelStepDef[] = [
  measurementStep('height', 'How tall are you?', 'heightCm', 'height', [120, 230]),
  measurementStep('bust', 'Bust / chest measurement?', 'bustCm', 'simple', [50, 150]),
  measurementStep('waist', 'Waist measurement?', 'waistCm', 'simple', [50, 150]),
  measurementStep('hips', 'Hips measurement?', 'hipsCm', 'simple', [50, 150]),
]

// --- Section 3: Sizing --------------------------------------------------------

const sizingSteps: ModelStepDef[] = [
  selectStep({ key: 'sizeTops', prompt: 'Tops size?', field: 'sizeTops', options: SIZE_OPTIONS }),
  selectStep({
    key: 'sizeBottoms',
    prompt: 'Bottoms size?',
    field: 'sizeBottoms',
    options: SIZE_OPTIONS,
  }),
  selectStep({
    key: 'sizeDressSuit',
    prompt: 'Dress / suit size?',
    field: 'sizeDressSuit',
    options: SIZE_OPTIONS,
  }),
  {
    key: 'shoeSize',
    prompt: 'Shoe size?',
    helper: 'Toggle US / EU / UK',
    isValid: (state) =>
      typeof state.shoeSizeUs === 'number' && state.shoeSizeUs >= 4 && state.shoeSizeUs <= 18,
    Component: ({ state, setState }) => (
      <ShoeInput
        autoFocus
        valueUs={state.shoeSizeUs}
        onChange={(us) => setState((prev) => ({ ...prev, shoeSizeUs: us }))}
      />
    ),
  },
]

// --- Section 4: Appearance ----------------------------------------------------

const appearanceSteps: ModelStepDef[] = [
  selectStep({
    key: 'hairColor',
    prompt: 'Hair color?',
    field: 'hairColor',
    options: HAIR_COLORS,
    otherOption: 'Other',
    otherField: 'hairColorOther',
  }),
  selectStep({
    key: 'eyeColor',
    prompt: 'Eye color?',
    field: 'eyeColor',
    options: EYE_COLORS,
    otherOption: 'Other',
    otherField: 'eyeColorOther',
  }),
  textAreaStep({
    key: 'heritage',
    prompt: 'How would you describe your look?',
    helper: 'Optional. Free-text — not a category list.',
    field: 'heritage',
    placeholder: 'Tell us in your own words',
    required: false,
  }),
]

// --- Section 5: Experience ----------------------------------------------------

const experienceSteps: ModelStepDef[] = [
  textAreaStep({
    key: 'modelingExperience',
    prompt: 'Briefly describe your modeling experience.',
    field: 'modelingExperience',
    placeholder: 'Brands, runway, editorial, beginner — whatever fits',
  }),
  {
    key: 'hasAgency',
    prompt: 'Are you currently represented by an agency?',
    isValid: (state) => state.hasAgency === true || state.hasAgency === false,
    Component: ({ state, setState }) => (
      <SelectButtons
        options={['Yes', 'No'] as const}
        value={state.hasAgency === true ? 'Yes' : state.hasAgency === false ? 'No' : undefined}
        onChange={(v) =>
          setState((prev) => ({
            ...prev,
            hasAgency: v === 'Yes',
            agencyName: v === 'Yes' ? prev.agencyName : '',
          }))
        }
      />
    ),
  },
  {
    key: 'agencyName',
    prompt: 'What is the name of the agency?',
    isValid: (state) => {
      if (!state.hasAgency) return true
      return state.agencyName.trim().length > 0
    },
    Component: ({ state, setState, advance }) => {
      if (!state.hasAgency) {
        // Auto-skip on render
        return (
          <button
            type="button"
            onClick={advance}
            className="text-sm uppercase tracking-wider text-black/60 underline underline-offset-4"
          >
            Skip
          </button>
        )
      }
      return (
        <TextInput
          autoFocus
          value={state.agencyName}
          onChange={(e) => setState((prev) => ({ ...prev, agencyName: e.target.value }))}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              if (state.agencyName.trim()) advance()
            }
          }}
          placeholder="Agency name"
        />
      )
    },
  },
  multiSelectStep({
    key: 'unions',
    prompt: 'Member of any unions?',
    helper: 'Optional · select all that apply',
    field: 'unions',
    options: UNIONS,
    otherOption: 'Other',
    otherField: 'unionsOther',
    required: false,
  }),
  multiSelectStep({
    key: 'specialSkills',
    prompt: 'Special skills?',
    helper: 'Optional · select all that apply',
    field: 'specialSkills',
    options: SPECIAL_SKILLS,
    otherOption: 'Other',
    otherField: 'specialSkillsOther',
    required: false,
  }),
  textAreaStep({
    key: 'languagesNote',
    prompt: 'Languages you speak?',
    helper: 'Optional',
    field: 'languagesNote',
    placeholder: 'e.g. English, Spanish, ASL',
    required: false,
  }),
]

// --- Section 6: Markings + Photos --------------------------------------------

const markingsPhotosSteps: ModelStepDef[] = [
  textAreaStep({
    key: 'markings',
    prompt: 'Visible tattoos, piercings, or scars?',
    helper: 'Optional · helps casting plan for cover-up if needed',
    field: 'markingsNotes',
    placeholder: 'Where, what, and roughly how visible',
    required: false,
  }),
  {
    key: 'photos',
    prompt: 'Upload your photos.',
    helper: '4 required + up to 4 additional · max 10 MB each, JPG / PNG / HEIC',
    isValid: (state) =>
      !!state.photos.headshot &&
      !!state.photos.fullbody &&
      !!state.photos.profileLeft &&
      !!state.photos.profileRight,
    Component: ({ state, setState }) => (
      <MultiPhotoUpload
        required={{
          headshot: state.photos.headshot,
          fullbody: state.photos.fullbody,
          profileLeft: state.photos.profileLeft,
          profileRight: state.photos.profileRight,
        }}
        additional={state.photos.additional}
        onChangeRequired={(slot, file) =>
          setState((prev) => ({
            ...prev,
            photos: { ...prev.photos, [slot]: file },
          }))
        }
        onChangeAdditional={(files) =>
          setState((prev) => ({
            ...prev,
            photos: { ...prev.photos, additional: files },
          }))
        }
      />
    ),
  },
]

// --- Section 7: Links --------------------------------------------------------

const urlValidate = (v: string) =>
  /^(https?:\/\/|www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(v) ? null : 'Enter a valid URL'

const linksSteps: ModelStepDef[] = [
  textStep({
    key: 'instagramHandle',
    prompt: 'Your Instagram?',
    helper: '@handle or full URL',
    field: 'instagramHandle',
    placeholder: '@thefrontrowlv',
    validate: (v) => {
      const handle = normalizeInstagramHandle(v)
      return /^[a-zA-Z0-9._]{1,30}$/.test(handle) ? null : 'Enter a valid Instagram handle'
    },
  }),
  textStep({
    key: 'tiktokHandle',
    prompt: 'TikTok?',
    helper: 'Optional',
    field: 'tiktokHandle',
    placeholder: '@handle or URL',
    required: false,
  }),
  textStep({
    key: 'portfolioUrl',
    prompt: 'Portfolio or other link?',
    helper: 'Optional',
    field: 'portfolioUrl',
    type: 'url',
    placeholder: 'https://yoursite.com',
    required: false,
    validate: (v) => (v ? urlValidate(v) : null),
  }),
]

// --- Section 8: Availability -------------------------------------------------

const availabilitySteps: ModelStepDef[] = [
  selectStep({
    key: 'travelAvailability',
    prompt: 'Available for travel?',
    field: 'travelAvailability',
    options: TRAVEL_OPTIONS,
  }),
  {
    key: 'earliestAvailable',
    prompt: 'Earliest you could shoot?',
    helper: 'Optional',
    isOptional: true,
    isValid: () => true,
    Component: ({ state, setState }) => (
      <DateInput
        autoFocus
        value={state.earliestAvailable}
        onChange={(v) => setState((prev) => ({ ...prev, earliestAvailable: v }))}
        min={new Date().toISOString().slice(0, 10)}
      />
    ),
  },
]

// --- Section 9: Closing ------------------------------------------------------

const closingSteps: ModelStepDef[] = [
  textAreaStep({
    key: 'whyTfr',
    prompt: 'Why do you want to model for The Front Row?',
    field: 'whyTfr',
    placeholder: 'In your own words',
  }),
  selectStep({
    key: 'howHeard',
    prompt: 'How did you hear about us?',
    field: 'howHeard',
    options: HOW_HEARD_OPTIONS,
    otherOption: 'Other',
    otherField: 'howHeardOther',
  }),
  textAreaStep({
    key: 'additionalNotes',
    prompt: 'Anything else we should know?',
    helper: 'Optional',
    field: 'additionalNotes',
    required: false,
  }),
]

// --- Final ordered list ------------------------------------------------------

export const MODEL_FORM_STEPS: ModelStepDef[] = [
  ...identitySteps,
  ...statsSteps,
  ...sizingSteps,
  ...appearanceSteps,
  ...experienceSteps,
  ...markingsPhotosSteps,
  ...linksSteps,
  ...availabilitySteps,
  ...closingSteps,
]
