'use client'
import { Search, Kanban, Calendar, Plus } from 'lucide-react'
import { TRAINING_CONFIG, TRAINING_TYPES } from '@/lib/colors'
import type { TrainingType } from '@/types'
import { useSessionStore } from '@/store'
import { getAvailableSpots, getSessionColumn } from '@/lib/utils'

interface Props {
  view: 'kanban' | 'calendar'
  onViewChange: (v: 'kanban' | 'calendar') => void
  filter: TrainingType | 'all'
  onFilterChange: (f: TrainingType | 'all') => void
  search: string
  onSearchChange: (s: string) => void
  onNewSession: () => void
}

export function Header({ view, onViewChange, filter, onFilterChange, search, onSearchChange, onNewSession }: Props) {
  const sessions = useSessionStore(s => s.sessions)

  const totalAvailable = sessions.reduce((acc, s) => acc + getAvailableSpots(s), 0)
  const openSessions = sessions.filter(s => getSessionColumn(s) !== 'passé').length

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6">
        {/* Top bar */}
        <div className="flex items-center justify-between h-16 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
              🍽️
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-lg leading-tight">Fabic Pipe</h1>
              <p className="text-xs text-gray-400 leading-tight">Pipeline de formations</p>
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
            </div>

            <button
              onClick={onNewSession}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
            >
              <Plus size={15} />
              <span className="hidden sm:inline">Nouvelle session</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 pb-3 overflow-x-auto">
          {/* Search */}
          <div className="relative flex-shrink-0 w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher session, participant..."
              value={search}
              onChange={e => onSearchChange(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
            />
          </div>

          {/* Type filters */}
          <div className="flex items-center gap-2 flex-nowrap">
            <button
              onClick={() => onFilterChange('all')}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-sm font-medium transition-all border ${
                filter === 'all' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              Toutes
            </button>
            {TRAINING_TYPES.map(t => {
              const cfg = TRAINING_CONFIG[t]
              return (
                <button
                  key={t}
                  onClick={() => onFilterChange(t)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all border ${
                    filter === t
                      ? `${cfg.light} ${cfg.text} ${cfg.border} border-2`
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span>{cfg.emoji}</span>
                  <span className="hidden sm:inline">{cfg.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </header>
  )
}
