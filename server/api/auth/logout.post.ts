import { defineEventHandler } from 'h3'
import { djLogout } from '~~/server/utils/api'
import { clearSessionCookie } from '~~/server/utils/cookie'

export default defineEventHandler(async (event) => {
  try {
    await djLogout(event)
  } catch {
    // ignore — clear cookie regardless
  }
  clearSessionCookie(event)
  return { ok: true }
})
