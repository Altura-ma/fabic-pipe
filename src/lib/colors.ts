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
}

export const TRAINING_TYPES = Object.keys(TRAINING_CONFIG) as TrainingType[]
