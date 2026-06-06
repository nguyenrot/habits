/** Curated Phosphor icon set for habits — keeps the bundle small and the
 * picker predictable. `icon` on a Habit stores one of these slugs. */
import {
  PhDrop,
  PhBarbell,
  PhBookOpen,
  PhFlowerLotus,
  PhCoffee,
  PhBed,
  PhBrain,
  PhHeartStraight,
  PhMoon,
  PhSun,
  PhPersonSimpleRun,
  PhLeaf,
  PhPencilSimple,
  PhMusicNotes,
  PhCode,
  PhWallet,
  PhCheckCircle,
} from '@phosphor-icons/vue'
import type { Component } from 'vue'

export const HABIT_ICONS: Record<string, Component> = {
  drop: PhDrop,
  barbell: PhBarbell,
  'book-open': PhBookOpen,
  'flower-lotus': PhFlowerLotus,
  coffee: PhCoffee,
  bed: PhBed,
  brain: PhBrain,
  heart: PhHeartStraight,
  moon: PhMoon,
  sun: PhSun,
  run: PhPersonSimpleRun,
  leaf: PhLeaf,
  pencil: PhPencilSimple,
  music: PhMusicNotes,
  code: PhCode,
  wallet: PhWallet,
}

export const ICON_SLUGS = Object.keys(HABIT_ICONS)

export function iconFor(slug: string): Component {
  return HABIT_ICONS[slug] ?? PhCheckCircle
}
