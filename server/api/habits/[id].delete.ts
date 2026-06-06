import { defineEventHandler, getRouterParam } from 'h3'
import { djDeleteHabit } from '~~/server/utils/api'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') as string
  await djDeleteHabit(event, id)
  return { ok: true }
})
