'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function ModelEndScreen() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
      className="min-h-[100dvh] w-full flex items-center justify-center px-5 md:px-12 py-24"
    >
      <div className="flex flex-col items-center text-center gap-8 max-w-xl">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
          className="w-32 h-32 md:w-40 md:h-40"
        >
          <video
            src="/Noa%203-D%20logo.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-contain"
          />
        </motion.div>

        <h1 className="font-typekit text-4xl md:text-6xl leading-tight">
          Submission <span className="font-typekit-italic">received.</span>
        </h1>

        <p className="text-base md:text-lg leading-relaxed text-black/70 max-w-md">
          We review every submission. If there&rsquo;s a fit, we&rsquo;ll be in touch. Follow{' '}
          <a
            href="https://www.instagram.com/thefrontrowlv"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-4 text-black hover:opacity-70 transition-opacity"
          >
            @thefrontrowlv
          </a>{' '}
          for casting calls and what&rsquo;s next.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/"
            className="px-8 py-3 rounded-full text-xs uppercase tracking-wider border border-black/30 hover:bg-black hover:text-white hover:border-black transition-colors"
          >
            Continue to website
          </Link>
          <a
            href="https://www.instagram.com/thefrontrowlv"
            target="_blank"
            rel="noreferrer"
            className="px-8 py-3 rounded-full text-xs uppercase tracking-wider border border-gold/70 hover:bg-black hover:text-white hover:border-black transition-colors"
          >
            Follow on Instagram
          </a>
        </div>
      </div>
    </motion.section>
  )
}
