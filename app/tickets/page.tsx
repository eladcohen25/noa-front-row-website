'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import ScrollReveal from '@/components/ScrollReveal'

// ========================================
// PASSWORD GATE TOGGLE
// Set to true to require password, false to go directly to tickets
// ========================================
const REQUIRE_PASSWORD = true
// ========================================

// ========================================
// PAGE VISIBILITY TOGGLE
// Set to true to show the Tickets page
// ========================================
const SHOW_TICKETS_PAGE = false
// ========================================

const ACCESS_CODE = 'TFR2026'
const TICKETING_URL = 'https://tickets.thefrontrow.vegas/'

const ERROR_MESSAGES = [
  'Access denied.',
  'Not on the list.',
  'Invitation required.',
  'This code doesn\'t open doors.',
  'Nice try — still not front row.'
]

export default function Tickets() {
  if (!SHOW_TICKETS_PAGE) {
    return null
  }
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const attemptCountRef = useRef(0)

  const handleOpenModal = useCallback(() => {
    setIsModalOpen(true)
    setPassword('')
    setError('')
    attemptCountRef.current = 0
  }, [])

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
    setPassword('')
    setError('')
  }, [])

  const handleSubmit = useCallback(() => {
    if (password === ACCESS_CODE) {
      window.open(TICKETING_URL, '_blank', 'noopener,noreferrer')
      handleCloseModal()
    } else {
      const errorIndex = attemptCountRef.current % ERROR_MESSAGES.length
      setError(ERROR_MESSAGES[errorIndex])
      attemptCountRef.current += 1
    }
  }, [password, handleCloseModal])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit()
    } else if (e.key === 'Escape') {
      handleCloseModal()
    }
  }, [handleSubmit, handleCloseModal])

  // Focus input when modal opens
  useEffect(() => {
    if (isModalOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isModalOpen])

  return (
    <>
      <div className="min-h-screen bg-white pt-28 md:pt-40 pb-24 px-4 md:px-8">
        <div className="max-w-3xl mx-auto md:text-center">
          <ScrollReveal>
            <h1 className="text-5xl font-typekit mb-12">Tickets</h1>
          </ScrollReveal>

          <ScrollReveal>
            <p className="text-base leading-relaxed mb-10">
              An immersive fashion event in Las Vegas where every guest holds a front-row seat to the future.
            </p>
          </ScrollReveal>

          <ScrollReveal>
            <button
              onClick={() => {
                if (REQUIRE_PASSWORD) {
                  handleOpenModal()
                } else {
                  window.open(TICKETING_URL, '_blank', 'noopener,noreferrer')
                }
              }}
              className="inline-block px-10 py-4 bg-black text-white text-sm tracking-widest uppercase transition-all duration-300 hover:bg-gray-900 hover:scale-[1.02]"
            >
              Buy Tickets
            </button>
          </ScrollReveal>
        </div>
      </div>

      {/* Password Gate Modal - only renders when REQUIRE_PASSWORD is true */}
      {REQUIRE_PASSWORD && isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)'
          }}
          onClick={handleCloseModal}
        >
          <div 
            className="bg-white px-10 py-12 mx-4 max-w-sm w-full text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-typekit text-2xl mb-8 tracking-wide">
              Enter Access Code
            </h2>
            
            <input
              ref={inputRef}
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError('')
              }}
              onKeyDown={handleKeyDown}
              placeholder="Enter Code"
              className="w-full px-4 py-3 border border-gray-300 text-center text-sm tracking-widest uppercase focus:outline-none focus:border-black transition-colors"
              autoComplete="off"
            />
            
            {error && (
              <p className="text-red-500 text-xs mt-3 tracking-wide">
                {error}
              </p>
            )}
            
            <button
              onClick={handleSubmit}
              className="w-full mt-6 px-8 py-3 bg-black text-white text-sm tracking-widest uppercase transition-all duration-300 hover:bg-gray-900"
            >
              Unlock Access
            </button>
            
            <button
              onClick={handleCloseModal}
              className="mt-6 text-xs text-gray-400 tracking-wide uppercase hover:text-gray-600 transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      )}
    </>
  )
}



