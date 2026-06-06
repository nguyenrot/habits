import { defineEventHandler, getRouterParam } from 'h3'
import { djDeleteLog } from '~~/server/utils/api'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') as string
  await djDeleteLog(event, id)
  return { ok: true }
})
