'use client'

import { useState } from 'react'
import TextInput from '../Inputs/TextInput'
import TextArea from '../Inputs/TextArea'
import SelectButtons from '../Inputs/SelectButtons'
import MultiSelectButtons from '../Inputs/MultiSelectButtons'
import FileUpload from '../Inputs/FileUpload'
import type { InquiryFormState } from '@/lib/inquiry/types'
import type { StepDef, StepProps } from './types'

interface TextStepConfig {
  key: string
  prompt: string
  helper?: string
  field: string
  placeholder?: string
  required?: boolean
  type?: 'text' | 'email' | 'tel' | 'url'
  validate?: (value: string) => string | null
}

export const detailsTextStep = ({
  key,
  prompt,
  helper,
  field,
  placeholder,
  required = true,
  type = 'text',
  validate,
}: TextStepConfig): StepDef => {
  const Component = ({ state, setState, advance }: StepProps) => {
    const [touched, setTouched] = useState(false)
    const value = ((state.details as Record<string, unknown>)[field] as string) || ''
    const error = required && !value.trim() ? 'Required' : validate ? validate(value) : null
    return (
      <>
        <TextInput
          type={type}
          autoFocus
          placeholder={placeholder}
          value={value}
          onChange={(e) =>
            setState((prev) => ({
              ...prev,
              details: { ...prev.details, [field]: e.target.value },
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
      </>
    )
  }
  return {
    key,
    prompt,
    helper,
    mode: 'continue',
    isValid: (state) => {
      const v = ((state.details as Record<string, unknown>)[field] as string) || ''
      if (required && !v.trim()) return false
      if (validate && validate(v)) return false
      return true
    },
    Component,
  }
}

interface TextAreaStepConfig {
  key: string
  prompt: string
  helper?: string
  field: string
  placeholder?: string
  required?: boolean
}

export const detailsTextAreaStep = ({
  key,
  prompt,
  helper,
  field,
  placeholder,
  required = false,
}: TextAreaStepConfig): StepDef => {
  const Component = ({ state, setState }: StepProps) => {
    const [touched, setTouched] = useState(false)
    const value = ((state.details as Record<string, unknown>)[field] as string) || ''
    const error = required && !value.trim() ? 'Required' : null
    return (
      <TextArea
        autoFocus
        placeholder={placeholder}
        value={value}
        onChange={(e) =>
          setState((prev) => ({
            ...prev,
            details: { ...prev.details, [field]: e.target.value },
          }))
        }
        onBlur={() => setTouched(true)}
        showError={touched}
        error={error || undefined}
      />
    )
  }
  return {
    key,
    prompt,
    helper,
    mode: 'continue',
    isValid: (state) => {
      const v = ((state.details as Record<string, unknown>)[field] as string) || ''
      return required ? !!v.trim() : true
    },
    isOptional: !required,
    Component,
  }
}

interface SelectStepConfig<T extends string> {
  key: string
  prompt: string
  helper?: string
  field: string
  options: readonly T[]
  otherOption?: T
  otherField?: string
  otherPlaceholder?: string
}

export const detailsSelectStep = <T extends string>({
  key,
  prompt,
  helper,
  field,
  options,
  otherOption,
  otherField,
  otherPlaceholder,
}: SelectStepConfig<T>): StepDef => {
  const Component = ({ state, setState }: StepProps) => {
    const details = state.details as Record<string, unknown>
    const value = (details[field] as T) || undefined
    const otherText = otherField ? (details[otherField] as string) || '' : ''
    return (
      <SelectButtons
        options={options}
        value={value}
        onChange={(next) => {
          setState((prev) => {
            const nextDetails = { ...prev.details, [field]: next }
            if (otherField && next !== otherOption) {
              delete (nextDetails as Record<string, unknown>)[otherField]
            }
            return { ...prev, details: nextDetails }
          })
        }}
        otherOption={otherOption}
        otherText={otherText}
        onOtherTextChange={
          otherField
            ? (text) =>
                setState((prev) => ({
                  ...prev,
                  details: { ...prev.details, [otherField]: text },
                }))
            : undefined
        }
        otherPlaceholder={otherPlaceholder}
      />
    )
  }
  return {
    key,
    prompt,
    helper,
    mode: 'continue',
    isValid: (state) => {
      const details = state.details as Record<string, unknown>
      const v = details[field]
      if (!v) return false
      if (otherOption && otherField && v === otherOption) {
        const text = (details[otherField] as string) || ''
        if (!text.trim()) return false
      }
      return true
    },
    Component,
  }
}

interface MultiSelectStepConfig<T extends string> {
  key: string
  prompt: string
  helper?: string
  field: string
  options: readonly T[]
  otherOption?: T
  otherField?: string
  otherPlaceholder?: string
}

export const detailsMultiSelectStep = <T extends string>({
  key,
  prompt,
  helper,
  field,
  options,
  otherOption,
  otherField,
  otherPlaceholder,
}: MultiSelectStepConfig<T>): StepDef => {
  const Component = ({ state, setState }: StepProps) => {
    const details = state.details as Record<string, unknown>
    const value = (details[field] as T[]) || []
    const otherText = otherField ? (details[otherField] as string) || '' : ''
    return (
      <MultiSelectButtons
        options={options}
        value={value}
        onChange={(next) =>
          setState((prev) => {
            const nextDetails = { ...prev.details, [field]: next }
            if (otherField && otherOption && !next.includes(otherOption)) {
              delete (nextDetails as Record<string, unknown>)[otherField]
            }
            return { ...prev, details: nextDetails }
          })
        }
        otherOption={otherOption}
        otherText={otherText}
        onOtherTextChange={
          otherField
            ? (text) =>
                setState((prev) => ({
                  ...prev,
                  details: { ...prev.details, [otherField]: text },
                }))
            : undefined
        }
        otherPlaceholder={otherPlaceholder}
      />
    )
  }
  return {
    key,
    prompt,
    helper: helper ?? 'Select all that apply',
    mode: 'continue',
    isValid: (state) => {
      const details = state.details as Record<string, unknown>
      const v = (details[field] as unknown[]) || []
      if (!Array.isArray(v) || v.length < 1) return false
      if (otherOption && otherField && (v as string[]).includes(otherOption)) {
        const text = (details[otherField] as string) || ''
        if (!text.trim()) return false
      }
      return true
    },
    Component,
  }
}

export const detailsFileStep = ({
  key,
  prompt,
  helper,
}: {
  key: string
  prompt: string
  helper?: string
}): StepDef => {
  const Component = ({ state, setState }: StepProps) => {
    return (
      <FileUpload
        files={state.files}
        onChange={(files) => setState((prev) => ({ ...prev, files }))}
      />
    )
  }
  return {
    key,
    prompt,
    helper,
    mode: 'continue',
    isOptional: true,
    isValid: () => true,
    Component,
  }
}

// Contact step: email + phone + city + name. We keep the spec's "one question per screen" rule by splitting them.
type ContactField = keyof InquiryFormState['contact']

interface ContactTextStepConfig {
  key: string
  prompt: string
  helper?: string
  field: ContactField
  placeholder?: string
  required?: boolean
  type?: 'text' | 'email' | 'tel' | 'url'
  validate?: (value: string) => string | null
}

export const contactTextStep = ({
  key,
  prompt,
  helper,
  field,
  placeholder,
  required = true,
  type = 'text',
  validate,
}: ContactTextStepConfig): StepDef => {
  const Component = ({ state, setState, advance }: StepProps) => {
    const [touched, setTouched] = useState(false)
    const value = (state.contact[field] as string) || ''
    const error =
      required && !value.trim() ? 'Required' : validate && value.trim() ? validate(value) : null
    return (
      <TextInput
        type={type}
        autoFocus
        placeholder={placeholder}
        value={value}
        onChange={(e) =>
          setState((prev) => ({
            ...prev,
            contact: { ...prev.contact, [field]: e.target.value },
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
    key,
    prompt,
    helper,
    mode: 'continue',
    isOptional: !required,
    isValid: (state) => {
      const v = (state.contact[field] as string) || ''
      if (required && !v.trim()) return false
      if (validate && validate(v)) return false
      return true
    },
    Component,
  }
}

interface ContactSelectStepConfig<T extends string> {
  key: string
  prompt: string
  helper?: string
  field: ContactField
  options: readonly T[]
  required?: boolean
}

export const contactSelectStep = <T extends string>({
  key,
  prompt,
  helper,
  field,
  options,
  required = false,
}: ContactSelectStepConfig<T>): StepDef => {
  const Component = ({ state, setState }: StepProps) => {
    const value = (state.contact[field] as T) || undefined
    return (
      <SelectButtons
        options={options}
        value={value}
        onChange={(next) => {
          setState((prev) => ({
            ...prev,
            contact: { ...prev.contact, [field]: next },
          }))
        }}
      />
    )
  }
  return {
    key,
    prompt,
    helper,
    mode: 'continue',
    isOptional: !required,
    isValid: (state) => {
      const v = (state.contact[field] as string) || ''
      return required ? !!v : true
    },
    Component,
  }
}
