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
  Component: FC<ModelStepProps>
}
