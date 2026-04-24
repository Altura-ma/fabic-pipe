'use client'
import { useState, useEffect } from 'react'
import { X, Plus, Edit2, Trash2, ArrowLeftRight, Clock, MapPin, Users, Calendar, Timer } from 'lucide-react'
import { useSessionStore } from '@/store'
import type { Session, Participant } from '@/types'
import { TRAINING_CONFIG } from '@/lib/colors'
import { TrainingBadge, StatusBadge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { ParticipantModal } from './ParticipantModal'
import { MoveParticipantModal } from './MoveParticipantModal'
import {
  getAvailableSpots, getReservedCount, getConfirmedCount,
  isReservationExpired, formatReservationCountdown,
  formatDateTime, formatTimeRange, formatDateShort,
} from '@/lib/utils'

interface Props {
  session: Session
  onClose: () => void
  onEdit: () => void
}

export function SessionDetailModal({ session: initialSession, onClose, onEdit }: Props) {
  const sessions = useSessionStore(s => s.sessions)
  const removeParticipant = useSessionStore(s => s.removeParticipant)
  const reserveSpot = useSessionStore(s => s.reserveSpot)
  const confirmParticipant = useSessionStore(s => s.confirmParticipant)
  const deleteSession = useSessionStore(s => s.deleteSession)

  const session = sessions.find(s => s.id === initialSession.id) ?? initialSession

  const [addingParticipant, setAddingParticipant] = useState(false)
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null)
  const [movingParticipant, setMovingParticipant] = useState<Participant | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [, forceRender] = useState(0)

  useEffect(() => {
    const id = setInterval(() => forceRender(n => n + 1), 30000)
    return () => clearInterval(id)
  }, [])

  const cfg = TRAINING_CONFIG[session.type]
  const available = getAvailableSpots(session)
  const reserved = getReservedCount(session)
  const confirmed = getConfirmedCount(session)

  const activeParticipants = session.participants.filter(p => !isReservationExpired(p))
  const expiredParticipants = session.participants.filter(p => isReservationExpired(p))

  function handleDelete() {
    deleteSession(session.id)
    onClose()
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className={`p-5 ${cfg.light} rounded-t-2xl border-b ${cfg.border}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <TrainingBadge type={session.type} />
                </div>
                <h2 className={`text-xl font-bold ${cfg.text} mt-1`}>{session.title}</h2>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    {formatDateShort(session.startDate)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} />
                    {formatTimeRange(session.startDate, session.endDate)}
                  </span>
                  {session.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin size={14} />
                      {session.location}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={onEdit} className="p-2 hover:bg-white/80 rounded-lg transition-colors" title="Modifier">
                  <Edit2 size={16} className="text-gray-600" />
                </button>
                <button onClick={onClose} className="p-2 hover:bg-black/10 rounded-lg transition-colors">
                  <X size={18} />
                </button>
              </div>
            </div>

            {session.description && (
              <p className="text-sm text-gray-600 mt-3">{session.description}</p>
            )}
          </div>

          {/* Stats */}
          <div className="p-5 border-b grid grid-cols-3 gap-4">
            <Stat label="Confirmés" value={confirmed} total={session.maxParticipants} color={cfg.hex} />
            <Stat label="Réservés" value={reserved} color="#fbbf24" />
            <Stat label="Places libres" value={available} color={available === 0 ? '#ef4444' : '#22c55e'} />
          </div>

          {/* Progress */}
          <div className="px-5 py-3 border-b">
            <ProgressBar value={confirmed} max={session.maxParticipants} reserved={reserved} colorHex={cfg.hex} />
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>{confirmed} / {session.maxParticipants} inscrits</span>
              {reserved > 0 && <span className="text-yellow-600">{reserved} réservation{reserved > 1 ? 's' : ''} en attente</span>}
            </div>
          </div>

          {/* Participants */}
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">Participants ({activeParticipants.length})</h3>
              <button
                onClick={() => setAddingParticipant(true)}
                disabled={available === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: cfg.hex }}
              >
                <Plus size={14} />
                Ajouter
              </button>
            </div>

            {activeParticipants.length === 0 && expiredParticipants.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">Aucun participant pour l&apos;instant</p>
            ) : (
              <div className="space-y-2">
                {activeParticipants.map(p => (
                  <ParticipantRow
                    key={p.id}
                    participant={p}
                    onEdit={() => setEditingParticipant(p)}
                    onMove={() => setMovingParticipant(p)}
                    onRemove={() => removeParticipant(session.id, p.id)}
                    onReserve={() => reserveSpot(session.id, p.id)}
                    onConfirm={() => confirmParticipant(session.id, p.id)}
                  />
                ))}
              </div>
            )}

            {expiredParticipants.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-gray-400 font-medium mb-2 uppercase tracking-wide">Réservations expirées</p>
                <div className="space-y-2 opacity-60">
                  {expiredParticipants.map(p => (
                    <ParticipantRow
                      key={p.id}
                      participant={p}
                      onEdit={() => setEditingParticipant(p)}
                      onMove={() => setMovingParticipant(p)}
                      onRemove={() => removeParticipant(session.id, p.id)}
                      onReserve={() => reserveSpot(session.id, p.id)}
                      onConfirm={() => confirmParticipant(session.id, p.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Delete */}
          <div className="px-5 pb-5">
            {deleteConfirm ? (
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl border border-red-200">
                <p className="text-sm text-red-700 flex-1">Supprimer cette session et tous ses participants ?</p>
                <button onClick={() => setDeleteConfirm(false)} className="text-sm text-gray-500 hover:text-gray-700">Annuler</button>
                <button onClick={handleDelete} className="text-sm font-medium text-red-600 hover:text-red-800">Supprimer</button>
              </div>
            ) : (
              <button onClick={() => setDeleteConfirm(true)} className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-600 transition-colors">
                <Trash2 size={14} />
                Supprimer la session
              </button>
            )}
          </div>
        </div>
      </div>

      {addingParticipant && (
        <ParticipantModal session={session} onClose={() => setAddingParticipant(false)} />
      )}
      {editingParticipant && (
        <ParticipantModal session={session} participant={editingParticipant} onClose={() => setEditingParticipant(null)} />
      )}
      {movingParticipant && (
        <MoveParticipantModal session={session} participant={movingParticipant} onClose={() => setMovingParticipant(null)} />
      )}
    </>
  )
}

function Stat({ label, value, total, color }: { label: string; value: number; total?: number; color: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold" style={{ color }}>
        {value}{total !== undefined && <span className="text-sm text-gray-400 font-normal">/{total}</span>}
      </div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  )
}

function ParticipantRow({
  participant: p,
  onEdit,
  onMove,
  onRemove,
  onReserve,
  onConfirm,
}: {
  participant: Participant
  onEdit: () => void
  onMove: () => void
  onRemove: () => void
  onReserve: () => void
  onConfirm: () => void
}) {
  const expired = isReservationExpired(p)

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group">
      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600 shrink-0">
        {p.firstName[0]}{p.lastName[0]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm text-gray-800">{p.firstName} {p.lastName}</span>
          <StatusBadge status={p.status} />
          {p.status === 'réservé' && p.reservationExpiresAt && !expired && (
            <span className="flex items-center gap-1 text-xs text-yellow-600 font-medium">
              <Timer size={11} />
              {formatReservationCountdown(p.reservationExpiresAt)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          {p.phone && <span className="text-xs text-gray-500">{p.phone}</span>}
          {p.email && <span className="text-xs text-gray-400 truncate">{p.email}</span>}
        </div>
        {p.notes && <p className="text-xs text-gray-400 italic mt-0.5">{p.notes}</p>}
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        {p.status === 'inscrit' && (
          <button onClick={onReserve} title="Réserver la place" className="p-1.5 hover:bg-yellow-100 rounded-lg transition-colors text-yellow-600">
            <Timer size={14} />
          </button>
        )}
        {(p.status === 'réservé' || p.status === 'inscrit') && (
          <button onClick={onConfirm} title="Confirmer" className="p-1.5 hover:bg-emerald-100 rounded-lg transition-colors text-emerald-600 text-xs font-bold">
            ✓
          </button>
        )}
        <button onClick={onMove} title="Déplacer vers une autre session" className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors text-blue-500">
          <ArrowLeftRight size={14} />
        </button>
        <button onClick={onEdit} title="Modifier" className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors text-gray-500">
          <Edit2 size={14} />
        </button>
        <button onClick={onRemove} title="Retirer" className="p-1.5 hover:bg-red-100 rounded-lg transition-colors text-red-400">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}
