import { defineEventHandler } from 'h3'
import { djGetSession, djTodayHabits } from '~~/server/utils/api'

export default defineEventHandler(async (event) => {
  const session = await djGetSession(event)
  if (!session) return { session: null }
  const today = await djTodayHabits(event).catch(() => ({ date: '', items: [] }))
  return { session, today }
})
