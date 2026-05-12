'use client'

import { useCallback, useEffect, useState, type ReactNode } from 'react'
import ScrollReveal from '@/components/ScrollReveal'

export interface WorkProject {
  id: string
  title: string
  subtitle?: string
  coverImage: string
  content: ReactNode
}

interface WorkSectionProps {
  headline?: string
  eyebrow?: string
  projects: WorkProject[]
}

// Body class consumed by globals.css to hide the floating site chrome (TFR
// logo, top-left nav, hamburger) while a fullscreen takeover is mounted.
const FULLSCREEN_BODY_CLASS = 'tfr-fullscreen-active'

export default function WorkSection({
  headline = 'Work',
  eyebrow = 'Selected Projects',
  projects,
}: WorkSectionProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const activeProject = activeId ? projects.find((p) => p.id === activeId) ?? null : null

  const closeProject = useCallback(() => {
    setActiveId(null)
  }, [])

  const openProject = useCallback((id: string) => {
    setActiveId(id)
  }, [])

  // Bounce back to the gallery whenever the user navigates to #lookbook
  // from the nav (covers both the inline hero nav and the floating top-left
  // nav, which dispatches a custom event so we don't depend on hashchange
  // firing for replaceState updates).
  useEffect(() => {
    if (typeof window === 'undefined') return
    const reset = () => {
      const hash = window.location.hash.replace('#', '')
      if (hash === 'lookbook' || hash === '') {
        setActiveId(null)
      }
    }
    window.addEventListener('hashchange', reset)
    window.addEventListener('tfr:work-reset', reset as EventListener)
    return () => {
      window.removeEventListener('hashchange', reset)
      window.removeEventListener('tfr:work-reset', reset as EventListener)
    }
  }, [])

  // While the overlay is mounted: lock body scroll, broadcast a body class so
  // chrome can hide itself, and close on Escape.
  useEffect(() => {
    if (!activeProject) return
    if (typeof document === 'undefined') return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.body.classList.add(FULLSCREEN_BODY_CLASS)

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeProject()
    }
    window.addEventListener('keydown', handleKey)

    return () => {
      document.body.style.overflow = previousOverflow
      document.body.classList.remove(FULLSCREEN_BODY_CLASS)
      window.removeEventListener('keydown', handleKey)
    }
  }, [activeProject, closeProject])

  return (
    <>
      {/* Gallery always lives inline in the page so it's still there when the
          overlay closes — the user lands right back on the cards with no
          scroll jump. */}
      <div className="bg-white pt-28 md:pt-40 pb-28 md:pb-40 px-5 md:px-12">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-14 md:mb-20">
              {eyebrow && (
                <p className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-black/45 mb-4">
                  {eyebrow}
                </p>
              )}
              <h1 className="font-typekit text-4xl md:text-6xl leading-tight">{headline}</h1>
            </div>
          </ScrollReveal>

          <div
            className={`grid gap-8 md:gap-10 ${
              projects.length > 1 ? 'md:grid-cols-2' : 'md:grid-cols-1 max-w-2xl mx-auto'
            }`}
          >
            {projects.map((project) => (
              <ScrollReveal key={project.id}>
                <button
                  type="button"
                  onClick={() => openProject(project.id)}
                  className="group block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-black/40 rounded-sm"
                  aria-label={`Open ${project.title} case study`}
                >
                  <div className="relative aspect-[4/5] md:aspect-[3/4] overflow-hidden bg-black/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={project.coverImage}
                      alt={project.title}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    />

                    <div
                      className="absolute inset-x-0 bottom-0 h-2/3 pointer-events-none"
                      style={{
                        background:
                          'linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0) 100%)',
                      }}
                    />

                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-500" />

                    <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 text-white">
                      <h2 className="font-la-foonte uppercase tracking-wide text-2xl md:text-4xl leading-tight">
                        {project.title}
                      </h2>
                      {project.subtitle && (
                        <p className="mt-2 md:mt-3 text-[10px] md:text-xs uppercase tracking-[0.3em] text-white/85">
                          {project.subtitle}
                        </p>
                      )}
                    </div>

                    <div className="absolute top-5 right-5 md:top-6 md:right-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 text-black text-[10px] uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span>View</span>
                      <span aria-hidden>→</span>
                    </div>
                  </div>
                </button>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>

      {/* Fullscreen takeover: covers the whole viewport, has its own scroll
          container, and sits above the floating site chrome. The chrome is
          hidden via the body class above so its mix-blend-mode can't bleed
          through. */}
      {activeProject && (
        <div
          className="fixed inset-0 z-[300] bg-white overflow-y-auto tfr-overlay-enter"
          role="dialog"
          aria-modal="true"
          aria-label={`${activeProject.title} case study`}
        >
          <div className="sticky top-0 z-30 bg-white/85 backdrop-blur-sm border-b border-black/5">
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={closeProject}
                className="inline-flex items-center gap-2 text-[10px] md:text-xs uppercase tracking-[0.3em] text-black/70 hover:text-black transition-colors"
              >
                <span aria-hidden className="text-base leading-none">←</span>
                <span>Back to Work</span>
              </button>
              <span className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-black/45 truncate">
                {activeProject.title}
              </span>
            </div>
          </div>

          {activeProject.content}
        </div>
      )}
    </>
  )
}
