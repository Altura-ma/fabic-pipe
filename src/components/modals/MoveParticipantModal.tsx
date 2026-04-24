'use client'
import { useState } from 'react'
import { X, ArrowRight, Calendar, MapPin, Users } from 'lucide-react'
import { useSessionStore } from '@/store'
import type { Session, Participant } from '@/types'
import { TRAINING_CONFIG } from '@/lib/colors'
import { TrainingBadge, AvailabilityPill } from '@/components/ui/Badge'
import { getAvailableSpots, formatDate, formatTimeRange } from '@/lib/utils'

interface Props {
  session: Session
  participant: Participant
  onClose: () => void
}

export function MoveParticipantModal({ session, participant, onClose }: Props) {
  const sessions = useSessionStore(s => s.sessions)
  const moveParticipant = useSessionStore(s => s.moveParticipant)
  const [targetId, setTargetId] = useState<string | null>(null)

  const eligible = sessions.filter(s => {
    if (s.id === session.id) return false
    const avail = getAvailableSpots(s)
    return avail > 0
  })

  function handleMove() {
    if (!targetId) return
    moveParticipant(session.id, targetId, participant.id)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b bg-gray-50 rounded-t-2xl">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Déplacer un participant</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {participant.firstName} {participant.lastName}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-black/10 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          {/* From */}
          <div className="mb-4 p-3 rounded-xl bg-gray-50 border border-gray-200">
            <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Depuis</p>
            <p className="font-medium text-gray-800">{session.title}</p>
            <div className="flex items-center gap-2 mt-1">
              <TrainingBadge type={session.type} />
              <span className="text-xs text-gray-500">{formatDate(session.startDate)}</span>
            </div>
          </div>

          <div className="flex items-center justify-center mb-4">
            <ArrowRight size={20} className="text-gray-400" />
          </div>

          {/* To */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Vers</p>
            {eligible.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">
                Aucune autre session disponible avec des places libres.
              </p>
            ) : (
              <div className="space-y-2">
                {eligible.map(s => {
                  const avail = getAvailableSpots(s)
                  const cfg = TRAINING_CONFIG[s.type]
                  return (
                    <label
                      key={s.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        targetId === s.id
                          ? `${cfg.light} ${cfg.border}`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="target"
                        value={s.id}
                        checked={targetId === s.id}
                        onChange={() => setTargetId(s.id)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm text-gray-800">{s.title}</span>
                          <TrainingBadge type={s.type} />
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><Calendar size={11} />{formatDate(s.startDate)}</span>
                          <span className="flex items-center gap-1">{formatTimeRange(s.startDate, s.endDate)}</span>
                          {s.location && <span className="flex items-center gap-1"><MapPin size={11} />{s.location}</span>}
                        </div>
                        <div className="mt-1.5">
                          <AvailabilityPill available={avail} max={s.maxParticipants} />
                        </div>
                      </div>
                    </label>
                  )
                })}
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-5">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary">
              Annuler
            </button>
            <button
              type="button"
              onClick={handleMove}
              disabled={!targetId}
              className="flex-1 btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Déplacer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
