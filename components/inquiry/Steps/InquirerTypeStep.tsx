'use client'

import SelectButtons from '../Inputs/SelectButtons'
import type { InquirerType } from '@/lib/inquiry/types'
import type { StepDef, StepProps } from './types'

const OPTIONS: { value: InquirerType; label: string }[] = [
  { value: 'hotel', label: 'Hotel or Property' },
  { value: 'club', label: 'Private Club' },
  { value: 'brand', label: 'Brand / Sponsor' },
  { value: 'creative', label: 'Creative / Media / Beauty' },
  { value: 'community', label: 'Community' },
]

const InquirerTypeStepComponent = ({ state, setState }: StepProps) => {
  // When the inquiry overlay is opened from a card that pre-narrows the
  // audience (e.g. the "Venues" card → hotel + club only), `restrictTypes`
  // is set on form state and we filter the option set accordingly. Without
  // it, all five categories show as before.
  const restrict = state.restrictTypes
  const visibleOptions =
    restrict && restrict.length > 0
      ? OPTIONS.filter((o) => restrict.includes(o.value))
      : OPTIONS

  const labels = visibleOptions.map((o) => o.label)
  const currentLabel = visibleOptions.find((o) => o.value === state.inquirerType)?.label

  return (
    <SelectButtons
      options={labels}
      value={currentLabel}
      onChange={(label) => {
        const next = visibleOptions.find((o) => o.label === label)
        if (!next) return
        const branchChanged = next.value !== state.inquirerType
        setState((prev) => ({
          ...prev,
          inquirerType: next.value,
          details: branchChanged ? {} : prev.details,
        }))
      }}
    />
  )
}

export const inquirerTypeStep: StepDef = {
  key: 'inquirer-type',
  prompt: 'What best describes you?',
  helper: 'Pick one to start',
  mode: 'continue',
  isValid: (state) => !!state.inquirerType,
  Component: InquirerTypeStepComponent,
}
