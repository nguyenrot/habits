import { defineEventHandler } from 'h3'
import { djGetSession, djListHabits } from '~~/server/utils/api'
import type { Habit } from '~~/app/lib/habit'

export default defineEventHandler(async (event) => {
  const session = await djGetSession(event)
  if (!session) return { session: null }
  const all = await djListHabits(event, { include_archived: '1' }).catch(() => [] as Habit[])
  return {
    session,
    habits: all.filter((h) => !h.archived),
    archived: all.filter((h) => h.archived),
  }
})
