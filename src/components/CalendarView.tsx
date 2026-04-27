'use client'
import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, isToday, isAfter, isBefore,
  addMonths, subMonths, parseISO, format, startOfDay,
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

interface EventPlacement {
  session: Session
  startCol: number  // 1-based
  span: number
  lane: number
  continuesLeft: boolean
  continuesRight: boolean
}

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

function computePlacements(weekDays: Date[], sessions: Session[]): EventPlacement[] {
  const weekStart = startOfDay(weekDays[0])
  const weekEnd = startOfDay(weekDays[6])

  const weekSessions = sessions.filter(s => {
    const start = startOfDay(parseISO(s.startDate))
    const end = startOfDay(parseISO(s.endDate))
    return !isAfter(start, weekEnd) && !isBefore(end, weekStart)
  })

  // Longer events first, then by start date
  weekSessions.sort((a, b) => {
    const aStart = startOfDay(parseISO(a.startDate))
    const bStart = startOfDay(parseISO(b.startDate))
    const aEnd = startOfDay(parseISO(a.endDate))
    const bEnd = startOfDay(parseISO(b.endDate))
    const aDur = aEnd.getTime() - aStart.getTime()
    const bDur = bEnd.getTime() - bStart.getTime()
    if (bDur !== aDur) return bDur - aDur
    return aStart.getTime() - bStart.getTime()
  })

  const placements: EventPlacement[] = []
  const occupied: boolean[][] = [] // occupied[lane][col 0-6]

  for (const session of weekSessions) {
    const sessionStart = startOfDay(parseISO(session.startDate))
    const sessionEnd = startOfDay(parseISO(session.endDate))

    const continuesLeft = isBefore(sessionStart, weekStart)
    const continuesRight = isAfter(sessionEnd, weekEnd)

    const startIdx = continuesLeft
      ? 0
      : weekDays.findIndex(d => isSameDay(d, sessionStart))
    const endIdx = continuesRight
      ? 6
      : weekDays.findIndex(d => isSameDay(d, sessionEnd))

    if (startIdx === -1 || endIdx === -1) continue

    const span = endIdx - startIdx + 1

    // Find first available lane
    let lane = 0
    while (true) {
      if (!occupied[lane]) occupied[lane] = new Array(7).fill(false)
      const fits = !occupied[lane].slice(startIdx, endIdx + 1).some(Boolean)
      if (fits) {
        for (let i = startIdx; i <= endIdx; i++) occupied[lane][i] = true
        break
      }
      lane++
    }

    placements.push({ session, startCol: startIdx + 1, span, lane, continuesLeft, continuesRight })
  }

  return placements
}

function WeekEvents({
  weekDays,
  sessions,
  onSessionClick,
}: {
  weekDays: Date[]
  sessions: Session[]
  onSessionClick: (s: Session) => void
}) {
  const placements = computePlacements(weekDays, sessions)

  if (placements.length === 0) {
    return <div className="h-2" />
  }

  const maxLane = placements.reduce((m, p) => Math.max(m, p.lane), 0)

  return (
    <div
      className="grid pb-1.5 pt-0.5 px-0.5"
      style={{
        gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
        gridAutoRows: '24px',
        minHeight: `${(maxLane + 1) * 26}px`,
        gap: '2px 0',
      }}
    >
      {placements.map(({ session, startCol, span, lane, continuesLeft, continuesRight }) => {
        const cfg = TRAINING_CONFIG[session.type]
        const available = getAvailableSpots(session)
        const confirmed = getConfirmedCount(session)
        return (
          <button
            key={session.id}
            onClick={() => onSessionClick(session)}
            title={`${session.title} — ${confirmed}/${session.maxParticipants} inscrits${available === 0 ? ' — Complet' : ` — ${available} place${available > 1 ? 's' : ''} libre${available > 1 ? 's' : ''}`}`}
            className="flex items-center text-xs font-medium px-1.5 hover:opacity-80 transition-opacity overflow-hidden h-[22px] self-start"
            style={{
              gridColumn: `${startCol} / span ${span}`,
              gridRow: lane + 1,
              backgroundColor: cfg.hex + '28',
              color: cfg.hex,
              borderLeft: continuesLeft ? 'none' : `3px solid ${cfg.hex}`,
              borderTopLeftRadius: continuesLeft ? 0 : '9999px',
              borderBottomLeftRadius: continuesLeft ? 0 : '9999px',
              borderTopRightRadius: continuesRight ? 0 : '9999px',
              borderBottomRightRadius: continuesRight ? 0 : '9999px',
              marginLeft: continuesLeft ? 0 : '2px',
              marginRight: continuesRight ? 0 : '2px',
            }}
          >
            <span className="truncate whitespace-nowrap">
              {cfg.emoji} {session.title}
              {available === 0
                ? <span className="ml-1 opacity-70">Complet</span>
                : <span className="ml-1 opacity-70">{confirmed}/{session.maxParticipants}</span>
              }
            </span>
          </button>
        )
      })}
    </div>
  )
}

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
  const allDays = eachDayOfInterval({ start: calStart, end: calEnd })

  // Group into weeks
  const weeks: Date[][] = []
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7))
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Month navigation */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <h2 className="text-lg font-bold text-gray-800 capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: fr })}
          </h2>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b bg-gray-50">
          {WEEKDAYS.map((d, i) => (
            <div
              key={d}
              className={`py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide ${i < 6 ? 'border-r border-gray-100' : ''}`}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Weeks */}
        <div>
          {weeks.map((weekDays, wi) => (
            <div key={wi} className={wi < weeks.length - 1 ? 'border-b border-gray-100' : ''}>
              {/* Day number row */}
              <div className="grid grid-cols-7">
                {weekDays.map((day, di) => {
                  const inMonth = isSameMonth(day, currentMonth)
                  const today = isToday(day)
                  return (
                    <div
                      key={di}
                      className={`${di < 6 ? 'border-r border-gray-100' : ''} ${!inMonth ? 'bg-gray-50/60' : ''} pt-1.5 pb-0 px-2 flex justify-end`}
                    >
                      <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${
                        today
                          ? 'bg-indigo-600 text-white'
                          : inMonth
                            ? 'text-gray-700'
                            : 'text-gray-300'
                      }`}>
                        {format(day, 'd')}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Events for this week */}
              <WeekEvents
                weekDays={weekDays}
                sessions={filtered}
                onSessionClick={setSelectedSession}
              />
            </div>
          ))}
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
