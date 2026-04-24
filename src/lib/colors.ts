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
    bg: 'bg-orange-500',
    text: 'text-orange-700',
    light: 'bg-orange-50',
    border: 'border-orange-300',
    hex: '#f97316',
    emoji: '🍳',
  },
  boulangerie: {
    label: 'Boulangerie',
    bg: 'bg-amber-500',
    text: 'text-amber-700',
    light: 'bg-amber-50',
    border: 'border-amber-300',
    hex: '#f59e0b',
    emoji: '🥖',
  },
  patisserie: {
    label: 'Pâtisserie',
    bg: 'bg-pink-500',
    text: 'text-pink-700',
    light: 'bg-pink-50',
    border: 'border-pink-300',
    hex: '#ec4899',
    emoji: '🎂',
  },
  'sans-gluten': {
    label: 'Sans Gluten',
    bg: 'bg-green-500',
    text: 'text-green-700',
    light: 'bg-green-50',
    border: 'border-green-300',
    hex: '#22c55e',
    emoji: '🌿',
  },
  chocolat: {
    label: 'Chocolat',
    bg: 'bg-stone-600',
    text: 'text-stone-700',
    light: 'bg-stone-50',
    border: 'border-stone-400',
    hex: '#78350f',
    emoji: '🍫',
  },
  glace: {
    label: 'Glace',
    bg: 'bg-sky-400',
    text: 'text-sky-700',
    light: 'bg-sky-50',
    border: 'border-sky-300',
    hex: '#38bdf8',
    emoji: '🍦',
  },
}

export const TRAINING_TYPES = Object.keys(TRAINING_CONFIG) as TrainingType[]
