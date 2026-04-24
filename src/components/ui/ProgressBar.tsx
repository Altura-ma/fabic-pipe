'use client'
import { cn } from '@/lib/utils'

interface Props {
  value: number
  max: number
  reserved?: number
  colorHex?: string
}

export function ProgressBar({ value, max, reserved = 0, colorHex }: Props) {
  const pct = Math.min((value / max) * 100, 100)
  const resPct = Math.min((reserved / max) * 100, 100 - pct)

  return (
    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
      <div className="flex h-full">
        <div
          className="h-full rounded-l transition-all duration-300"
          style={{ width: `${pct}%`, backgroundColor: colorHex ?? '#6b7280' }}
        />
        {reserved > 0 && (
          <div
            className="h-full transition-all duration-300"
            style={{ width: `${resPct}%`, backgroundColor: '#fbbf24', opacity: 0.7 }}
          />
        )}
      </div>
    </div>
  )
}
