import { defineEventHandler, readBody } from 'h3'
import { djCreateHabit } from '~~/server/utils/api'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  return await djCreateHabit(event, body)
})
