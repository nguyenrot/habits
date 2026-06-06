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

  try {
    const res = await djLogin(username, password)
    setSessionCookie(event, res.token)
    return { ok: true }
  } catch (err) {
    const e = err as { statusCode?: number; data?: { message?: string }; statusMessage?: string }
    const status = e?.statusCode ?? 0
    if (status === 400 || status === 401) {
      const msg = 'Sai tài khoản hoặc mật khẩu.'
      throw createError({ statusCode: 401, statusMessage: msg, data: { message: msg } })
    }
    throw err
  }
})
