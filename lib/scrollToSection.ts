/**
 * Smoothly scroll the document to a section anchor with a small downward
 * offset, so the previous section's tail can't peek in at the top of the
 * viewport. Without the offset, `scrollIntoView({ block: 'start' })` lands
 * exactly on the section's top edge, which on desktop reads as "slightly
 * too high" — the eye still catches the bottom of the prior section.
 *
 * Pass `home` to scroll to the absolute top (the hero takes the whole
 * viewport, so no offset is needed).
 */

const DESKTOP_OFFSET_PX = 72
const MOBILE_OFFSET_PX = 24

export function scrollToSection(id: string) {
  if (typeof window === 'undefined') return
  const el = document.getElementById(id)
  if (!el) return

  if (id === 'home') {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } else {
    const isMobile = window.matchMedia('(max-width: 767px)').matches
    const offset = isMobile ? MOBILE_OFFSET_PX : DESKTOP_OFFSET_PX
    const top = el.getBoundingClientRect().top + window.scrollY + offset
    window.scrollTo({ top, behavior: 'smooth' })
  }

  if (window.history.replaceState) {
    const hash = id === 'home' ? '/' : `/#${id}`
    window.history.replaceState(null, '', hash)
  }
}
