/** Shared types + small constants for the habits frontend. */

export interface ApiUser {
  id: string
  username: string
}
export interface AuthResponse {
  user: ApiUser
  token: string
}

export type HabitType = 'binary' | 'count'
export type Frequency = 'daily' | 'weekly_days' | 'weekly_count'

export interface Habit {
  id: string
  user_id: string
  name: string
  icon: string
  color: string
  type: HabitType
  target_count: number | null
  unit: string
  frequency: Frequency
  weekdays: number[]
  weekly_target: number | null
  category: string
  tags: string[]
  reminder_enabled: boolean
  reminder_time: string | null
  sort_order: number
  archived: boolean
  archived_at: string | null
  created_at: string
  updated_at: string
}

export interface HabitLog {
  id: string
  habit_id: string
  user_id: string
  date: string
  count: number
  completed: boolean
  note: string | null
  created_at: string
  updated_at: string
}

export interface TodayItem {
  habit: Habit
  log: HabitLog | null
  done: boolean
  week: { count: number; target: number } | null
}
export interface TodayResponse {
  date: string
  items: TodayItem[]
}

export interface HabitStat {
  id: string
  name: string
  icon: string
  color: string
  type: HabitType
  frequency: Frequency
  current_streak: number
  longest_streak: number
  completion_rate: number | null
  total_completions: number
  week: { count: number; target: number } | null
}
export interface HeatCell {
  date: string
  total: number
  completed: number
  ratio: number
}
export interface StatsResponse {
  overall: {
    active_habits: number
    today_completed: number
    today_total: number
    best_current_streak: number
    best_longest_streak: number
    completion_rate_30: number | null
    total_completions: number
  }
  habits: HabitStat[]
  heatmap: HeatCell[]
}

/** Writable shape used by the create/edit form. */
export interface HabitInput {
  name: string
  icon: string
  color: string
  type: HabitType
  target_count: number | null
  unit: string
  frequency: Frequency
  weekdays: number[]
  weekly_target: number | null
  category: string
  tags: string[]
  reminder_enabled: boolean
  reminder_time: string | null
}

export function blankHabit(): HabitInput {
  return {
    name: '',
    icon: 'drop',
    color: 'green',
    type: 'binary',
    target_count: null,
    unit: '',
    frequency: 'daily',
    weekdays: [],
    weekly_target: null,
    category: '',
    tags: [],
    reminder_enabled: false,
    reminder_time: null,
  }
}

export function toInput(h: Habit): HabitInput {
  return {
    name: h.name,
    icon: h.icon || 'drop',
    color: h.color || 'green',
    type: h.type,
    target_count: h.target_count,
    unit: h.unit,
    frequency: h.frequency,
    weekdays: [...(h.weekdays || [])],
    weekly_target: h.weekly_target,
    category: h.category,
    tags: [...(h.tags || [])],
    reminder_enabled: h.reminder_enabled,
    reminder_time: h.reminder_time,
  }
}

// 0 = Monday … 6 = Sunday (matches Python date.weekday()).
export const WEEKDAYS = [
  { i: 0, short: 'T2' },
  { i: 1, short: 'T3' },
  { i: 2, short: 'T4' },
  { i: 3, short: 'T5' },
  { i: 4, short: 'T6' },
  { i: 5, short: 'T7' },
  { i: 6, short: 'CN' },
] as const

export interface ColorOption {
  key: string
  from: string
  to: string
}
export const COLOR_OPTIONS: ColorOption[] = [
  { key: 'green', from: '#34d399', to: '#0fb6a6' },
  { key: 'blue', from: '#3aa0ff', to: '#0f7bd6' },
  { key: 'violet', from: '#8b7bff', to: '#5b46e0' },
  { key: 'orange', from: '#ff9d3c', to: '#f5731f' },
  { key: 'rose', from: '#ff5d8f', to: '#e0356a' },
  { key: 'amber', from: '#f7c948', to: '#e0a000' },
  { key: 'teal', from: '#2dd4bf', to: '#0d9488' },
  { key: 'mocha', from: '#9a8478', to: '#6f5a4e' },
]

export function gradientFor(colorKey: string): string {
  const c = COLOR_OPTIONS.find((o) => o.key === colorKey) ?? COLOR_OPTIONS[0]!
  return `linear-gradient(150deg, ${c.from}, ${c.to})`
}

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  daily: 'Hằng ngày',
  weekly_days: 'Thứ cụ thể',
  weekly_count: 'Số lần mỗi tuần',
}

/** Human label for a habit's schedule, e.g. "Hằng ngày" or "T2 · T4 · T6". */
export function scheduleLabel(h: Habit | HabitInput): string {
  if (h.frequency === 'weekly_days') {
    if (!h.weekdays.length) return 'Chưa chọn ngày'
    return h.weekdays
      .slice()
      .sort((a, b) => a - b)
      .map((i) => WEEKDAYS[i]?.short ?? '')
      .join(' · ')
  }
  if (h.frequency === 'weekly_count') {
    return `${h.weekly_target ?? 0} lần / tuần`
  }
  return 'Hằng ngày'
}

export function pct(rate: number | null | undefined): string {
  if (rate == null) return '—'
  return `${Math.round(rate * 100)}%`
}
