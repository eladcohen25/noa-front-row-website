'use client'

import { AnimatePresence } from 'framer-motion'
import { useCallback, useMemo, useRef, useState } from 'react'
import BackButton from './BackButton'
import ContinueButton from './ContinueButton'
import ExitButton from './ExitButton'
import EndScreen from './Steps/EndScreen'
import ProgressBar from './ProgressBar'
import StepWrapper from './StepWrapper'
import { brandBranchSteps } from './Steps/BrandBranch'
import { clubBranchSteps } from './Steps/ClubBranch'
import { communityBranchSteps } from './Steps/CommunityBranch'
import { contactSteps } from './Steps/ContactStep'
import { creativeBranchSteps } from './Steps/CreativeBranch'
import { hotelBranchSteps } from './Steps/HotelBranch'
import { inquirerTypeStep } from './Steps/InquirerTypeStep'
import type { InquiryFormState } from '@/lib/inquiry/types'
import type { StepDef } from './Steps/types'

const BRANCH_STEPS: Record<NonNullable<InquiryFormState['inquirerType']>, StepDef[]> = {
  hotel: hotelBranchSteps,
  club: clubBranchSteps,
  brand: brandBranchSteps,
  creative: creativeBranchSteps,
  community: communityBranchSteps,
}

const INITIAL_STATE: InquiryFormState = {
  inquirerType: undefined,
  details: {},
  contact: {},
  files: [],
  website: '',
}

type Phase = 'questions' | 'submitting' | 'done' | 'error'

export default function InquiryForm() {
  const [state, setState] = useState<InquiryFormState>(INITIAL_STATE)
  const [stepIndex, setStepIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('questions')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const indexHistoryRef = useRef<number[]>([0])

  const steps = useMemo<StepDef[]>(() => {
    const base = [inquirerTypeStep]
    if (!state.inquirerType) return base
    return [...base, ...BRANCH_STEPS[state.inquirerType], ...contactSteps]
  }, [state.inquirerType])

  const currentStep = steps[stepIndex]
  const isLastQuestion = stepIndex === steps.length - 1

  const submit = useCallback(async () => {
    setPhase('submitting')
    setSubmitError(null)
    try {
      const fd = new FormData()
      fd.append('inquirerType', state.inquirerType ?? '')
      fd.append('details', JSON.stringify(state.details))
      fd.append('contact', JSON.stringify(state.contact))
      fd.append('website', state.website)
      state.files.forEach((file) => fd.append('files', file))

      const res = await fetch('/api/inquire', {
        method: 'POST',
        body: fd,
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Something went wrong')
      }
      setPhase('done')
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Something went wrong'
      setSubmitError(message)
      setPhase('error')
    }
  }, [state])

  const advance = useCallback(() => {
    if (!currentStep || !currentStep.isValid(state)) return
    if (isLastQuestion) {
      submit()
      return
    }
    const nextIndex = stepIndex + 1
    indexHistoryRef.current.push(nextIndex)
    setStepIndex(nextIndex)
  }, [currentStep, state, isLastQuestion, stepIndex, submit])

  const goBack = useCallback(() => {
    if (indexHistoryRef.current.length <= 1) return
    indexHistoryRef.current.pop()
    const prev = indexHistoryRef.current[indexHistoryRef.current.length - 1]
    setStepIndex(prev)
  }, [])

  if (phase === 'done') {
    return (
      <main className="bg-white">
        <EndScreen />
      </main>
    )
  }

  return (
    <main className="bg-white relative">
      <ProgressBar current={stepIndex + 1} total={steps.length} />
      <BackButton onClick={goBack} hidden={stepIndex === 0 || phase === 'submitting'} />
      <ExitButton hidden={phase === 'submitting'} />

      {/* Honeypot — hidden from users, picked up by bots */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        value={state.website}
        onChange={(e) => setState((prev) => ({ ...prev, website: e.target.value }))}
        className="absolute left-[-9999px] w-px h-px opacity-0"
        aria-hidden="true"
      />

      <AnimatePresence mode="wait">
        {phase === 'submitting' ? (
          <StepWrapper key="submitting" stepKey="submitting" prompt="Sending…" helper="One moment">
            <div className="text-sm text-black/50">Submitting your inquiry.</div>
          </StepWrapper>
        ) : phase === 'error' ? (
          <StepWrapper
            key="error"
            stepKey="error"
            prompt="Something went wrong."
            helper={submitError || 'Please try again'}
          >
            <ContinueButton label="Try again" onClick={() => submit()} />
          </StepWrapper>
        ) : (
          currentStep && (
            <StepWrapper
              key={currentStep.key}
              stepKey={currentStep.key}
              prompt={currentStep.prompt}
              helper={currentStep.helper}
            >
              <currentStep.Component state={state} setState={setState} advance={advance} />

              {currentStep.mode === 'continue' && (
                <ContinueButton
                  label={isLastQuestion ? 'Submit' : 'Continue'}
                  disabled={!currentStep.isValid(state)}
                  onClick={advance}
                  skipLabel={currentStep.isOptional ? 'Skip' : undefined}
                  onSkip={currentStep.isOptional ? advance : undefined}
                />
              )}
            </StepWrapper>
          )
        )}
      </AnimatePresence>
    </main>
  )
}
