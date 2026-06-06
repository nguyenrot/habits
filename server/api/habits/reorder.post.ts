import { defineEventHandler, readBody } from 'h3'
import { djReorderHabits } from '~~/server/utils/api'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ order?: { id: string; sort_order: number }[] }>(event)
  return await djReorderHabits(event, body?.order ?? [])
})
