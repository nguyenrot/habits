import { defineEventHandler, readBody, getRouterParam } from 'h3'
import { djUpdateHabit } from '~~/server/utils/api'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') as string
  const body = await readBody(event)
  return await djUpdateHabit(event, id, body)
})
