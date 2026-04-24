export type TrainingType = 'cuisine' | 'boulangerie' | 'patisserie' | 'sans-gluten' | 'chocolat' | 'glace'

export type ParticipantStatus = 'inscrit' | 'réservé' | 'confirmé'

export type KanbanColumn = 'ouvert' | 'presque-complet' | 'complet' | 'passé'

export interface Participant {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  status: ParticipantStatus
  registeredAt: string
  reservationExpiresAt?: string
  notes?: string
}

export interface Session {
  id: string
  type: TrainingType
  title: string
  startDate: string
  endDate: string
  maxParticipants: number
  reservationHoldHours: number
  participants: Participant[]
  location?: string
  description?: string
  createdAt: string
}

export interface SessionFormData {
  type: TrainingType
  title: string
  startDate: string
  endDate: string
  maxParticipants: number
  reservationHoldHours: number
  location?: string
  description?: string
}

export interface ParticipantFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  status: ParticipantStatus
  notes?: string
}
