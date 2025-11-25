'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface KlaviyoSignupOverlayProps {
  isOpen: boolean
  onClose: () => void
}

export default function KlaviyoSignupOverlay({ isOpen, onClose }: KlaviyoSignupOverlayProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[100] pointer-events-auto"
          />

          {/* Form Container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed inset-0 flex items-center justify-center z-[101] pointer-events-none"
          >
            <div
              className="bg-white rounded-lg border border-gray-200 p-8 max-w-md w-full mx-4 shadow-xl pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-la-foonte text-2xl">Early Access</h3>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Klaviyo Form Container */}
              <div className="klaviyo-form-container">
                <div className="klaviyo-form-NEWID" />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}



