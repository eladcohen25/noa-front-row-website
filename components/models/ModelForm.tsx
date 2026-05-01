'use client'

import { AnimatePresence } from 'framer-motion'
import { useCallback, useMemo, useRef, useState } from 'react'
import ContinueButton from '@/components/inquiry/ContinueButton'
import ExitButton from '@/components/inquiry/ExitButton'
import ProgressBar from '@/components/inquiry/ProgressBar'
import StepWrapper from '@/components/inquiry/StepWrapper'
import ModelEndScreen from './Steps/EndScreen'
import { MODEL_FORM_STEPS } from './Steps/steps'
import { INITIAL_MODEL_FORM_STATE, type ModelFormState } from '@/lib/models/types'
import { modelFormToJsonPayload } from '@/lib/models/submit'

type Phase = 'questions' | 'submitting' | 'done' | 'error'

export default function ModelForm() {
  const [state, setState] = useState<ModelFormState>(INITIAL_MODEL_FORM_STATE)
  const [stepIndex, setStepIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('questions')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const indexHistoryRef = useRef<number[]>([0])
  // Always-fresh state ref so advance() called from a setTimeout sees the
  // latest selection — otherwise auto-advance after a click requires 2 clicks.
  const stateRef = useRef(state)
  stateRef.current = state

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
      fd.append('payload', JSON.stringify(modelFormToJsonPayload(state)))
      const { photos } = state
      if (photos.headshot) fd.append('headshot', photos.headshot)
      if (photos.fullbody) fd.append('fullbody', photos.fullbody)
      if (photos.profileLeft) fd.append('profileLeft', photos.profileLeft)
      if (photos.profileRight) fd.append('profileRight', photos.profileRight)
      photos.additional.forEach((file) => fd.append('additional', file))

      const res = await fetch('/api/models', {
        method: 'POST',
        body: fd,
      })
      const text = await res.text()
      let data: { ok?: boolean; error?: string } = {}
      try {
        data = text ? (JSON.parse(text) as typeof data) : {}
      } catch {
        // Non-JSON body (e.g. Vercel HTML 504 page). Fall through.
      }
      if (!res.ok || !data.ok) {
        const fallback =
          res.status === 504 || res.status === 408
            ? 'The request timed out. Try again with smaller photos (under 10 MB each) or a faster connection.'
            : `Server returned ${res.status} ${res.statusText || ''}`.trim()
        throw new Error(data.error || fallback)
      }
      setPhase('done')
    } catch (e: unknown) {
      const message =
        e instanceof Error
          ? e.message
          : 'Could not reach the server. Check your connection and try again.'
      setSubmitError(message)
      setPhase('error')
    }
  }, [state])

  const advance = useCallback(() => {
    if (!currentStep) return
    const latest = stateRef.current
    if (!currentStep.isValid(latest) && !currentStep.isOptional) return
    if (stepIndex >= lastVisibleIndex) {
      submit()
      return
    }
    let nextIndex = stepIndex + 1
    while (nextIndex < steps.length && steps[nextIndex].isHidden?.(latest)) {
      nextIndex++
    }
    if (nextIndex >= steps.length) {
      submit()
      return
    }
    indexHistoryRef.current.push(nextIndex)
    setStepIndex(nextIndex)
  }, [currentStep, stepIndex, lastVisibleIndex, steps, submit])

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

              <div className="flex items-center gap-6 mt-2 flex-wrap">
                {stepIndex > 0 && (
                  <button
                    type="button"
                    onClick={goBack}
                    aria-label="Back to previous question"
                    className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-black/50 hover:text-black transition-colors"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M7.5 2.5L4 6L7.5 9.5"
                        stroke="currentColor"
                        strokeWidth="1.25"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>Back</span>
                  </button>
                )}
                {!hideContinue && (
                  <ContinueButton
                    label={isLastQuestion ? 'Submit' : 'Continue'}
                    disabled={!currentStep.isValid(state)}
                    onClick={advance}
                    skipLabel={currentStep.isOptional ? 'Skip' : undefined}
                    onSkip={currentStep.isOptional ? advance : undefined}
                  />
                )}
              </div>
            </StepWrapper>
          )
        )}
      </AnimatePresence>
    </main>
  )
}
