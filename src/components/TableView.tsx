'use client'
import { useState } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { parseISO, differenceInDays, format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useSessionStore } from '@/store'
import type { Session, TrainingType } from '@/types'
import { TRAINING_CONFIG } from '@/lib/colors'
import { getAvailableSpots, getReservedCount, getConfirmedCount, getSessionColumn } from '@/lib/utils'
import { SessionDetailModal } from './modals/SessionDetailModal'
import { SessionModal } from './modals/SessionModal'

interface Props {
  filter: TrainingType | 'all'
  monthFilter: Date | null
  search: string
}

type SortKey = 'type' | 'title' | 'startDate' | 'duration' | 'confirmed' | 'reserved' | 'available' | 'status'
type SortDir = 'asc' | 'desc'

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  ouvert:           { label: 'Disponible',     cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  'presque-complet':{ label: 'Presque complet', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  complet:          { label: 'Complet',         cls: 'bg-red-50 text-red-700 border-red-200' },
  passé:            { label: 'Terminé',         cls: 'bg-gray-100 text-gray-500 border-gray-200' },
}

export function TableView({ filter, monthFilter, search }: Props) {
  const sessions = useSessionStore(s => s.sessions)
  const [sortKey, setSortKey] = useState<SortKey>('startDate')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [editingSession, setEditingSession] = useState<Session | null>(null)

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const filtered = sessions
    .filter(s => {
      if (filter !== 'all' && s.type !== filter) return false
      if (monthFilter) {
        const d = parseISO(s.startDate)
        if (d.getMonth() !== monthFilter.getMonth() || d.getFullYear() !== monthFilter.getFullYear()) return false
      }
      if (search) {
        const q = search.toLowerCase()
        return (
          s.title.toLowerCase().includes(q) ||
          s.location?.toLowerCase().includes(q) ||
          s.participants.some(p =>
            `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
            p.phone.includes(q) ||
            p.email.toLowerCase().includes(q)
          )
        )
      }
      return true
    })
    .sort((a, b) => {
      let va: string | number = 0
      let vb: string | number = 0
      switch (sortKey) {
        case 'type':      va = TRAINING_CONFIG[a.type].label; vb = TRAINING_CONFIG[b.type].label; break
        case 'title':     va = a.title; vb = b.title; break
        case 'startDate': va = a.startDate; vb = b.startDate; break
        case 'duration':
          va = differenceInDays(parseISO(a.endDate), parseISO(a.startDate)) + 1
          vb = differenceInDays(parseISO(b.endDate), parseISO(b.startDate)) + 1
          break
        case 'confirmed': va = getConfirmedCount(a); vb = getConfirmedCount(b); break
        case 'reserved':  va = getReservedCount(a);  vb = getReservedCount(b);  break
        case 'available': va = getAvailableSpots(a); vb = getAvailableSpots(b); break
        case 'status':    va = getSessionColumn(a);  vb = getSessionColumn(b);  break
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })

  function Th({ label, col }: { label: string; col: SortKey }) {
    const active = sortKey === col
    return (
      <th
        onClick={() => toggleSort(col)}
        className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer select-none hover:bg-gray-100 transition-colors whitespace-nowrap"
      >
        <div className="flex items-center gap-1">
          {label}
          <span className="text-gray-300">
            {active
              ? sortDir === 'asc' ? <ChevronUp size={13} className="text-gray-600" /> : <ChevronDown size={13} className="text-gray-600" />
              : <ChevronsUpDown size={13} />
            }
          </span>
        </div>
      </th>
    )
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Summary bar */}
        <div className="flex items-center gap-6 px-5 py-3 border-b bg-gray-50 text-sm text-gray-500">
          <span><strong className="text-gray-800">{filtered.length}</strong> session{filtered.length !== 1 ? 's' : ''}</span>
          <span><strong className="text-emerald-600">{filtered.reduce((a, s) => a + getAvailableSpots(s), 0)}</strong> places disponibles</span>
          <span><strong className="text-amber-600">{filtered.reduce((a, s) => a + getReservedCount(s), 0)}</strong> réservations en cours</span>
          <span><strong className="text-gray-800">{filtered.reduce((a, s) => a + getConfirmedCount(s), 0)}</strong> inscrits</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <Th label="Formation" col="type" />
                <Th label="Titre" col="title" />
                <Th label="Début" col="startDate" />
                <Th label="Durée" col="duration" />
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Lieu</th>
                <Th label="Inscrits" col="confirmed" />
                <Th label="Réservés" col="reserved" />
                <Th label="Disponibles" col="available" />
                <Th label="Statut" col="status" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-gray-400">
                    Aucune session correspondante
                  </td>
                </tr>
              ) : (
                filtered.map(session => {
                  const cfg = TRAINING_CONFIG[session.type]
                  const confirmed = getConfirmedCount(session)
                  const reserved = getReservedCount(session)
                  const available = getAvailableSpots(session)
                  const col = getSessionColumn(session)
                  const status = STATUS_LABEL[col]
                  const duration = differenceInDays(parseISO(session.endDate), parseISO(session.startDate)) + 1
                  const pct = Math.round((confirmed / session.maxParticipants) * 100)

                  return (
                    <tr
                      key={session.id}
                      onClick={() => setSelectedSession(session)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors group"
                    >
                      {/* Formation */}
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border"
                          style={{ backgroundColor: cfg.hex + '18', color: cfg.hex, borderColor: cfg.hex + '40' }}
                        >
                          {cfg.emoji} {cfg.label}
                        </span>
                      </td>

                      {/* Titre */}
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-800 group-hover:text-gray-900">{session.title}</span>
                      </td>

                      {/* Début */}
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {format(parseISO(session.startDate), 'dd MMM yyyy', { locale: fr })}
                      </td>

                      {/* Durée */}
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {duration} jour{duration > 1 ? 's' : ''}
                      </td>

                      {/* Lieu */}
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {session.location ?? '—'}
                      </td>

                      {/* Inscrits avec mini barre */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${pct}%`, backgroundColor: cfg.hex }}
                            />
                          </div>
                          <span className="text-gray-700 font-medium tabular-nums">
                            {confirmed}<span className="text-gray-400 font-normal">/{session.maxParticipants}</span>
                          </span>
                        </div>
                      </td>

                      {/* Réservés */}
                      <td className="px-4 py-3">
                        {reserved > 0
                          ? <span className="font-semibold text-amber-600">{reserved}</span>
                          : <span className="text-gray-300">—</span>
                        }
                      </td>

                      {/* Disponibles */}
                      <td className="px-4 py-3">
                        <span className={`font-semibold ${available === 0 ? 'text-red-500' : available <= 2 ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {available}
                        </span>
                      </td>

                      {/* Statut */}
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${status.cls}`}>
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedSession && !editingSession && (
        <SessionDetailModal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
          onEdit={() => { setEditingSession(selectedSession); setSelectedSession(null) }}
        />
      )}
      {editingSession && (
        <SessionModal session={editingSession} onClose={() => setEditingSession(null)} />
      )}
    </>
  )
}
