'use client'

import { useState } from 'react'
import CityInput from '../Inputs/CityInput'
import { HOW_HEARD_OPTIONS } from '@/lib/inquiry/schema'
import { contactSelectStep, contactTextStep } from './stepFactories'
import type { StepDef, StepProps } from './types'

const PHONE_PATTERN = /\d/g

const CityStepComponent = ({ state, setState, advance }: StepProps) => {
  const [touched, setTouched] = useState(false)
  const value = (state.contact.city as string) || ''
  const error = touched && !value.trim() ? 'Required' : null
  return (
    <CityInput
      value={value}
      onChange={(v) =>
        setState((prev) => ({
          ...prev,
          contact: { ...prev.contact, city: v },
        }))
      }
      onBlur={() => setTouched(true)}
      onEnter={() => {
        if (value.trim()) advance()
      }}
      placeholder="Start typing — Las Vegas, New York…"
      showError={touched}
      error={error || undefined}
    />
  )
}

const cityStep: StepDef = {
  key: 'contact-city',
  prompt: 'City',
  helper: 'Where you’re based',
  mode: 'continue',
  isValid: (state) => !!((state.contact.city as string) || '').trim(),
  Component: CityStepComponent,
}

export const contactSteps: StepDef[] = [
  contactTextStep({
    key: 'contact-name',
    prompt: 'What’s your name?',
    field: 'name',
  }),
  contactTextStep({
    key: 'contact-email',
    prompt: 'Email',
    field: 'email',
    placeholder: 'you@domain.com',
    type: 'email',
    validate: (v) => (/^\S+@\S+\.\S+$/.test(v) ? null : 'Enter a valid email'),
  }),
  contactTextStep({
    key: 'contact-phone',
    prompt: 'Phone',
    helper: 'Optional',
    field: 'phone',
    type: 'tel',
    required: false,
    validate: (v) => {
      if (!v.trim()) return null
      const digits = (v.match(PHONE_PATTERN) || []).length
      return digits >= 7 ? null : 'Enter a valid phone number'
    },
  }),
  cityStep,
  contactSelectStep({
    key: 'contact-how-heard',
    prompt: 'How did you hear about The Front Row?',
    field: 'howHeard',
    options: HOW_HEARD_OPTIONS,
    required: false,
  }),
]
