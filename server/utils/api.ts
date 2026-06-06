/**
 * Server-only Django API client. Reads the x106_session cookie off the H3
 * request and forwards it as a Bearer token to api.kynguyen.cc. All fetches
 * are no-cache — habit data is always per-user fresh. The Vue layer never
 * talks to Django directly; it goes through the /api/* Nitro routes.
 */
import type { H3Event } from 'h3'
import { getCookie, createError } from 'h3'
import type {
  ApiUser,
  AuthResponse,
  Habit,
  HabitLog,
  StatsResponse,
  TodayResponse,
} from '~~/app/lib/habit'

export const SESSION_COOKIE = 'x106_session'

function apiBase(): string {
  return useRuntimeConfig().apiBase
}

async function djangoFetch<T>(
  event: H3Event | null,
  path: string,
  init: { method?: string; body?: unknown; token?: string | null } = {},
): Promise<T> {
  const token = init.token ?? (event ? getCookie(event, SESSION_COOKIE) : undefined)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const url = `${apiBase()}${path}`
  try {
    return (await $fetch<T>(url, {
      method: (init.method ?? 'GET') as 'GET',
      headers,
      body: init.body as never,
      retry: 0,
    })) as T
  } catch (err: unknown) {
    const e = err as { status?: number; statusCode?: number; data?: unknown }
    const status = e.status ?? e.statusCode ?? 500
    let message = 'Request failed'
    if (e.data) {
      if (typeof e.data === 'string') {
        message = e.data
      } else if (typeof e.data === 'object') {
        const obj = e.data as { error?: string; detail?: string; message?: string }
        message = obj.error ?? obj.detail ?? obj.message ?? JSON.stringify(obj)
      }
    }
    throw createError({ statusCode: status, statusMessage: message, data: { message } })
  }
}

/* ── Auth ──────────────────────────────────────────────────── */

export function djLogin(username: string, password: string) {
  return djangoFetch<AuthResponse>(null, '/api/v1/auth/login', {
    method: 'POST',
    body: { username, password },
  })
}

export function djRegister(username: string, password: string) {
  return djangoFetch<AuthResponse>(null, '/api/v1/auth/register', {
    method: 'POST',
    body: { username, password },
  })
}

export function djLogout(event: H3Event) {
  return djangoFetch<{ message: string }>(event, '/api/v1/auth/logout', { method: 'POST' })
}

export function djGetMe(event: H3Event) {
  return djangoFetch<ApiUser>(event, '/api/v1/users/me')
}

export async function djGetSession(event: H3Event) {
  try {
    const me = await djGetMe(event)
    return me ? { userId: me.id, username: me.username } : null
  } catch {
    return null
  }
}

/* ── Habits ────────────────────────────────────────────────── */

function query(params: Record<string, string | undefined>): string {
  const sp = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v && String(v).trim()) sp.set(k, String(v).trim())
  }
  const q = sp.toString()
  return q ? `?${q}` : ''
}

export function djListHabits(
  event: H3Event,
  filters?: { include_archived?: string; category?: string; tag?: string },
) {
  return djangoFetch<Habit[]>(event, `/api/v1/habits${query(filters ?? {})}`)
}

export function djGetHabit(event: H3Event, id: string) {
  return djangoFetch<Habit>(event, `/api/v1/habits/${id}`)
}

export function djCreateHabit(event: H3Event, body: unknown) {
  return djangoFetch<Habit>(event, '/api/v1/habits', { method: 'POST', body })
}

export function djUpdateHabit(event: H3Event, id: string, body: unknown) {
  return djangoFetch<Habit>(event, `/api/v1/habits/${id}`, { method: 'PATCH', body })
}

export function djDeleteHabit(event: H3Event, id: string) {
  return djangoFetch<void>(event, `/api/v1/habits/${id}`, { method: 'DELETE' })
}

export function djArchiveHabit(event: H3Event, id: string) {
  return djangoFetch<Habit>(event, `/api/v1/habits/${id}/archive`, { method: 'POST' })
}

export function djUnarchiveHabit(event: H3Event, id: string) {
  return djangoFetch<Habit>(event, `/api/v1/habits/${id}/unarchive`, { method: 'POST' })
}

export function djReorderHabits(event: H3Event, order: { id: string; sort_order: number }[]) {
  return djangoFetch<{ updated: number }>(event, '/api/v1/habits/reorder', {
    method: 'POST',
    body: { order },
  })
}

export function djTodayHabits(event: H3Event) {
  return djangoFetch<TodayResponse>(event, '/api/v1/habits/today')
}

export function djHabitStats(event: H3Event) {
  return djangoFetch<StatsResponse>(event, '/api/v1/habits/stats')
}

/* ── Logs (check-ins) ──────────────────────────────────────── */

export function djListLogs(
  event: H3Event,
  filters?: { habit?: string; date_from?: string; date_to?: string },
) {
  return djangoFetch<HabitLog[]>(event, `/api/v1/habit-logs${query(filters ?? {})}`)
}

export function djUpsertLog(
  event: H3Event,
  body: { habit: string; date?: string; count?: number; note?: string | null },
) {
  return djangoFetch<HabitLog>(event, '/api/v1/habit-logs', { method: 'POST', body })
}

export function djDeleteLog(event: H3Event, id: string) {
  return djangoFetch<void>(event, `/api/v1/habit-logs/${id}`, { method: 'DELETE' })
}
