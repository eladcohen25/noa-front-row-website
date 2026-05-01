'use client'

import {
  ATTENDANCE_OPTIONS,
  BUDGET_OPTIONS,
  EVENT_TIMELINE_OPTIONS,
  HOTEL_ACTIVATION_TYPES,
  HOTEL_GOALS,
} from '@/lib/inquiry/schema'
import {
  detailsFileStep,
  detailsMultiSelectStep,
  detailsSelectStep,
  detailsTextAreaStep,
  detailsTextStep,
} from './stepFactories'
import type { StepDef } from './types'

export const hotelBranchSteps: StepDef[] = [
  detailsTextStep({
    key: 'hotel-property',
    prompt: 'Property name',
    field: 'propertyName',
    placeholder: 'e.g. The Bel-Aire',
  }),
  detailsTextStep({
    key: 'hotel-space',
    prompt: 'What kind of space?',
    field: 'spaceType',
    placeholder: 'rooftop, ballroom, restaurant, lobby…',
  }),
  detailsMultiSelectStep({
    key: 'hotel-activation',
    prompt: 'What kind of activation are you imagining?',
    field: 'activationTypes',
    options: HOTEL_ACTIVATION_TYPES,
  }),
  detailsSelectStep({
    key: 'hotel-attendance',
    prompt: 'Expected attendance',
    field: 'expectedAttendance',
    options: ATTENDANCE_OPTIONS,
  }),
  detailsSelectStep({
    key: 'hotel-event-timeline',
    prompt: 'When are you thinking of activating?',
    field: 'eventTimeline',
    options: EVENT_TIMELINE_OPTIONS,
  }),
  detailsSelectStep({
    key: 'hotel-budget',
    prompt: 'Budget range',
    field: 'budget',
    options: BUDGET_OPTIONS,
  }),
  detailsMultiSelectStep({
    key: 'hotel-goals',
    prompt: 'What are you hoping this delivers?',
    field: 'goals',
    options: HOTEL_GOALS,
  }),
  detailsFileStep({
    key: 'hotel-files',
    prompt: 'Have a brief or deck?',
    helper: 'Optional — drop one in if helpful',
  }),
  detailsTextAreaStep({
    key: 'hotel-notes',
    prompt: 'Anything else we should know?',
    helper: 'Optional',
    field: 'additionalNotes',
    placeholder: 'Add any context, references, or constraints…',
    required: false,
  }),
]
