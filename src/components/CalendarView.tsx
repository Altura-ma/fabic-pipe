'use client'
import { useState } from 'react'
import { ChevronLeft, ChevronRight, Users } from 'lucide-react'
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, isToday,
  addMonths, subMonths, parseISO, format,
} from 'date-fns'
import { fr } from 'date-fns/locale'
import { useSessionStore } from '@/store'
import type { Session, TrainingType } from '@/types'
import { TRAINING_CONFIG } from '@/lib/colors'
import { getAvailableSpots, getConfirmedCount } from '@/lib/utils'
import { SessionDetailModal } from './modals/SessionDetailModal'
import { SessionModal } from './modals/SessionModal'

interface Props {
  filter: TrainingType | 'all'
  search: string
}

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

export function CalendarView({ filter, search }: Props) {
  const sessions = useSessionStore(s => s.sessions)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [editingSession, setEditingSession] = useState<Session | null>(null)

  const filtered = sessions.filter(s => {
    if (filter !== 'all' && s.type !== filter) return false
    if (search) {
      const q = search.toLowerCase()
      return s.title.toLowerCase().includes(q) || s.location?.toLowerCase().includes(q)
    }
    return true
  })

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  function sessionsOnDay(day: Date): Session[] {
    return filtered.filter(s => isSameDay(parseISO(s.startDate), day))
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Month navigation */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <h2 className="text-lg font-bold text-gray-800 capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: fr })}
          </h2>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b">
          {WEEKDAYS.map(d => (
            <div key={d} className="py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {days.map((day, i) => {
            const daySessions = sessionsOnDay(day)
            const inMonth = isSameMonth(day, currentMonth)
            const today = isToday(day)

            return (
              <div
                key={i}
                className={`min-h-[110px] border-b border-r p-1.5 ${!inMonth ? 'bg-gray-50' : ''} ${
                  i % 7 === 6 ? 'border-r-0' : ''
                }`}
              >
                <div className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium mb-1 ${
                  today ? 'bg-indigo-600 text-white' : inMonth ? 'text-gray-700' : 'text-gray-300'
                }`}>
                  {format(day, 'd')}
                </div>

                <div className="space-y-1">
                  {daySessions.slice(0, 3).map(s => (
                    <CalEvent key={s.id} session={s} onClick={() => setSelectedSession(s)} />
                  ))}
                  {daySessions.length > 3 && (
                    <div className="text-xs text-gray-400 px-1">
                      +{daySessions.length - 3} autre{daySessions.length - 3 > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3">
        {Object.entries(TRAINING_CONFIG).map(([type, cfg]) => (
          <div key={type} className="flex items-center gap-1.5 text-xs text-gray-600">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cfg.hex }} />
            {cfg.emoji} {cfg.label}
          </div>
        ))}
      </div>

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
        <SessionModal session={editingSession} onClose={() => setEditingSession(null)} />
      )}
    </>
  )
}

function CalEvent({ session, onClick }: { session: Session; onClick: () => void }) {
  const cfg = TRAINING_CONFIG[session.type]
  const available = getAvailableSpots(session)
  const confirmed = getConfirmedCount(session)

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded px-1.5 py-1 text-xs truncate hover:opacity-80 transition-opacity"
      style={{ backgroundColor: cfg.hex + '22', color: cfg.hex, borderLeft: `3px solid ${cfg.hex}` }}
      title={`${session.title} — ${available} place${available !== 1 ? 's' : ''} libre${available !== 1 ? 's' : ''}`}
    >
      <span className="font-medium truncate block">{cfg.emoji} {session.title}</span>
      <span className="flex items-center gap-0.5 opacity-70">
        <Users size={9} />
        {confirmed}/{session.maxParticipants}
        {available === 0 && ' • Complet'}
      </span>
    </button>
  )
}
