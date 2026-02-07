'use client'

interface SectionHeaderProps {
  date?: string
  title: string
}

export default function SectionHeader({ date, title }: SectionHeaderProps) {
  return (
    <div className="text-center py-16 md:py-24 bg-white">
      {date && (
        <p className="text-xs tracking-widest uppercase mb-4 text-gray-500">
          {date}
        </p>
      )}
      <h2 className="text-3xl md:text-5xl font-la-foonte uppercase tracking-wide text-black">
        {title}
      </h2>
    </div>
  )
}
