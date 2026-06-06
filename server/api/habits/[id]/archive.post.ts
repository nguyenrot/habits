import { defineEventHandler, getRouterParam } from 'h3'
import { djArchiveHabit } from '~~/server/utils/api'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') as string
  return await djArchiveHabit(event, id)
})
