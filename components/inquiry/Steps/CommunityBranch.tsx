'use client'

import { COMMUNITY_INVOLVEMENT } from '@/lib/inquiry/schema'
import {
  detailsMultiSelectStep,
  detailsTextAreaStep,
  detailsTextStep,
} from './stepFactories'
import type { StepDef } from './types'

const URL_PATTERN = /^https?:\/\/[^\s.]+\.[^\s]+/i

export const communityBranchSteps: StepDef[] = [
  detailsMultiSelectStep({
    key: 'community-involvement',
    prompt: 'How do you want to be involved?',
    field: 'involvement',
    options: COMMUNITY_INVOLVEMENT,
  }),
  detailsTextAreaStep({
    key: 'community-about',
    prompt: 'Tell us about yourself',
    field: 'aboutYou',
    placeholder: 'A few sentences is enough',
    required: true,
  }),
  detailsTextStep({
    key: 'community-portfolio',
    prompt: 'Instagram or portfolio',
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
    key: 'community-notes',
    prompt: 'Anything else we should know?',
    helper: 'Optional',
    field: 'additionalNotes',
    required: false,
  }),
]
