import { FC } from 'react'
import type { InquiryFormState } from '@/lib/inquiry/types'

export interface StepProps {
  state: InquiryFormState
  setState: (updater: (prev: InquiryFormState) => InquiryFormState) => void
  advance: () => void
}

export interface StepDef {
  key: string
  prompt: string
  helper?: string
  isValid: (state: InquiryFormState) => boolean
  isOptional?: boolean
  Component: FC<StepProps>
  /**
   * 'auto' = single-select, advances on tap; 'continue' = needs explicit Continue button.
   */
  mode: 'auto' | 'continue'
}
