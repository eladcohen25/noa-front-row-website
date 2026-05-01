'use client'

import SelectButtons from '../Inputs/SelectButtons'
import type { InquirerType } from '@/lib/inquiry/types'
import type { StepDef, StepProps } from './types'

const OPTIONS: { value: InquirerType; label: string }[] = [
  { value: 'hotel', label: 'Hotel or Property' },
  { value: 'club', label: 'Private Club' },
  { value: 'brand', label: 'Brand / Sponsor' },
  { value: 'creative', label: 'Creative / Model / Beauty' },
  { value: 'community', label: 'Community' },
]

const InquirerTypeStepComponent = ({ state, setState }: StepProps) => {
  const labels = OPTIONS.map((o) => o.label)
  const currentLabel = OPTIONS.find((o) => o.value === state.inquirerType)?.label
  return (
    <SelectButtons
      options={labels}
      value={currentLabel}
      onChange={(label) => {
        const next = OPTIONS.find((o) => o.label === label)
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
