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

interface Column {
  id: KanbanColumn
  label: string
  emoji: string
  emptyText: string
  headerClass: string
}

const COLUMNS: Column[] = [
  { id: 'ouvert', label: 'Disponible', emoji: '🟢', emptyText: 'Aucune session ouverte', headerClass: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  { id: 'presque-complet', label: 'Presque complet', emoji: '🟡', emptyText: 'Aucune session presque complète', headerClass: 'bg-amber-50 border-amber-200 text-amber-700' },
  { id: 'complet', label: 'Complet', emoji: '🔴', emptyText: 'Aucune session complète', headerClass: 'bg-red-50 border-red-200 text-red-700' },
  { id: 'passé', label: 'Terminé', emoji: '⚫', emptyText: 'Aucune session passée', headerClass: 'bg-gray-100 border-gray-200 text-gray-500' },
]

interface Props {
  filter: TrainingType | 'all'
  monthFilter: Date | null
  search: string
}

export function KanbanBoard({ filter, monthFilter, search }: Props) {
  const sessions = useSessionStore(s => s.sessions)
  const [creatingSession, setCreatingSession] = useState(false)
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [editingSession, setEditingSession] = useState<Session | null>(null)

  const filtered = sessions.filter(s => {
    if (filter !== 'all' && s.type !== filter) return false
    if (monthFilter) {
      const sessionDate = parseISO(s.startDate)
      if (sessionDate.getMonth() !== monthFilter.getMonth() || sessionDate.getFullYear() !== monthFilter.getFullYear()) {
        return false
      }
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

  const byColumn = (col: KanbanColumn) =>
    filtered
      .filter(s => getSessionColumn(s) === col)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-4 min-h-[calc(100vh-200px)]">
        {COLUMNS.map(col => {
          const colSessions = byColumn(col.id)
          return (
            <div key={col.id} className="flex-shrink-0 w-80">
              <div className={`flex items-center justify-between px-4 py-2.5 rounded-xl border mb-3 ${col.headerClass}`}>
                <div className="flex items-center gap-2">
                  <span>{col.emoji}</span>
                  <span className="font-semibold text-sm">{col.label}</span>
                </div>
                <span className="text-sm font-bold">{colSessions.length}</span>
              </div>

              <div className="space-y-3">
                {colSessions.length === 0 ? (
                  <div className="flex items-center justify-center h-24 border-2 border-dashed border-gray-200 rounded-xl text-xs text-gray-400">
                    {col.emptyText}
                  </div>
                ) : (
                  colSessions.map(session => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      onClick={() => setSelectedSession(session)}
                    />
                  ))
                )}

                {col.id === 'ouvert' && (
                  <button
                    onClick={() => setCreatingSession(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 hover:border-gray-300 rounded-xl text-sm text-gray-400 hover:text-gray-500 transition-colors"
                  >
                    <Plus size={15} />
                    Nouvelle session
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

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
