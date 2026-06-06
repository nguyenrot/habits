import { defineEventHandler, readBody, createError } from 'h3'
import { djUpsertLog } from '~~/server/utils/api'

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    habit?: string
    date?: string
    count?: number
    note?: string | null
  }>(event)
  if (!body?.habit) {
    throw createError({ statusCode: 400, statusMessage: 'Thiếu habit.' })
  }
  return await djUpsertLog(event, {
    habit: body.habit,
    date: body.date,
    count: body.count,
    note: body.note ?? null,
  })
})
