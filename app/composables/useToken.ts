/** localStorage-backed opaque token — same model as ledger. The token IS the
 * account; it's shared with ledger (one token works on both services), but each
 * origin keeps its own copy in localStorage (key below). */

const STORAGE_KEY = 'x106-habits-token'

export const useToken = () => {
  const token = useState<string | null>('habits-token', () => null)

  const hydrate = () => {
    if (import.meta.client && token.value === null) {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) token.value = raw
    }
  }

  const setToken = (raw: string | null) => {
    token.value = raw
    if (import.meta.client) {
      if (raw) window.localStorage.setItem(STORAGE_KEY, raw)
      else window.localStorage.removeItem(STORAGE_KEY)
    }
  }

  const clearToken = () => setToken(null)

  return { token, hydrate, setToken, clearToken }
}
