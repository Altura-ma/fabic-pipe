'use client'
import { useState } from 'react'
import { X } from 'lucide-react'
import { useSessionStore } from '@/store'
import type { Session, Participant, ParticipantFormData, ParticipantStatus } from '@/types'
import { TRAINING_CONFIG } from '@/lib/colors'
import { StatusBadge } from '@/components/ui/Badge'

interface Props {
  session: Session
  participant?: Participant | null
  onClose: () => void
}

const STATUS_OPTIONS: { value: ParticipantStatus; label: string; desc: string }[] = [
  { value: 'inscrit', label: 'Inscrit', desc: 'En attente de validation' },
  { value: 'réservé', label: 'Réservé', desc: 'Place temporairement réservée' },
  { value: 'confirmé', label: 'Confirmé', desc: 'Participation confirmée et payée' },
]

export function ParticipantModal({ session, participant, onClose }: Props) {
  const addParticipant = useSessionStore(s => s.addParticipant)
  const updateParticipant = useSessionStore(s => s.updateParticipant)

  const [form, setForm] = useState<ParticipantFormData>({
    firstName: participant?.firstName ?? '',
    lastName: participant?.lastName ?? '',
    email: participant?.email ?? '',
    phone: participant?.phone ?? '',
    status: participant?.status ?? 'inscrit',
    notes: participant?.notes ?? '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof ParticipantFormData, string>>>({})

  function validate(): boolean {
    const e: typeof errors = {}
    if (!form.firstName.trim()) e.firstName = 'Prénom requis'
    if (!form.lastName.trim()) e.lastName = 'Nom requis'
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = 'Email invalide'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    if (participant) {
      updateParticipant(session.id, participant.id, form)
    } else {
      addParticipant(session.id, form)
    }
    onClose()
  }

  const cfg = TRAINING_CONFIG[session.type]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className={`flex items-center justify-between p-5 border-b ${cfg.light} rounded-t-2xl`}>
          <div>
            <h2 className={`text-lg font-bold ${cfg.text}`}>
              {participant ? 'Modifier le participant' : 'Ajouter un participant'}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">{session.title}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-black/10 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Prénom *" error={errors.firstName}>
              <input
                type="text"
                value={form.firstName}
                onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                placeholder="Marie"
                className="input"
              />
            </Field>
            <Field label="Nom *" error={errors.lastName}>
              <input
                type="text"
                value={form.lastName}
                onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                placeholder="Dupont"
                className="input"
              />
            </Field>
          </div>

          <Field label="Email" error={errors.email}>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="marie.dupont@email.com"
              className="input"
            />
          </Field>

          <Field label="Téléphone">
            <input
              type="tel"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="06 12 34 56 78"
              className="input"
            />
          </Field>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
            <div className="space-y-2">
              {STATUS_OPTIONS.map(opt => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    form.status === opt.value ? 'border-gray-400 bg-gray-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value={opt.value}
                    checked={form.status === opt.value}
                    onChange={() => setForm(f => ({ ...f, status: opt.value }))}
                    className="sr-only"
                  />
                  <StatusBadge status={opt.value} />
                  <span className="text-sm text-gray-600">{opt.desc}</span>
                </label>
              ))}
            </div>
          </div>

          <Field label="Notes">
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={2}
              placeholder="Allergies, préférences alimentaires..."
              className="input resize-none"
            />
          </Field>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary">
              Annuler
            </button>
            <button type="submit" className="flex-1 btn-primary" style={{ backgroundColor: cfg.hex }}>
              {participant ? 'Enregistrer' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}
