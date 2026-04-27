'use client'
import { useState, useEffect } from 'react'
import { Header } from '@/components/Header'
import { KanbanBoard } from '@/components/KanbanBoard'
import { CalendarView } from '@/components/CalendarView'
import { TableView } from '@/components/TableView'
import { SessionModal } from '@/components/modals/SessionModal'
import { useSessionStore } from '@/store'
import type { TrainingType } from '@/types'

export default function Home() {
  const [view, setView] = useState<'kanban' | 'calendar' | 'table'>('kanban')
  const [filter, setFilter] = useState<TrainingType | 'all'>('all')
  const [monthFilter, setMonthFilter] = useState<Date | null>(null)
  const [search, setSearch] = useState('')
  const [creatingSession, setCreatingSession] = useState(false)

  const releaseExpiredReservations = useSessionStore(s => s.releaseExpiredReservations)

  useEffect(() => {
    releaseExpiredReservations()
    const id = setInterval(releaseExpiredReservations, 60 * 1000)
    return () => clearInterval(id)
  }, [releaseExpiredReservations])

  return (
    <>
      <Header
        view={view}
        onViewChange={setView}
        filter={filter}
        onFilterChange={setFilter}
        monthFilter={monthFilter}
        onMonthFilterChange={setMonthFilter}
        search={search}
        onSearchChange={setSearch}
        onNewSession={() => setCreatingSession(true)}
      />

      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6">
        {view === 'kanban' && <KanbanBoard filter={filter} monthFilter={monthFilter} search={search} />}
        {view === 'calendar' && <CalendarView filter={filter} search={search} />}
        {view === 'table' && <TableView filter={filter} monthFilter={monthFilter} search={search} />}
      </main>

      {creatingSession && (
        <SessionModal onClose={() => setCreatingSession(false)} />
      )}
    </>
  )
}
