import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import { addHours } from 'date-fns'
import type { Session, SessionFormData, Participant, ParticipantFormData } from '@/types'

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
              ? {
                  ...s,
                  participants: s.participants.map(p =>
                    p.id === participantId ? { ...p, ...data } : p
                  ),
                }
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
            if (session.id === fromSessionId) {
              return { ...session, participants: session.participants.filter(p => p.id !== participantId) }
            }
            if (session.id === toSessionId) {
              return { ...session, participants: [...session.participants, movedParticipant] }
            }
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
              ? {
                  ...s,
                  participants: s.participants.map(p =>
                    p.id === participantId
                      ? { ...p, status: 'réservé', reservationExpiresAt: expiresAt }
                      : p
                  ),
                }
              : s
          ),
        }))
      },

      confirmParticipant: (sessionId, participantId) => {
        set(state => ({
          sessions: state.sessions.map(s =>
            s.id === sessionId
              ? {
                  ...s,
                  participants: s.participants.map(p =>
                    p.id === participantId
                      ? { ...p, status: 'confirmé', reservationExpiresAt: undefined }
                      : p
                  ),
                }
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
    { name: 'fabic-sessions' }
  )
)

function getSeedData(): Session[] {
  const now = new Date()
  const d = (offsetDays: number, hour = 9, endHour = 17) => {
    const start = new Date(now)
    start.setDate(start.getDate() + offsetDays)
    start.setHours(hour, 0, 0, 0)
    const end = new Date(start)
    end.setHours(endHour, 0, 0, 0)
    return { start: start.toISOString(), end: end.toISOString() }
  }

  return [
    {
      id: 'seed-1',
      type: 'cuisine',
      title: 'Cuisine du Monde',
      startDate: d(3).start,
      endDate: d(3).end,
      maxParticipants: 8,
      reservationHoldHours: 24,
      location: 'Atelier Paris 11e',
      description: 'Découverte des cuisines asiatiques et méditerranéennes',
      participants: [
        { id: 'p1', firstName: 'Marie', lastName: 'Dupont', email: 'marie@example.com', phone: '06 12 34 56 78', status: 'confirmé', registeredAt: new Date().toISOString() },
        { id: 'p2', firstName: 'Paul', lastName: 'Martin', email: 'paul@example.com', phone: '06 23 45 67 89', status: 'inscrit', registeredAt: new Date().toISOString() },
        { id: 'p3', firstName: 'Lucie', lastName: 'Bernard', email: 'lucie@example.com', phone: '06 34 56 78 90', status: 'réservé', registeredAt: new Date().toISOString(), reservationExpiresAt: addHours(now, 6).toISOString() },
      ],
      createdAt: now.toISOString(),
    },
    {
      id: 'seed-2',
      type: 'boulangerie',
      title: 'Pain Artisanal',
      startDate: d(5).start,
      endDate: d(5).end,
      maxParticipants: 6,
      reservationHoldHours: 48,
      location: 'Atelier Lyon Centre',
      description: 'Pains au levain, baguettes tradition et pains spéciaux',
      participants: [
        { id: 'p4', firstName: 'Sophie', lastName: 'Leroy', email: 'sophie@example.com', phone: '06 45 67 89 01', status: 'confirmé', registeredAt: new Date().toISOString() },
        { id: 'p5', firstName: 'Julien', lastName: 'Petit', email: 'julien@example.com', phone: '06 56 78 90 12', status: 'confirmé', registeredAt: new Date().toISOString() },
        { id: 'p6', firstName: 'Emma', lastName: 'Moreau', email: 'emma@example.com', phone: '06 67 89 01 23', status: 'réservé', registeredAt: new Date().toISOString(), reservationExpiresAt: addHours(now, 2).toISOString() },
        { id: 'p7', firstName: 'Lucas', lastName: 'Simon', email: 'lucas@example.com', phone: '06 78 90 12 34', status: 'inscrit', registeredAt: new Date().toISOString() },
        { id: 'p8', firstName: 'Camille', lastName: 'Laurent', email: 'camille@example.com', phone: '06 89 01 23 45', status: 'inscrit', registeredAt: new Date().toISOString() },
      ],
      createdAt: now.toISOString(),
    },
    {
      id: 'seed-3',
      type: 'patisserie',
      title: 'Tartes & Entremets',
      startDate: d(7).start,
      endDate: d(7).end,
      maxParticipants: 8,
      reservationHoldHours: 24,
      location: 'Atelier Paris 11e',
      description: 'Maîtrisez les bases de la pâtisserie française classique',
      participants: [
        { id: 'p9', firstName: 'Chloé', lastName: 'Dubois', email: 'chloe@example.com', phone: '06 90 12 34 56', status: 'inscrit', registeredAt: new Date().toISOString() },
      ],
      createdAt: now.toISOString(),
    },
    {
      id: 'seed-4',
      type: 'chocolat',
      title: 'Art du Chocolat',
      startDate: d(10).start,
      endDate: d(10).end,
      maxParticipants: 6,
      reservationHoldHours: 24,
      location: 'Atelier Bordeaux',
      description: 'Ganaches, truffes et moulages en chocolat',
      participants: [
        { id: 'p10', firstName: 'Thomas', lastName: 'Richard', email: 'thomas@example.com', phone: '06 01 23 45 67', status: 'confirmé', registeredAt: new Date().toISOString() },
        { id: 'p11', firstName: 'Alice', lastName: 'Michel', email: 'alice@example.com', phone: '06 12 34 56 79', status: 'confirmé', registeredAt: new Date().toISOString() },
        { id: 'p12', firstName: 'Hugo', lastName: 'Garcia', email: 'hugo@example.com', phone: '06 23 45 67 80', status: 'confirmé', registeredAt: new Date().toISOString() },
        { id: 'p13', firstName: 'Inès', lastName: 'Martinez', email: 'ines@example.com', phone: '06 34 56 78 91', status: 'confirmé', registeredAt: new Date().toISOString() },
        { id: 'p14', firstName: 'Maxime', lastName: 'Lopez', email: 'maxime@example.com', phone: '06 45 67 89 02', status: 'confirmé', registeredAt: new Date().toISOString() },
        { id: 'p15', firstName: 'Léa', lastName: 'Gonzalez', email: 'lea@example.com', phone: '06 56 78 90 13', status: 'réservé', registeredAt: new Date().toISOString(), reservationExpiresAt: addHours(now, 3).toISOString() },
      ],
      createdAt: now.toISOString(),
    },
    {
      id: 'seed-5',
      type: 'glace',
      title: 'Glaces & Sorbets Maison',
      startDate: d(14).start,
      endDate: d(14).end,
      maxParticipants: 8,
      reservationHoldHours: 24,
      location: 'Atelier Nice',
      description: 'Créez vos glaces artisanales et sorbets de fruits',
      participants: [],
      createdAt: now.toISOString(),
    },
    {
      id: 'seed-6',
      type: 'sans-gluten',
      title: 'Cuisine Sans Gluten',
      startDate: d(2).start,
      endDate: d(2).end,
      maxParticipants: 6,
      reservationHoldHours: 24,
      location: 'Atelier Paris 11e',
      description: 'Alternatives saines et délicieuses sans gluten',
      participants: [
        { id: 'p16', firstName: 'Nora', lastName: 'Wilson', email: 'nora@example.com', phone: '06 67 89 01 24', status: 'confirmé', registeredAt: new Date().toISOString() },
        { id: 'p17', firstName: 'Pierre', lastName: 'Moore', email: 'pierre@example.com', phone: '06 78 90 12 35', status: 'confirmé', registeredAt: new Date().toISOString() },
        { id: 'p18', firstName: 'Manon', lastName: 'Taylor', email: 'manon@example.com', phone: '06 89 01 23 46', status: 'inscrit', registeredAt: new Date().toISOString() },
        { id: 'p19', firstName: 'Antoine', lastName: 'Thomas', email: 'antoine@example.com', phone: '06 90 12 34 57', status: 'réservé', registeredAt: new Date().toISOString(), reservationExpiresAt: addHours(now, 1).toISOString() },
        { id: 'p20', firstName: 'Zoé', lastName: 'Jackson', email: 'zoe@example.com', phone: '06 01 23 45 68', status: 'inscrit', registeredAt: new Date().toISOString() },
        { id: 'p21', firstName: 'Romain', lastName: 'White', email: 'romain@example.com', phone: '06 12 34 56 80', status: 'réservé', registeredAt: new Date().toISOString(), reservationExpiresAt: addHours(now, 4).toISOString() },
      ],
      createdAt: now.toISOString(),
    },
  ]
}

