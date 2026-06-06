/**
 * Client-side wrappers around the Nitro /api/* routes (which proxy Django and
 * forward the httpOnly x106_session cookie). Browser-only; same-origin cookies
 * ride along automatically.
 */
import type { Habit, HabitLog, HabitInput } from '~/lib/habit'

export interface LoginPayload {
  username: string
  password: string
}

export const useApi = () => ({
  login: (body: LoginPayload) => $fetch<{ ok: true }>('/api/auth/login', { method: 'POST', body }),
  register: (body: LoginPayload) =>
    $fetch<{ ok: true }>('/api/auth/register', { method: 'POST', body }),
  logout: () => $fetch<{ ok: true }>('/api/auth/logout', { method: 'POST' }),

  createHabit: (body: HabitInput) => $fetch<Habit>('/api/habits', { method: 'POST', body }),
  updateHabit: (id: string, body: Partial<HabitInput>) =>
    $fetch<Habit>(`/api/habits/${id}`, { method: 'PATCH', body }),
  deleteHabit: (id: string) => $fetch<{ ok: true }>(`/api/habits/${id}`, { method: 'DELETE' }),
  archiveHabit: (id: string) => $fetch<Habit>(`/api/habits/${id}/archive`, { method: 'POST' }),
  unarchiveHabit: (id: string) =>
    $fetch<Habit>(`/api/habits/${id}/unarchive`, { method: 'POST' }),
  reorder: (order: { id: string; sort_order: number }[]) =>
    $fetch<{ updated: number }>('/api/habits/reorder', { method: 'POST', body: { order } }),

  upsertLog: (body: { habit: string; date?: string; count?: number; note?: string | null }) =>
    $fetch<HabitLog>('/api/logs', { method: 'POST', body }),
  deleteLog: (id: string) => $fetch<{ ok: true }>(`/api/logs/${id}`, { method: 'DELETE' }),
})
