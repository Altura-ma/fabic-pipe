'use client'
import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { TRAINING_CONFIG, TRAINING_TYPES } from '@/lib/colors'
import { useSessionStore } from '@/store'
import type { Session, SessionFormData, TrainingType } from '@/types'
import { format } from 'date-fns'

interface Props {
  session?: Session | null
  onClose: () => void
}

const HOLD_OPTIONS = [1, 2, 4, 8, 12, 24, 48, 72]

export function SessionModal({ session, onClose }: Props) {
  const addSession = useSessionStore(s => s.addSession)
  const updateSession = useSessionStore(s => s.updateSession)

  const toInputDate = (iso?: string) => iso ? format(new Date(iso), "yyyy-MM-dd'T'HH:mm") : ''

  const [form, setForm] = useState<SessionFormData>({
    type: session?.type ?? 'cuisine',
    title: session?.title ?? '',
    startDate: toInputDate(session?.startDate),
    endDate: toInputDate(session?.endDate),
    maxParticipants: session?.maxParticipants ?? 8,
    reservationHoldHours: session?.reservationHoldHours ?? 24,
    location: session?.location ?? '',
    description: session?.description ?? '',
  })

  const [errors, setErrors] = useState<Partial<Record<keyof SessionFormData, string>>>({})

  function validate(): boolean {
    const e: typeof errors = {}
    if (!form.title.trim()) e.title = 'Titre requis'
    if (!form.startDate) e.startDate = 'Date de début requise'
    if (!form.endDate) e.endDate = 'Date de fin requise'
    if (form.startDate && form.endDate && form.endDate <= form.startDate) {
      e.endDate = 'La fin doit être après le début'
    }
    if (form.maxParticipants < 1) e.maxParticipants = 'Min. 1 participant'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    const data: SessionFormData = {
      ...form,
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString(),
    }
    if (session) {
      updateSession(session.id, data)
    } else {
      addSession(data)
    }
    onClose()
  }

  const cfg = TRAINING_CONFIG[form.type]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className={`flex items-center justify-between p-5 border-b ${cfg.light} rounded-t-2xl`}>
          <h2 className={`text-lg font-bold ${cfg.text}`}>
            {session ? 'Modifier la session' : 'Nouvelle session'}
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-black/10 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type de formation</label>
            <div className="grid grid-cols-3 gap-2">
              {TRAINING_TYPES.map(t => {
                const c = TRAINING_CONFIG[t]
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, type: t }))}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      form.type === t
                        ? `${c.light} ${c.text} ${c.border} border-2`
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-xl">{c.emoji}</span>
                    <span>{c.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Title */}
          <Field label="Titre de la session" error={errors.title}>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="ex: Cuisine du Monde - Été 2025"
              className="input"
            />
          </Field>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Début" error={errors.startDate}>
              <input
                type="datetime-local"
                value={form.startDate}
                onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                className="input"
              />
            </Field>
            <Field label="Fin" error={errors.endDate}>
              <input
                type="datetime-local"
                value={form.endDate}
                onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                className="input"
              />
            </Field>
          </div>

          {/* Max participants + reservation hold */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Places max" error={errors.maxParticipants}>
              <input
                type="number"
                min={1}
                max={50}
                value={form.maxParticipants}
                onChange={e => setForm(f => ({ ...f, maxParticipants: parseInt(e.target.value) || 1 }))}
                className="input"
              />
            </Field>
            <Field label="Durée de réservation">
              <select
                value={form.reservationHoldHours}
                onChange={e => setForm(f => ({ ...f, reservationHoldHours: parseInt(e.target.value) }))}
                className="input"
              >
                {HOLD_OPTIONS.map(h => (
                  <option key={h} value={h}>{h < 24 ? `${h}h` : `${h / 24}j`}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* Location */}
          <Field label="Lieu">
            <input
              type="text"
              value={form.location}
              onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              placeholder="ex: Atelier Paris 11e"
              className="input"
            />
          </Field>

          {/* Description */}
          <Field label="Description">
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2}
              placeholder="Programme, matériel nécessaire..."
              className="input resize-none"
            />
          </Field>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary">
              Annuler
            </button>
            <button type="submit" className="flex-1 btn-primary" style={{ backgroundColor: cfg.hex }}>
              {session ? 'Enregistrer' : 'Créer la session'}
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
