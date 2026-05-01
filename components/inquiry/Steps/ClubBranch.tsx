'use client'

import {
  ATTENDANCE_OPTIONS,
  BUDGET_OPTIONS,
  CLUB_ACTIVATION_TYPES,
  CLUB_ENGAGEMENT_TYPES,
  EVENT_TIMELINE_OPTIONS,
} from '@/lib/inquiry/schema'
import {
  detailsFileStep,
  detailsMultiSelectStep,
  detailsSelectStep,
  detailsTextAreaStep,
  detailsTextStep,
} from './stepFactories'
import type { StepDef } from './types'

export const clubBranchSteps: StepDef[] = [
  detailsTextStep({
    key: 'club-name',
    prompt: 'Club name',
    field: 'clubName',
    placeholder: 'e.g. Soho House',
  }),
  detailsMultiSelectStep({
    key: 'club-activation',
    prompt: 'What kind of programming are you considering?',
    field: 'activationTypes',
    options: CLUB_ACTIVATION_TYPES,
  }),
  detailsSelectStep({
    key: 'club-engagement',
    prompt: 'How would you like to engage?',
    field: 'engagementType',
    options: CLUB_ENGAGEMENT_TYPES,
  }),
  detailsSelectStep({
    key: 'club-attendance',
    prompt: 'Expected attendance',
    field: 'expectedAttendance',
    options: ATTENDANCE_OPTIONS,
  }),
  detailsSelectStep({
    key: 'club-event-timeline',
    prompt: 'When are you looking to activate?',
    field: 'eventTimeline',
    options: EVENT_TIMELINE_OPTIONS,
  }),
  detailsSelectStep({
    key: 'club-budget',
    prompt: 'Budget range',
    field: 'budget',
    options: BUDGET_OPTIONS,
  }),
  detailsFileStep({
    key: 'club-files',
    prompt: 'Have a brief or deck?',
    helper: 'Optional',
  }),
  detailsTextAreaStep({
    key: 'club-notes',
    prompt: 'Anything else we should know?',
    helper: 'Optional',
    field: 'additionalNotes',
    placeholder: 'Add any context, references, or constraints…',
    required: false,
  }),
]
