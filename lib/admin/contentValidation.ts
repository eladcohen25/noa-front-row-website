import type { SiteContentRow } from './content'

const URL_RE = /^(https?:\/\/|\/|mailto:|tel:)/i
const NUMBER_RE = /^-?\d+(\.\d+)?$/

/**
 * Returns an error message if the value is invalid for the given field,
 * or null if it's valid. Empty values are valid unless the field is required.
 */
export function validateField(field: SiteContentRow, value: string | null): string | null {
  const v = (value ?? '').trim()

  if (field.required && v === '') {
    return `${field.label} is required.`
  }
  if (v === '') return null

  switch (field.type) {
    case 'url':
      if (!URL_RE.test(v)) {
        return 'Use a full URL (https://…) or a path starting with /.'
      }
      return null
    case 'number':
      if (!NUMBER_RE.test(v)) return 'Enter a number.'
      return null
    case 'image':
      if (!URL_RE.test(v)) return 'Image must be a URL.'
      return null
    default:
      return null
  }
}

/**
 * Normalizes a field's value before save. Currently:
 *   - URL fields auto-prepend https:// if the user typed a bare host.
 *   - Trims surrounding whitespace.
 */
export function normalizeFieldValue(
  field: SiteContentRow,
  value: string | null,
): string | null {
  if (value === null) return null
  const v = value
  if (field.type === 'url') {
    const t = v.trim()
    if (t === '') return ''
    if (!URL_RE.test(t)) return `https://${t}`
    return t
  }
  return v
}
