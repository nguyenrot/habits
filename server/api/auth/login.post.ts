import { defineEventHandler, readBody, createError } from 'h3'
import { djLogin } from '~~/server/utils/api'
import { setSessionCookie } from '~~/server/utils/cookie'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ username?: string; password?: string }>(event)
  const username = (body?.username ?? '').trim().toLowerCase()
  const password = body?.password ?? ''

  if (!username || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Nhập đủ tài khoản và mật khẩu.' })
  }

  const res = await djLogin(username, password)
  setSessionCookie(event, res.token)
  return { ok: true }
})
