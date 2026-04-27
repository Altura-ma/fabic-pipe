'use client'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { parseISO } from 'date-fns'
import { useSessionStore } from '@/store'
import type { Session, KanbanColumn, TrainingType } from '@/types'
import { getSessionColumn } from '@/lib/utils'
import { SessionCard } from './SessionCard'
import { SessionModal } from './modals/SessionModal'
import { SessionDetailModal } from './modals/SessionDetailModal'

type StatusFilter = 'all' | KanbanColumn

const STATUS_FILTERS: { id: StatusFilter; label: string; emoji: string; cls: string; activeCls: string }[] = [
  { id: 'all', label: 'Toutes', emoji: '', cls: 'border-gray-200 text-gray-600 bg-white hover:border-gray-300', activeCls: 'border-indigo-600 bg-indigo-600 text-white' },
  { id: 'ouvert', label: 'Disponible', emoji: '🟢', cls: 'border-gray-200 text-gray-600 bg-white hover:border-emerald-300', activeCls: 'border-emerald-500 bg-emerald-50 text-emerald-700' },
  { id: 'presque-complet', label: 'Presque complet', emoji: '🟡', cls: 'border-gray-200 text-gray-600 bg-white hover:border-amber-300', activeCls: 'border-amber-400 bg-amber-50 text-amber-700' },
  { id: 'complet', label: 'Complet', emoji: '🔴', cls: 'border-gray-200 text-gray-600 bg-white hover:border-red-300', activeCls: 'border-red-400 bg-red-50 text-red-700' },
  { id: 'passé', label: 'Terminé', emoji: '⚫', cls: 'border-gray-200 text-gray-600 bg-white hover:border-gray-300', activeCls: 'border-gray-400 bg-gray-100 text-gray-600' },
]

interface Props {
  filter: TrainingType | 'all'
  monthFilter: Date | null
  search: string
}

export function KanbanBoard({ filter, monthFilter, search }: Props) {
  const sessions = useSessionStore(s => s.sessions)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [creatingSession, setCreatingSession] = useState(false)
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [editingSession, setEditingSession] = useState<Session | null>(null)

  const filtered = sessions.filter(s => {
    if (filter !== 'all' && s.type !== filter) return false

    if (monthFilter) {
      const sessionDate = parseISO(s.startDate)
      if (
        sessionDate.getMonth() !== monthFilter.getMonth() ||
        sessionDate.getFullYear() !== monthFilter.getFullYear()
      ) return false
    }

    if (statusFilter !== 'all' && getSessionColumn(s) !== statusFilter) return false

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
  }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())

  const countByStatus = (status: StatusFilter) =>
    sessions.filter(s => {
      if (filter !== 'all' && s.type !== filter) return false
      if (monthFilter) {
        const d = parseISO(s.startDate)
        if (d.getMonth() !== monthFilter.getMonth() || d.getFullYear() !== monthFilter.getFullYear()) return false
      }
      if (status === 'all') return true
      return getSessionColumn(s) === status
    }).length

  return (
    <>
      {/* Status filter buttons */}
      <div className="flex items-center gap-2 flex-wrap mb-5">
        {STATUS_FILTERS.map(f => {
          const count = countByStatus(f.id)
          const active = statusFilter === f.id
          return (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium border-2 transition-all ${active ? f.activeCls : f.cls}`}
            >
              {f.emoji && <span className="text-base leading-none">{f.emoji}</span>}
              {f.label}
              <span className={`ml-1 text-xs font-bold rounded-full px-1.5 py-0.5 ${active ? 'bg-black/10' : 'bg-gray-100 text-gray-500'}`}>
                {count}
              </span>
            </button>
          )
        })}

        <div className="ml-auto">
          <button
            onClick={() => setCreatingSession(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
            style={{ backgroundColor: '#028090' }}
          >
            <Plus size={15} />
            Nouvelle session
          </button>
        </div>
      </div>

      {/* Cards grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-60 text-gray-400">
          <p className="text-4xl mb-3">🍳</p>
          <p className="text-base font-medium">Aucune session correspondante</p>
          <p className="text-sm mt-1">Modifiez les filtres ou créez une nouvelle session</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(session => (
            <SessionCard
              key={session.id}
              session={session}
              onClick={() => setSelectedSession(session)}
            />
          ))}
        </div>
      )}

      {creatingSession && (
        <SessionModal onClose={() => setCreatingSession(false)} />
      )}

      {selectedSession && !editingSession && (
        <SessionDetailModal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
          onEdit={() => {
            setEditingSession(selectedSession)
            setSelectedSession(null)
          }}
        />
      )}

      {editingSession && (
        <SessionModal
          session={editingSession}
          onClose={() => setEditingSession(null)}
        />
      )}
    </>
  )
}
