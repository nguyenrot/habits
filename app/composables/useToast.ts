/**
 * Tiny global error/info toast — the same pill HabitTodayCard errors surface
 * through on the Today page, shared so manage-page mutations (archive /
 * unarchive / delete / reorder) get identical feedback instead of failing
 * silently. Pages render the pill themselves; state lives in useState so any
 * caller can show a message.
 */

let timer: ReturnType<typeof setTimeout> | undefined

export const useToast = () => {
  const message = useState<string>('toast-message', () => '')

  function show(msg: string) {
    message.value = msg
    clearTimeout(timer)
    timer = setTimeout(() => (message.value = ''), 2600)
  }

  return { message, show }
}

/** Human-readable message from an unknown thrown value. */
export function errMsg(e: unknown, fallback: string): string {
  return e instanceof Error && e.message ? e.message : fallback
}
