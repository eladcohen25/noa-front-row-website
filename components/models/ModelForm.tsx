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
import { createBrowserClient } from '@/lib/supabase/client'

type Phase = 'questions' | 'submitting' | 'done' | 'error'

const STORAGE_BUCKET = 'tfr-model-photos'

function extOf(file: File): string {
  const fromName = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (fromName) return fromName
  if (file.type === 'image/png') return 'png'
  if (file.type === 'image/webp') return 'webp'
  if (file.type === 'image/heic') return 'heic'
  if (file.type === 'image/heif') return 'heif'
  return 'jpg'
}

export default function ModelForm() {
  const [state, setState] = useState<ModelFormState>(INITIAL_MODEL_FORM_STATE)
  const [stepIndex, setStepIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('questions')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)
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
    setProgress(null)
    try {
      const { photos } = state
      if (
        !photos.headshot ||
        !photos.fullbody ||
        !photos.profileLeft ||
        !photos.profileRight
      ) {
        throw new Error('Please attach all four required photos before submitting.')
      }

      // Phase 1: ask the server for signed upload URLs (small JSON request,
      // no body-size issue on Vercel).
      const urlRes = await fetch('/api/models/photo-urls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headshot: { ext: extOf(photos.headshot) },
          fullbody: { ext: extOf(photos.fullbody) },
          profileLeft: { ext: extOf(photos.profileLeft) },
          profileRight: { ext: extOf(photos.profileRight) },
          additional: photos.additional.map((f) => ({ ext: extOf(f) })),
        }),
      })
      const urlData = (await urlRes.json().catch(() => ({}))) as {
        ok?: boolean
        error?: string
        submissionId?: string
        urls?: {
          headshot: { path: string; token: string }
          fullbody: { path: string; token: string }
          profileLeft: { path: string; token: string }
          profileRight: { path: string; token: string }
          additional: { path: string; token: string }[]
        }
      }
      if (!urlRes.ok || !urlData.ok || !urlData.urls || !urlData.submissionId) {
        throw new Error(urlData.error || 'Could not prepare upload (URLs).')
      }

      // Phase 2: upload each photo directly to Supabase Storage. This bypasses
      // Vercel entirely so individual files can be much larger than 4.5 MB.
      const supabase = createBrowserClient()
      const uploads: { file: File; slot: { path: string; token: string }; label: string }[] = [
        { file: photos.headshot, slot: urlData.urls.headshot, label: 'headshot' },
        { file: photos.fullbody, slot: urlData.urls.fullbody, label: 'fullbody' },
        { file: photos.profileLeft, slot: urlData.urls.profileLeft, label: 'profile left' },
        { file: photos.profileRight, slot: urlData.urls.profileRight, label: 'profile right' },
        ...photos.additional.map((file, i) => ({
          file,
          slot: urlData.urls!.additional[i]!,
          label: `additional ${i + 1}`,
        })),
      ]
      setProgress({ done: 0, total: uploads.length })
      let done = 0
      for (const u of uploads) {
        const { error } = await supabase.storage
          .from(STORAGE_BUCKET)
          .uploadToSignedUrl(u.slot.path, u.slot.token, u.file, {
            contentType: u.file.type || 'image/jpeg',
          })
        if (error) {
          throw new Error(`Could not upload ${u.label}: ${error.message}`)
        }
        done++
        setProgress({ done, total: uploads.length })
      }

      // Phase 3: submit the JSON payload referencing those paths.
      const res = await fetch('/api/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...modelFormToJsonPayload(state),
          submissionId: urlData.submissionId,
          photos: {
            headshot: urlData.urls.headshot.path,
            fullbody: urlData.urls.fullbody.path,
            profileLeft: urlData.urls.profileLeft.path,
            profileRight: urlData.urls.profileRight.path,
            additional: urlData.urls.additional.map((a) => a.path),
          },
        }),
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
            ? 'The request timed out. Try again or check your connection.'
            : res.status === 413
              ? 'Submission was too large. Refresh and try again.'
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
            <div className="text-sm text-black/50">
              {progress
                ? `Uploading photos (${progress.done}/${progress.total})…`
                : 'Preparing your submission…'}
            </div>
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
