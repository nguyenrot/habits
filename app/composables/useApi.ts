/**
 * Direct client to the shared X106 API (api.kynguyen.cc), authenticated with the
 * opaque Bearer token from useToken. No cookies, no Nitro proxy — SPA talks to
 * Django directly (CORS-allowed origin). On 401 the token is cleared so app.vue
 * falls back to the TokenGate.
 */
import type { Habit, HabitInput, HabitLog, StatsResponse, TodayResponse } from '~/lib/habit'

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

function pickMsg(p: unknown): string {
  if (!p || typeof p !== 'object') return ''
  const o = p as Record<string, unknown>
  for (const k of ['detail', 'error', 'message'] as const) {
    if (typeof o[k] === 'string') return o[k] as string
  }
  for (const v of Object.values(o)) {
    if (typeof v === 'string') return v
    if (Array.isArray(v) && typeof v[0] === 'string') return v[0] as string
  }
  return ''
}

export const useApi = () => {
  const config = useRuntimeConfig()
  const { token, clearToken } = useToken()
  const base = config.public.apiBase as string

  async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((init.headers as Record<string, string>) || {}),
    }
    // An explicit Authorization header (e.g. validating a candidate token at
    // login, before committing it to state) wins over the stored token.
    if (!headers['Authorization'] && token.value) headers['Authorization'] = `Bearer ${token.value}`

    const res = await fetch(`${base}${path}`, { ...init, headers })
    if (!res.ok) {
      const body = await res.text()
      let msg = body
      try {
        msg = pickMsg(JSON.parse(body)) || body
      } catch {
        // body wasn't JSON
      }
      if (res.status === 401) clearToken()
      throw new ApiError(res.status, msg || `HTTP ${res.status}`)
    }
    if (res.status === 204) return undefined as unknown as T
    return (await res.json()) as T
  }

  const qs = (params: Record<string, string | undefined>) => {
    const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
    return entries.length ? '?' + new URLSearchParams(entries as [string, string][]).toString() : ''
  }

  return {
    // accounts (shared with ledger)
    createAccount: (raw: string) =>
      apiFetch<{ id: string; created_at: string }>('/api/v1/habits/accounts', {
        method: 'POST',
        body: JSON.stringify({ token: raw }),
      }),
    /** Pass `explicitToken` to verify a candidate token WITHOUT it being in
     * state yet (login flow validates first, commits via setToken on success). */
    me: (explicitToken?: string) =>
      apiFetch<{ id: string; created_at: string }>(
        '/api/v1/habits/me',
        explicitToken ? { headers: { Authorization: `Bearer ${explicitToken}` } } : {},
      ),

    // habits
    listHabits: (params: { include_archived?: string; category?: string; tag?: string } = {}) =>
      apiFetch<Habit[]>(`/api/v1/habits${qs(params)}`),
    getHabit: (id: string) => apiFetch<Habit>(`/api/v1/habits/${id}`),
    createHabit: (body: HabitInput) =>
      apiFetch<Habit>('/api/v1/habits', { method: 'POST', body: JSON.stringify(body) }),
    updateHabit: (id: string, body: Partial<HabitInput>) =>
      apiFetch<Habit>(`/api/v1/habits/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    deleteHabit: (id: string) => apiFetch<void>(`/api/v1/habits/${id}`, { method: 'DELETE' }),
    archiveHabit: (id: string) =>
      apiFetch<Habit>(`/api/v1/habits/${id}/archive`, { method: 'POST' }),
    unarchiveHabit: (id: string) =>
      apiFetch<Habit>(`/api/v1/habits/${id}/unarchive`, { method: 'POST' }),
    reorder: (order: { id: string; sort_order: number }[]) =>
      apiFetch<{ updated: number }>('/api/v1/habits/reorder', {
        method: 'POST',
        body: JSON.stringify({ order }),
      }),
    today: () => apiFetch<TodayResponse>('/api/v1/habits/today'),
    stats: () => apiFetch<StatsResponse>('/api/v1/habits/stats'),

    // logs
    listLogs: (params: { habit?: string; date_from?: string; date_to?: string } = {}) =>
      apiFetch<HabitLog[]>(`/api/v1/habit-logs${qs(params)}`),
    upsertLog: (body: { habit: string; date?: string; count?: number; note?: string | null }) =>
      apiFetch<HabitLog>('/api/v1/habit-logs', { method: 'POST', body: JSON.stringify(body) }),
    deleteLog: (id: string) => apiFetch<void>(`/api/v1/habit-logs/${id}`, { method: 'DELETE' }),
  }
}
