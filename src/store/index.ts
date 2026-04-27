import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import { addHours } from 'date-fns'
import type { Session, SessionFormData, Participant, ParticipantFormData, TrainingType } from '@/types'
import { DEFAULT_MAX_PARTICIPANTS } from '@/lib/colors'

interface SessionStore {
  sessions: Session[]
  addSession: (data: SessionFormData) => Session
  updateSession: (id: string, data: Partial<SessionFormData>) => void
  deleteSession: (id: string) => void
  addParticipant: (sessionId: string, data: ParticipantFormData) => void
  updateParticipant: (sessionId: string, participantId: string, data: Partial<ParticipantFormData>) => void
  removeParticipant: (sessionId: string, participantId: string) => void
  moveParticipant: (fromSessionId: string, toSessionId: string, participantId: string) => void
  reserveSpot: (sessionId: string, participantId: string) => void
  confirmParticipant: (sessionId: string, participantId: string) => void
  releaseExpiredReservations: () => void
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      sessions: getSeedData(),

      addSession: (data) => {
        const session: Session = {
          ...data,
          id: uuidv4(),
          participants: [],
          createdAt: new Date().toISOString(),
        }
        set(state => ({ sessions: [...state.sessions, session] }))
        return session
      },

      updateSession: (id, data) => {
        set(state => ({
          sessions: state.sessions.map(s => s.id === id ? { ...s, ...data } : s),
        }))
      },

      deleteSession: (id) => {
        set(state => ({ sessions: state.sessions.filter(s => s.id !== id) }))
      },

      addParticipant: (sessionId, data) => {
        const participant: Participant = {
          ...data,
          id: uuidv4(),
          registeredAt: new Date().toISOString(),
          reservationExpiresAt: data.status === 'réservé'
            ? addHours(new Date(), get().sessions.find(s => s.id === sessionId)?.reservationHoldHours ?? 24).toISOString()
            : undefined,
        }
        set(state => ({
          sessions: state.sessions.map(s =>
            s.id === sessionId ? { ...s, participants: [...s.participants, participant] } : s
          ),
        }))
      },

      updateParticipant: (sessionId, participantId, data) => {
        set(state => ({
          sessions: state.sessions.map(s =>
            s.id === sessionId
              ? { ...s, participants: s.participants.map(p => p.id === participantId ? { ...p, ...data } : p) }
              : s
          ),
        }))
      },

      removeParticipant: (sessionId, participantId) => {
        set(state => ({
          sessions: state.sessions.map(s =>
            s.id === sessionId
              ? { ...s, participants: s.participants.filter(p => p.id !== participantId) }
              : s
          ),
        }))
      },

      moveParticipant: (fromSessionId, toSessionId, participantId) => {
        const state = get()
        const fromSession = state.sessions.find(s => s.id === fromSessionId)
        const participant = fromSession?.participants.find(p => p.id === participantId)
        if (!participant) return
        const movedParticipant: Participant = {
          ...participant,
          registeredAt: new Date().toISOString(),
          reservationExpiresAt: participant.status === 'réservé'
            ? addHours(new Date(), state.sessions.find(s => s.id === toSessionId)?.reservationHoldHours ?? 24).toISOString()
            : undefined,
        }
        set(s => ({
          sessions: s.sessions.map(session => {
            if (session.id === fromSessionId) return { ...session, participants: session.participants.filter(p => p.id !== participantId) }
            if (session.id === toSessionId) return { ...session, participants: [...session.participants, movedParticipant] }
            return session
          }),
        }))
      },

      reserveSpot: (sessionId, participantId) => {
        const session = get().sessions.find(s => s.id === sessionId)
        if (!session) return
        const expiresAt = addHours(new Date(), session.reservationHoldHours).toISOString()
        set(state => ({
          sessions: state.sessions.map(s =>
            s.id === sessionId
              ? { ...s, participants: s.participants.map(p => p.id === participantId ? { ...p, status: 'réservé', reservationExpiresAt: expiresAt } : p) }
              : s
          ),
        }))
      },

      confirmParticipant: (sessionId, participantId) => {
        set(state => ({
          sessions: state.sessions.map(s =>
            s.id === sessionId
              ? { ...s, participants: s.participants.map(p => p.id === participantId ? { ...p, status: 'confirmé', reservationExpiresAt: undefined } : p) }
              : s
          ),
        }))
      },

      releaseExpiredReservations: () => {
        const now = new Date()
        set(state => ({
          sessions: state.sessions.map(s => ({
            ...s,
            participants: s.participants.filter(p => {
              if (p.status !== 'réservé' || !p.reservationExpiresAt) return true
              return new Date(p.reservationExpiresAt) > now
            }),
          })),
        }))
      },
    }),
    { name: 'fabic-sessions-v3' }
  )
)

// ─── Helpers ────────────────────────────────────────────────────────────────

function s(
  type: TrainingType,
  start: string,
  end: string,
  max?: number,
  title?: string,
  weekend?: boolean,
): Session {
  const label: Record<TrainingType, string> = {
    cuisine: 'Formation Cuisine CPF',
    boulangerie: 'Formation Boulangerie CPF',
    patisserie: 'Formation Pâtisserie CPF',
    'sans-gluten': 'Formation Sans Gluten CPF',
    chocolat: 'Formation Chocolat CPF',
    glace: 'Formation Glace CPF',
    snacking: 'Formation Snacking CPF',
    'cuisine-2': 'Formation Cuisine Niveau 2 CPF',
    'patisserie-2': 'Formation Pâtisserie Niveau 2 CPF',
  }
  return {
    id: uuidv4(),
    type,
    title: title ?? (weekend ? label[type] + ' (Week-end)' : label[type]),
    startDate: `${start}T09:00:00.000Z`,
    endDate: `${end}T17:00:00.000Z`,
    maxParticipants: max ?? DEFAULT_MAX_PARTICIPANTS[type],
    reservationHoldHours: 336,
    participants: [],
    location: 'Lafabic · Montpellier',
    description: 'Formation financée CPF',
    createdAt: new Date().toISOString(),
  }
}

function getSeedData(): Session[] {
  const we = (type: TrainingType, start: string, end: string) =>
    s(type, start, end, undefined, `${({
      cuisine: 'Formation Cuisine CPF',
      patisserie: 'Formation Pâtisserie CPF',
    } as Record<string, string>)[type]} (Week-end)`, true)

  return [
    // ── CUISINE CPF ──────────────────────────────────────────────────────────
    s('cuisine', '2026-04-07', '2026-04-11'),
    s('cuisine', '2026-05-18', '2026-05-22'),
    s('cuisine', '2026-06-15', '2026-06-19'),
    we('cuisine', '2026-07-17', '2026-07-27'),
    s('cuisine', '2026-08-10', '2026-08-14'),
    we('cuisine', '2026-09-04', '2026-09-13'),
    s('cuisine', '2026-09-28', '2026-10-02'),
    s('cuisine', '2026-11-02', '2026-11-06'),
    s('cuisine', '2026-12-07', '2026-12-11'),
    s('cuisine', '2027-01-11', '2027-01-15'),
    s('cuisine', '2027-02-01', '2027-02-05'),
    we('cuisine', '2027-02-19', '2027-02-28'),
    s('cuisine', '2027-03-01', '2027-03-05'),
    s('cuisine', '2027-03-30', '2027-04-03'),
    we('cuisine', '2027-04-16', '2027-04-25'),
    s('cuisine', '2027-04-26', '2027-04-30'),
    s('cuisine', '2027-05-31', '2027-06-04'),
    we('cuisine', '2027-06-18', '2027-06-27'),

    // ── PÂTISSERIE CPF ───────────────────────────────────────────────────────
    s('patisserie', '2025-12-14', '2025-12-18'),
    s('patisserie', '2026-04-20', '2026-04-24'),
    we('patisserie', '2026-05-01', '2026-05-10'),
    s('patisserie', '2026-06-01', '2026-06-05'),
    s('patisserie', '2026-07-06', '2026-07-10'),
    s('patisserie', '2026-08-03', '2026-08-07'),
    s('patisserie', '2026-10-05', '2026-10-09'),
    s('patisserie', '2026-11-16', '2026-11-20'),
    s('patisserie', '2027-01-18', '2027-01-22'),
    s('patisserie', '2027-02-08', '2027-02-12'),
    s('patisserie', '2027-03-08', '2027-03-12'),
    we('patisserie', '2027-03-19', '2027-03-28'),
    s('patisserie', '2027-04-05', '2027-04-09'),
    s('patisserie', '2027-05-10', '2027-05-14'),
    we('patisserie', '2027-05-21', '2027-05-30'),
    s('patisserie', '2027-06-07', '2027-06-11'),

    // ── BOULANGERIE CPF ──────────────────────────────────────────────────────
    s('boulangerie', '2026-03-30', '2026-04-01'),
    s('boulangerie', '2026-04-27', '2026-04-29'),
    s('boulangerie', '2026-06-29', '2026-07-01'),
    s('boulangerie', '2026-07-27', '2026-07-29'),
    s('boulangerie', '2026-08-24', '2026-08-26'),
    s('boulangerie', '2026-09-15', '2026-09-17'),
    s('boulangerie', '2026-10-26', '2026-10-28'),
    s('boulangerie', '2026-11-30', '2026-12-02'),
    s('boulangerie', '2027-01-25', '2027-01-27'),
    s('boulangerie', '2027-02-22', '2027-02-24'),
    s('boulangerie', '2027-03-15', '2027-03-17'),
    s('boulangerie', '2027-04-19', '2027-04-21'),
    s('boulangerie', '2027-05-24', '2027-05-26'),
    s('boulangerie', '2027-06-21', '2027-06-23'),

    // ── GLACE CPF ────────────────────────────────────────────────────────────
    s('glace', '2026-04-13', '2026-04-16'),
    s('glace', '2026-04-23', '2026-04-26'),
    s('glace', '2026-05-07', '2026-05-10'),
    s('glace', '2026-07-06', '2026-07-09'),
    s('glace', '2026-08-17', '2026-08-20'),
    s('glace', '2026-10-27', '2026-10-30'),
    s('glace', '2026-11-26', '2026-11-29'),
    s('glace', '2027-02-15', '2027-02-18'),
    s('glace', '2027-04-05', '2027-04-08'),
    s('glace', '2027-07-05', '2027-07-08'),

    // ── CHOCOLAT CPF ─────────────────────────────────────────────────────────
    s('chocolat', '2026-04-01', '2026-04-03'),
    s('chocolat', '2026-05-06', '2026-05-08'),
    s('chocolat', '2026-11-23', '2026-11-25'),
    s('chocolat', '2027-03-15', '2027-03-17'),
    s('chocolat', '2027-04-12', '2027-04-14'),
    s('chocolat', '2027-05-18', '2027-05-20'),

    // ── SANS GLUTEN CPF ──────────────────────────────────────────────────────
    s('sans-gluten', '2026-05-27', '2026-05-29'),
    s('sans-gluten', '2026-07-20', '2026-07-22'),
    s('sans-gluten', '2026-09-21', '2026-09-23'),
    s('sans-gluten', '2026-11-23', '2026-11-25'),
    s('sans-gluten', '2027-02-15', '2027-02-17'),
    s('sans-gluten', '2027-03-22', '2027-03-24'),
    s('sans-gluten', '2027-05-03', '2027-05-05'),
    s('sans-gluten', '2027-06-14', '2027-06-16'),

    // ── SNACKING CPF ─────────────────────────────────────────────────────────
    s('snacking', '2026-07-23', '2026-07-24'),
    s('snacking', '2026-10-19', '2026-10-20'),
    s('snacking', '2026-12-03', '2026-12-04'),

    // ── CUISINE NIVEAU 2 CPF ─────────────────────────────────────────────────
    s('cuisine-2', '2026-03-23', '2026-03-27'),
    s('cuisine-2', '2026-04-13', '2026-04-17'),
    s('cuisine-2', '2026-11-09', '2026-11-13'),
    s('cuisine-2', '2027-04-12', '2027-04-16'),

    // ── PÂTISSERIE NIVEAU 2 CPF ──────────────────────────────────────────────
    s('patisserie-2', '2026-06-08', '2026-06-12'),
    s('patisserie-2', '2026-10-12', '2026-10-16'),
    s('patisserie-2', '2027-06-28', '2027-07-02'),
  ]
}
