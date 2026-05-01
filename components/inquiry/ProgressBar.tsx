'use client'

interface ProgressBarProps {
  current: number
  total: number
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(1, total === 0 ? 0 : current / total))
  return (
    <div
      className="fixed top-0 left-0 right-0 h-1 bg-black/15 z-50"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={current}
    >
      <div
        className="h-full bg-black"
        style={{
          width: `${pct * 100}%`,
          transition: 'width 400ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
      />
    </div>
  )
}
