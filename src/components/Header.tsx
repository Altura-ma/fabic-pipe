'use client'
import Image from 'next/image'
import { Search, Kanban, Calendar, Plus, Table2 } from 'lucide-react'
import { format, addMonths, subMonths, startOfMonth } from 'date-fns'
import { fr } from 'date-fns/locale'
import { TRAINING_CONFIG, TRAINING_TYPES } from '@/lib/colors'
import type { TrainingType } from '@/types'
import { useSessionStore } from '@/store'
import { getAvailableSpots, getSessionColumn } from '@/lib/utils'

interface Props {
  view: 'kanban' | 'calendar' | 'table'
  onViewChange: (v: 'kanban' | 'calendar' | 'table') => void
  filter: TrainingType | 'all'
  onFilterChange: (f: TrainingType | 'all') => void
  monthFilter: Date | null
  onMonthFilterChange: (m: Date | null) => void
  search: string
  onSearchChange: (s: string) => void
  onNewSession: () => void
}

export function Header({
  view, onViewChange,
  filter, onFilterChange,
  monthFilter, onMonthFilterChange,
  search, onSearchChange,
  onNewSession,
}: Props) {
  const sessions = useSessionStore(s => s.sessions)

  const totalAvailable = sessions.reduce((acc, s) => acc + getAvailableSpots(s), 0)
  const openSessions = sessions.filter(s => getSessionColumn(s) !== 'passé').length

  // Build next 6 months options
  const monthOptions: Date[] = []
  for (let i = 0; i < 6; i++) {
    monthOptions.push(addMonths(startOfMonth(new Date()), i))
  }

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6">
        {/* Top bar */}
        <div className="flex items-center justify-between h-16 gap-4">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Lafabic"
              width={40}
              height={40}
              className="rounded-xl object-contain"
              priority
            />
            <div>
              <h1 className="font-bold text-gray-900 text-lg leading-tight">Lafabic</h1>
              <p className="text-xs text-gray-400 leading-tight">Pipeline des sessions · Montpellier</p>
            </div>
          </div>

          {/* Stats rapides */}
          <div className="hidden md:flex items-center gap-6 text-sm">
            <div className="text-center">
              <div className="font-bold text-gray-800">{openSessions}</div>
              <div className="text-xs text-gray-400">Sessions actives</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-emerald-600">{totalAvailable}</div>
              <div className="text-xs text-gray-400">Places disponibles</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => onViewChange('kanban')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  view === 'kanban' ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Kanban size={15} />
                <span className="hidden sm:inline">Kanban</span>
              </button>
              <button
                onClick={() => onViewChange('calendar')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  view === 'calendar' ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Calendar size={15} />
                <span className="hidden sm:inline">Calendrier</span>
              </button>
              <button
                onClick={() => onViewChange('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  view === 'table' ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Table2 size={15} />
                <span className="hidden sm:inline">Tableau</span>
              </button>
            </div>

            <button
              onClick={onNewSession}
              className="flex items-center gap-1.5 px-4 py-2 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
              style={{ backgroundColor: '#028090' }}
            >
              <Plus size={15} />
              <span className="hidden sm:inline">Nouvelle session</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 pb-3">
          {/* Search */}
          <div className="relative w-56 shrink-0">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Nom, téléphone, session..."
              value={search}
              onChange={e => onSearchChange(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': '#028090' } as React.CSSProperties}
            />
          </div>

          {/* Month filter */}
          <select
            value={monthFilter ? monthFilter.toISOString() : ''}
            onChange={e => onMonthFilterChange(e.target.value ? new Date(e.target.value) : null)}
            className="shrink-0 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent text-gray-600"
          >
            <option value="">Tous les mois</option>
            {monthOptions.map(m => (
              <option key={m.toISOString()} value={m.toISOString()}>
                {format(m, 'MMMM yyyy', { locale: fr })}
              </option>
            ))}
          </select>

          {/* Type filters */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => onFilterChange('all')}
              className={`shrink-0 px-3 py-1.5 rounded-xl text-sm font-medium transition-all border ${
                filter === 'all'
                  ? 'text-white border-transparent'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
              style={filter === 'all' ? { backgroundColor: '#028090' } : undefined}
            >
              Toutes
            </button>
            {TRAINING_TYPES.map(t => {
              const cfg = TRAINING_CONFIG[t]
              const active = filter === t
              return (
                <button
                  key={t}
                  onClick={() => onFilterChange(t)}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all border-2 ${
                    active ? 'text-white' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                  style={active ? { backgroundColor: cfg.hex, borderColor: cfg.hex } : undefined}
                >
                  <span>{cfg.emoji}</span>
                  <span className="hidden md:inline">{cfg.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </header>
  )
}
