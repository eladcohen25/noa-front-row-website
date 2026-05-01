'use client'

import { CREATIVE_ROLES } from '@/lib/inquiry/schema'
import {
  detailsSelectStep,
  detailsTextAreaStep,
  detailsTextStep,
} from './stepFactories'
import type { StepDef } from './types'

const URL_PATTERN = /^https?:\/\/[^\s.]+\.[^\s]+/i

export const creativeBranchSteps: StepDef[] = [
  detailsSelectStep({
    key: 'creative-role',
    prompt: 'Primary role',
    field: 'primaryRole',
    options: CREATIVE_ROLES,
  }),
  detailsTextAreaStep({
    key: 'creative-interest',
    prompt: 'What kind of work are you looking to do with TFR?',
    field: 'workInterest',
    placeholder: 'A few sentences is enough',
    required: true,
  }),
  detailsTextStep({
    key: 'creative-portfolio',
    prompt: 'Portfolio or Instagram',
    field: 'portfolioUrl',
    placeholder: 'https:// or @handle',
    type: 'url',
    validate: (v) => {
      if (!v.trim()) return 'Required'
      const normalized =
        v.startsWith('http://') || v.startsWith('https://') ? v : `https://${v.replace(/^@/, 'instagram.com/')}`
      return URL_PATTERN.test(normalized) ? null : 'Enter a valid link'
    },
  }),
  detailsTextAreaStep({
    key: 'creative-notes',
    prompt: 'Anything else we should know?',
    helper: 'Optional',
    field: 'additionalNotes',
    required: false,
  }),
]
