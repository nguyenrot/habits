import { defineEventHandler, getQuery } from 'h3'
import { djGetHabit, djGetSession, djListLogs } from '~~/server/utils/api'
import type { Habit, HabitLog } from '~~/app/lib/habit'

function vnDate(d: Date): string {
  return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' })
}

export default defineEventHandler(async (event) => {
  const session = await djGetSession(event)
  if (!session) return { session: null }

  const id = String(getQuery(event).id || '')
  if (!id) return { session, habit: null as Habit | null, logs: [] as HabitLog[] }

  const to = new Date()
  const from = new Date(to)
  from.setDate(from.getDate() - 364)

  const [habit, logs] = await Promise.all([
    djGetHabit(event, id).catch(() => null),
    djListLogs(event, { habit: id, date_from: vnDate(from), date_to: vnDate(to) }).catch(
      () => [] as HabitLog[],
    ),
  ])
  return { session, habit, logs }
})
