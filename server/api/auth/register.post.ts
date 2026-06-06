import { defineEventHandler, readBody, createError } from 'h3'
import { djRegister } from '~~/server/utils/api'
import { setSessionCookie } from '~~/server/utils/cookie'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ username?: string; password?: string }>(event)
  const username = (body?.username ?? '').trim().toLowerCase()
  const password = body?.password ?? ''

  if (!username || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Nhập đủ tài khoản và mật khẩu.' })
  }
  if (username.length < 3) {
    throw createError({ statusCode: 400, statusMessage: 'Tài khoản cần ít nhất 3 ký tự.' })
  }
  if (password.length < 6) {
    throw createError({ statusCode: 400, statusMessage: 'Mật khẩu cần ít nhất 6 ký tự.' })
  }
  if (!/^[a-z0-9_]+$/.test(username)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Tài khoản chỉ gồm chữ thường, số và dấu gạch dưới.',
    })
  }

  try {
    const res = await djRegister(username, password)
    setSessionCookie(event, res.token)
    return { ok: true }
  } catch (err) {
    const e = err as { data?: { message?: string }; statusMessage?: string }
    const raw = (e?.data?.message || e?.statusMessage || '').toLowerCase()
    if (raw.includes('taken') || raw.includes('already') || raw.includes('exist')) {
      const msg = 'Tài khoản này đã được dùng. Chọn tên khác nhé.'
      throw createError({ statusCode: 409, statusMessage: msg, data: { message: msg } })
    }
    throw err
  }
})
