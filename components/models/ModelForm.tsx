'use client'

import { AnimatePresence } from 'framer-motion'
import { useCallback, useMemo, useRef, useState } from 'react'
import BackButton from '@/components/inquiry/BackButton'
import ContinueButton from '@/components/inquiry/ContinueButton'
import ExitButton from '@/components/inquiry/ExitButton'
import ProgressBar from '@/components/inquiry/ProgressBar'
import StepWrapper from '@/components/inquiry/StepWrapper'
import ModelEndScreen from './Steps/EndScreen'
import { MODEL_FORM_STEPS } from './Steps/steps'
import { INITIAL_MODEL_FORM_STATE, type ModelFormState } from '@/lib/models/types'

type Phase = 'questions' | 'submitting' | 'done' | 'error'

export default function ModelForm() {
  const [state, setState] = useState<ModelFormState>(INITIAL_MODEL_FORM_STATE)
  const [stepIndex, setStepIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('questions')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const indexHistoryRef = useRef<number[]>([0])

  const steps = MODEL_FORM_STEPS
  const currentStep = steps[stepIndex]

  // The "last visible question" depends on which steps are hidden right now
  // (e.g. agencyName is hidden when hasAgency === false).
  const lastVisibleIndex = useMemo(() => {
    for (let i = steps.length - 1; i >= 0; i--) {
      if (!steps[i].isHidden?.(state)) return i
    }
    return steps.length - 1
  }, [steps, state])

  const isLastQuestion = stepIndex >= lastVisibleIndex

  const submit = useCallback(async () => {
    setPhase('submitting')
    setSubmitError(null)
    try {
      const fd = new FormData()
      // Strip File objects out before stringifying.
      const { photos, ...rest } = state
      fd.append('payload', JSON.stringify(rest))
      if (photos.headshot) fd.append('headshot', photos.headshot)
      if (photos.fullbody) fd.append('fullbody', photos.fullbody)
      if (photos.profileLeft) fd.append('profileLeft', photos.profileLeft)
      if (photos.profileRight) fd.append('profileRight', photos.profileRight)
      photos.additional.forEach((file) => fd.append('additional', file))

      const res = await fetch('/api/models', {
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
    if (!currentStep) return
    if (!currentStep.isValid(state) && !currentStep.isOptional) return
    if (stepIndex >= lastVisibleIndex) {
      submit()
      return
    }
    // Find the next non-hidden step.
    let nextIndex = stepIndex + 1
    while (nextIndex < steps.length && steps[nextIndex].isHidden?.(state)) {
      nextIndex++
    }
    if (nextIndex >= steps.length) {
      submit()
      return
    }
    indexHistoryRef.current.push(nextIndex)
    setStepIndex(nextIndex)
  }, [currentStep, state, stepIndex, lastVisibleIndex, steps, submit])

  const goBack = useCallback(() => {
    if (indexHistoryRef.current.length <= 1) return
    indexHistoryRef.current.pop()
    const prev = indexHistoryRef.current[indexHistoryRef.current.length - 1]
    setStepIndex(prev)
  }, [])

  if (phase === 'done') {
    return (
      <main className="bg-white">
        <ModelEndScreen />
      </main>
    )
  }

  const hideContinue = currentStep?.hideContinue?.(state) === true

  return (
    <main className="bg-white relative">
      <ProgressBar current={stepIndex + 1} total={steps.length} />
      <BackButton onClick={goBack} hidden={stepIndex === 0 || phase === 'submitting'} />
      <ExitButton hidden={phase === 'submitting'} />

      {/* Honeypot */}
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
            <div className="text-sm text-black/50">Uploading your photos and submitting.</div>
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

              {!hideContinue && (
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
