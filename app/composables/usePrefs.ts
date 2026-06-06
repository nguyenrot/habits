/** Theme preference (light / dark / system) stored in the kn:theme cookie and
 * applied as the `.dark` class on <html>. The preboot script in nuxt.config
 * sets the initial class before hydration to avoid a flash. */

export type ThemePref = 'light' | 'dark' | 'system'

export const usePrefs = () => {
  const theme = useCookie<ThemePref>('kn:theme', {
    default: () => 'system',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
  })

  function isDark(): boolean {
    if (theme.value === 'dark') return true
    if (theme.value === 'light') return false
    return import.meta.client && window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  function apply() {
    if (import.meta.client) {
      document.documentElement.classList.toggle('dark', isDark())
    }
  }

  /** Flip to the explicit opposite of whatever is showing now. */
  function toggle() {
    const dark = import.meta.client
      ? document.documentElement.classList.contains('dark')
      : isDark()
    theme.value = dark ? 'light' : 'dark'
    apply()
  }

  return { theme, isDark, apply, toggle }
}
