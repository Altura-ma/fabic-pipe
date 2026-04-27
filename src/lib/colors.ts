import type { TrainingType } from '@/types'

export const TRAINING_CONFIG: Record<TrainingType, {
  label: string
  bg: string
  text: string
  light: string
  border: string
  hex: string
  emoji: string
}> = {
  cuisine: {
    label: 'Cuisine',
    bg: 'bg-cyan-600',
    text: 'text-cyan-800',
    light: 'bg-cyan-50',
    border: 'border-cyan-300',
    hex: '#028090',
    emoji: '🍳',
  },
  boulangerie: {
    label: 'Boulangerie',
    bg: 'bg-red-700',
    text: 'text-red-800',
    light: 'bg-red-50',
    border: 'border-red-300',
    hex: '#B85042',
    emoji: '🥖',
  },
  patisserie: {
    label: 'Pâtisserie',
    bg: 'bg-rose-400',
    text: 'text-rose-600',
    light: 'bg-rose-50',
    border: 'border-rose-300',
    hex: '#F96167',
    emoji: '🎂',
  },
  'sans-gluten': {
    label: 'Sans Gluten',
    bg: 'bg-green-800',
    text: 'text-green-800',
    light: 'bg-green-50',
    border: 'border-green-300',
    hex: '#2C5F2D',
    emoji: '🌾',
  },
  chocolat: {
    label: 'Chocolat',
    bg: 'bg-purple-900',
    text: 'text-purple-900',
    light: 'bg-purple-50',
    border: 'border-purple-300',
    hex: '#6D2E46',
    emoji: '🍫',
  },
  glace: {
    label: 'Glace',
    bg: 'bg-sky-700',
    text: 'text-sky-800',
    light: 'bg-sky-50',
    border: 'border-sky-300',
    hex: '#1C7293',
    emoji: '🍦',
  },
  snacking: {
    label: 'Snacking',
    bg: 'bg-orange-500',
    text: 'text-orange-700',
    light: 'bg-orange-50',
    border: 'border-orange-300',
    hex: '#E45C3A',
    emoji: '🥪',
  },
  'cuisine-2': {
    label: 'Cuisine Niv.2',
    bg: 'bg-teal-800',
    text: 'text-teal-900',
    light: 'bg-teal-50',
    border: 'border-teal-400',
    hex: '#015F6B',
    emoji: '🍽️',
  },
  'patisserie-2': {
    label: 'Pâtisserie Niv.2',
    bg: 'bg-fuchsia-700',
    text: 'text-fuchsia-800',
    light: 'bg-fuchsia-50',
    border: 'border-fuchsia-300',
    hex: '#B83770',
    emoji: '🏆',
  },
}

export const TRAINING_TYPES = Object.keys(TRAINING_CONFIG) as TrainingType[]

export const DEFAULT_MAX_PARTICIPANTS: Record<TrainingType, number> = {
  cuisine:       10,
  'cuisine-2':   10,
  patisserie:    10,
  'patisserie-2':10,
  snacking:      10,
  boulangerie:    8,
  'sans-gluten':  8,
  glace:          6,
  chocolat:       6,
}
