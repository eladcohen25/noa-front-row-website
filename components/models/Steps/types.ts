import type { FC } from 'react'
import type { ModelFormState } from '@/lib/models/types'

export interface ModelStepProps {
  state: ModelFormState
  setState: (updater: (prev: ModelFormState) => ModelFormState) => void
  advance: () => void
}

export interface ModelStepDef {
  key: string
  prompt: string
  helper?: string
  isValid: (state: ModelFormState) => boolean
  isOptional?: boolean
  /** When true for the current state, hide the explicit Continue button.
   * Used by single-select steps that auto-advance on tap. */
  hideContinue?: (state: ModelFormState) => boolean
  /** When true for the current state, the step is skipped entirely
   * (e.g. agencyName when hasAgency === false). */
  isHidden?: (state: ModelFormState) => boolean
  Component: FC<ModelStepProps>
}
