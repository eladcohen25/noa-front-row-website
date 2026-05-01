// Unit conversion helpers — used by the public form (UI toggle) and by
// the API route (which always stores cm + US shoe).

export type LengthUnit = 'imperial' | 'metric'
export type ShoeUnit = 'us' | 'eu' | 'uk'

export function ftInToCm(feet: number, inches: number): number {
  return Math.round((feet * 30.48 + inches * 2.54) * 10) / 10
}

export function cmToFtIn(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54
  const feet = Math.floor(totalInches / 12)
  const inches = Math.round(totalInches - feet * 12)
  return { feet, inches }
}

export function inToCm(inches: number): number {
  return Math.round(inches * 2.54 * 10) / 10
}

export function cmToIn(cm: number): number {
  return Math.round((cm / 2.54) * 10) / 10
}

// Women's shoe size conversions. Approximate but standard reference table.
// We always store US in the DB; this is just for the toggle on the form.
const SHOE_US_TO_EU: Record<string, number> = {
  '4': 34,
  '4.5': 34.5,
  '5': 35,
  '5.5': 35.5,
  '6': 36,
  '6.5': 37,
  '7': 37.5,
  '7.5': 38,
  '8': 38.5,
  '8.5': 39,
  '9': 39.5,
  '9.5': 40,
  '10': 40.5,
  '10.5': 41,
  '11': 41.5,
  '11.5': 42,
  '12': 42.5,
  '13': 43.5,
  '14': 44.5,
  '15': 45.5,
  '16': 46.5,
  '17': 47.5,
  '18': 48.5,
}

export function shoeUsToEu(us: number): number {
  const key = us.toString()
  return SHOE_US_TO_EU[key] ?? Math.round(us + 31.5)
}

export function shoeUsToUk(us: number): number {
  return Math.max(2, Math.round((us - 2) * 10) / 10)
}

export function shoeEuToUs(eu: number): number {
  const entry = Object.entries(SHOE_US_TO_EU).find(([, v]) => v === eu)
  if (entry) return Number(entry[0])
  return Math.round((eu - 31.5) * 10) / 10
}

export function shoeUkToUs(uk: number): number {
  return Math.round((uk + 2) * 10) / 10
}

export function ageFromDob(dob: string | Date): number {
  const d = typeof dob === 'string' ? new Date(dob) : dob
  if (Number.isNaN(d.getTime())) return 0
  const now = new Date()
  let age = now.getFullYear() - d.getFullYear()
  const m = now.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--
  return age
}
