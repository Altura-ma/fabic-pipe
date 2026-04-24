import { format, parseISO, isPast, differenceInMinutes, differenceInHours } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Session, Participant, KanbanColumn } from '@/types'

export function getSessionColumn(session: Session): KanbanColumn {
  const now = new Date()
  const end = parseISO(session.endDate)
  if (isPast(end)) return 'passé'

  const active = session.participants.filter(p => p.status !== 'réservé' || !isReservationExpired(p))
  const reserved = session.participants.filter(p => p.status === 'réservé' && !isReservationExpired(p))
  const total = active.length

  if (total >= session.maxParticipants) return 'complet'
  const remaining = session.maxParticipants - total
  if (remaining <= 2 || remaining / session.maxParticipants <= 0.2) return 'presque-complet'
  return 'ouvert'
}

export function isReservationExpired(participant: Participant): boolean {
  if (participant.status !== 'réservé' || !participant.reservationExpiresAt) return false
  return isPast(parseISO(participant.reservationExpiresAt))
}

export function getAvailableSpots(session: Session): number {
  const confirmed = session.participants.filter(
    p => p.status !== 'réservé' || !isReservationExpired(p)
  ).length
  return Math.max(0, session.maxParticipants - confirmed)
}

export function getReservedCount(session: Session): number {
  return session.participants.filter(
    p => p.status === 'réservé' && !isReservationExpired(p)
  ).length
}

export function getConfirmedCount(session: Session): number {
  return session.participants.filter(p => p.status !== 'réservé' || !isReservationExpired(p)).length
}

export function formatReservationCountdown(expiresAt: string): string {
  const now = new Date()
  const expiry = parseISO(expiresAt)
  const mins = differenceInMinutes(expiry, now)
  if (mins <= 0) return 'Expiré'
  if (mins < 60) return `${mins}min`
  const hrs = differenceInHours(expiry, now)
  const remainingMins = mins - hrs * 60
  return remainingMins > 0 ? `${hrs}h${remainingMins}min` : `${hrs}h`
}

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), 'EEE dd MMM', { locale: fr })
}

export function formatDateTime(dateStr: string): string {
  return format(parseISO(dateStr), "dd MMM yyyy 'à' HH:mm", { locale: fr })
}

export function formatDateShort(dateStr: string): string {
  return format(parseISO(dateStr), 'dd/MM/yyyy', { locale: fr })
}

export function formatTimeRange(start: string, end: string): string {
  return `${format(parseISO(start), 'HH:mm')} - ${format(parseISO(end), 'HH:mm')}`
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
