import { defineEventHandler } from 'h3'
import { djGetSession, djHabitStats } from '~~/server/utils/api'

export default defineEventHandler(async (event) => {
  const session = await djGetSession(event)
  if (!session) return { session: null }
  const stats = await djHabitStats(event).catch(() => null)
  return { session, stats }
})
