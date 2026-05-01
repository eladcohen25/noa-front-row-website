import type { ModelFormState } from './types'

/**
 * Strip File objects for JSON serialization to the /api/models payload.
 */
export function modelFormToJsonPayload(state: ModelFormState): Record<string, unknown> {
  const { photos: _p, ...rest } = state
  return rest as unknown as Record<string, unknown>
}
