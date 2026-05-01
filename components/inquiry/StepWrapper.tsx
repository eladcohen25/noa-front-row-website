'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface StepWrapperProps {
  stepKey: string
  children: ReactNode
  prompt: string
  helper?: string
}

export default function StepWrapper({ stepKey, children, prompt, helper }: StepWrapperProps) {
  return (
    <motion.section
      key={stepKey}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
      className="min-h-[100dvh] w-full flex items-center justify-center px-5 md:px-12 py-24 md:py-28"
    >
      <div className="w-full max-w-2xl flex flex-col gap-8 md:gap-10">
        <header className="flex flex-col gap-3">
          <h2 className="font-typekit text-3xl md:text-5xl leading-tight tracking-tight">
            {prompt}
          </h2>
          {helper && (
            <p className="text-xs md:text-sm uppercase tracking-[0.25em] text-black/50">
              {helper}
            </p>
          )}
        </header>
        <div className="flex flex-col gap-6">{children}</div>
      </div>
    </motion.section>
  )
}
