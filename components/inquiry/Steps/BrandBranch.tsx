'use client'

import {
  BRAND_ACTIVATION_TYPES,
  BRAND_BUDGET_OPTIONS,
  BRAND_CATEGORIES,
} from '@/lib/inquiry/schema'
import {
  detailsFileStep,
  detailsMultiSelectStep,
  detailsSelectStep,
  detailsTextAreaStep,
  detailsTextStep,
} from './stepFactories'
import type { StepDef } from './types'

export const brandBranchSteps: StepDef[] = [
  detailsTextStep({
    key: 'brand-name',
    prompt: 'Brand name',
    field: 'brandName',
  }),
  detailsSelectStep({
    key: 'brand-category',
    prompt: 'Category',
    field: 'brandCategory',
    options: BRAND_CATEGORIES,
    otherOption: 'Other',
    otherField: 'brandCategoryOther',
    otherPlaceholder: 'Describe your category',
  }),
  detailsMultiSelectStep({
    key: 'brand-activation',
    prompt: 'How would you like to work together?',
    field: 'activationTypes',
    options: BRAND_ACTIVATION_TYPES,
    otherOption: 'Other',
    otherField: 'activationTypesOther',
    otherPlaceholder: 'Tell us what you have in mind',
  }),
  detailsSelectStep({
    key: 'brand-budget',
    prompt: 'Budget range',
    field: 'budget',
    options: BRAND_BUDGET_OPTIONS,
  }),
  detailsTextAreaStep({
    key: 'brand-past',
    prompt: 'Tell us about a past activation.',
    helper: 'One you loved, or one that didn’t land — optional',
    field: 'pastActivation',
    placeholder: 'A few sentences is plenty',
    required: false,
  }),
  detailsFileStep({
    key: 'brand-files',
    prompt: 'Have a lookbook or brand deck?',
    helper: 'Optional',
  }),
  detailsTextAreaStep({
    key: 'brand-notes',
    prompt: 'Anything else we should know?',
    helper: 'Optional',
    field: 'additionalNotes',
    placeholder: 'References, constraints, dream collaborators…',
    required: false,
  }),
]
