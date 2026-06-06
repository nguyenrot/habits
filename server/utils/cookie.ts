/**
 * Cookie helpers for the shared x106_session token. httpOnly, sameSite=lax,
 * secure in production, 30-day TTL, domain=.kynguyen.cc so the session is
 * shared across the ecosystem.
 */
import type { H3Event } from 'h3'
import { setCookie, deleteCookie } from 'h3'
import { SESSION_COOKIE } from './api'

function options() {
  const cfg = useRuntimeConfig()
  const isProd = process.env.NODE_ENV === 'production'
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
    domain: cfg.cookieDomain ? cfg.cookieDomain : undefined,
  }
}

export function setSessionCookie(event: H3Event, token: string) {
  setCookie(event, SESSION_COOKIE, token, options())
}

export function clearSessionCookie(event: H3Event) {
  const cfg = useRuntimeConfig()
  deleteCookie(event, SESSION_COOKIE, {
    path: '/',
    domain: cfg.cookieDomain ? cfg.cookieDomain : undefined,
  })
}
