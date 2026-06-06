/**
 * Cookie-gated route guard. SSR reads the x106_session cookie off the request
 * headers; the client trusts the SSR decision (the cookie is httpOnly). The
 * Django API still validates the JWT on every request.
 */
export default defineNuxtRouteMiddleware((to) => {
  const isLoginPage = to.path === '/login'
  let hasSession = false

  if (import.meta.server) {
    const cookieHeader = useRequestHeaders(['cookie']).cookie || ''
    hasSession = /(?:^|;\s*)x106_session=/.test(cookieHeader)
  } else {
    hasSession = !isLoginPage
  }

  if (!hasSession && !isLoginPage) {
    return navigateTo('/login', { replace: true })
  }
  if (hasSession && isLoginPage) {
    return navigateTo('/', { replace: true })
  }
})
