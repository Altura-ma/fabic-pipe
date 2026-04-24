'use client'
import { cn } from '@/lib/utils'
import { TRAINING_CONFIG } from '@/lib/colors'
import type { TrainingType, ParticipantStatus } from '@/types'

export function TrainingBadge({ type }: { type: TrainingType }) {
  const cfg = TRAINING_CONFIG[type]
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', cfg.light, cfg.text, 'border', cfg.border)}>
      <span>{cfg.emoji}</span>
      {cfg.label}
    </span>
  )
}

export function StatusBadge({ status }: { status: ParticipantStatus }) {
  const map: Record<ParticipantStatus, { label: string; cls: string }> = {
    inscrit: { label: 'Inscrit', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
    réservé: { label: 'Réservé', cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    confirmé: { label: 'Confirmé', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  }
  const { label, cls } = map[status]
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border', cls)}>
      {label}
    </span>
  )
}

export function AvailabilityPill({ available, max }: { available: number; max: number }) {
  const pct = available / max
  let cls = 'bg-emerald-100 text-emerald-700'
  if (available === 0) cls = 'bg-red-100 text-red-700'
  else if (pct <= 0.25) cls = 'bg-orange-100 text-orange-700'
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold', cls)}>
      {available === 0 ? 'Complet' : `${available} place${available > 1 ? 's' : ''} libre${available > 1 ? 's' : ''}`}
    </span>
  )
}
