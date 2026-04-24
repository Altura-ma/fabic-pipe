'use client'
import { useState, useEffect } from 'react'
import { Clock, MapPin, Users, Timer, ChevronRight } from 'lucide-react'
import type { Session } from '@/types'
import { TRAINING_CONFIG } from '@/lib/colors'
import { TrainingBadge, AvailabilityPill } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import {
  getAvailableSpots, getReservedCount, getConfirmedCount,
  formatDate, formatTimeRange, getSessionColumn,
} from '@/lib/utils'

interface Props {
  session: Session
  onClick: () => void
}

export function SessionCard({ session, onClick }: Props) {
  const cfg = TRAINING_CONFIG[session.type]
  const available = getAvailableSpots(session)
  const reserved = getReservedCount(session)
  const confirmed = getConfirmedCount(session)
  const column = getSessionColumn(session)
  const isPast = column === 'passé'

  const [, forceRender] = useState(0)
  useEffect(() => {
    const id = setInterval(() => forceRender(n => n + 1), 60000)
    return () => clearInterval(id)
  }, [])

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border-2 shadow-sm hover:shadow-md transition-all cursor-pointer group ${
        isPast ? 'opacity-60 border-gray-200' : cfg.border
      }`}
      style={!isPast ? { borderLeftWidth: 4, borderLeftColor: cfg.hex } : undefined}
    >
      {/* Color stripe top */}
      <div className="h-1 rounded-t-xl" style={{ backgroundColor: isPast ? '#d1d5db' : cfg.hex }} />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <TrainingBadge type={session.type} />
            <h3 className="font-semibold text-gray-900 mt-1.5 leading-tight">{session.title}</h3>
          </div>
          <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-400 shrink-0 mt-1 transition-colors" />
        </div>

        {/* Date & Time */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {formatDate(session.startDate)}
          </span>
          <span>{formatTimeRange(session.startDate, session.endDate)}</span>
          {session.location && (
            <span className="flex items-center gap-1">
              <MapPin size={11} />
              {session.location}
            </span>
          )}
        </div>

        {/* Progress bar */}
        {!isPast && (
          <div className="mb-3">
            <ProgressBar value={confirmed} max={session.maxParticipants} reserved={reserved} colorHex={cfg.hex} />
            <div className="flex justify-between mt-1 text-xs text-gray-400">
              <span>{confirmed}/{session.maxParticipants}</span>
              {reserved > 0 && (
                <span className="text-yellow-500 flex items-center gap-0.5">
                  <Timer size={10} />
                  {reserved} réservé{reserved > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Availability */}
        <div className="flex items-center justify-between">
          <AvailabilityPill available={available} max={session.maxParticipants} />
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Users size={11} />
            {session.participants.length} / {session.maxParticipants}
          </div>
        </div>
      </div>
    </div>
  )
}
