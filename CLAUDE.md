# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`habits.kynguyen.cc` — a habit tracker, the 10th app in the X106 ecosystem (parent doc: `../CLAUDE.md`). **Nuxt 4 + Vue 3 + Tailwind v4**, **SPA (`ssr: false`)**, port **3009**, PM2 process `habits-pkn`, VPS path `/var/www/habits`, repo `nguyenrot/habits`.

The **backend is NOT in this repo** — it's the Django app `apps/habits` inside `nguyenrot/x106-api`, served from the shared `api.kynguyen.cc`. Endpoints: `/api/v1/habits` (CRUD + `today`/`stats`/`reorder`/`{id}/archive`), `/api/v1/habit-logs` (list + upsert check-in + delete), plus `/api/v1/habits/accounts` (create) and `/api/v1/habits/me`.

## Auth — token, SHARED with ledger

**No username/password, no cookies, no JWT session.** Auth is the **ledger token model**: one opaque 10-char token per account, kept in `localStorage` (`x106-habits-token`), sent as `Authorization: Bearer`. The server stores only its SHA-256 hash. **The same token works on ledger AND habits** — the account is a `ledger.LedgerAccount` (table `ledger_accounts`); `apps/habits` re-exports `LedgerTokenAuthentication` and re-parents Habit/HabitLog onto `account_id` → `ledger_accounts`. Creating a token on `/habits/accounts` also seeds ledger's default categories, so the token is immediately usable on both. Losing the token = losing the account (no reset).

This deliberately replaced an earlier `x106_session` cookie setup — the shared-domain cookie made logout unreliable and bled sessions across apps. SPA + per-origin localStorage token fixes that.

## Commands

```bash
TMPDIR=/tmp npm run dev   # dev on port 3009 (TMPDIR=/tmp avoids the macOS
                          # unix-socket path-length bug in vite-node)
npm run build             # production build (.output/) — what deploy runs
npm run preview           # preview the build
npm run typecheck         # vue-tsc
```

No test suite (frontend convention). The backend has pytest in `x106-api` (`tests/test_habits.py`, incl. a shared-token-with-ledger test).

## Architecture

SPA. Pages: `/` (Today), `/manage`, `/insights`, `/habit/[id]`. There is **no `/login` route** — `app/app.vue` gates on token presence and shows `TokenGate.vue` when there's no token.

- **Design — Apple "Liquid Glass"**: translucent frosted panels (`backdrop-filter` + 1px inner border + inset specular), an ambient drifting mesh-gradient backdrop, floating capsule nav/tab-bar, concentric radii. Adaptive light/dark via the `.dark` class (cookie `kn:theme` — theme only, not auth; preboot script in `nuxt.config.ts`). Single accent = Apple system green. All glass/token CSS lives in `app/assets/css/main.css` (`@theme` + `.glass*` classes). Icons via `@phosphor-icons/vue`; charts are hand-rolled SVG.
- **No Nitro proxy.** The SPA calls `api.kynguyen.cc` **directly** with the Bearer token. `app/composables/useApi.ts` is the fetch wrapper (adds `Authorization`, on 401 clears the token → app.vue falls back to TokenGate). `app/composables/useToken.ts` is the localStorage-backed token. There is **no `server/` directory**.
- **Data loading**: pages use `useAsyncData(key, () => api.xxx())` (runs client-side in SPA) and `refresh()` / local mutation after writes.

```
app/
  app.vue                         # gates: TokenGate vs <NuxtLayout><NuxtPage/></NuxtLayout>
  assets/css/main.css             # Tailwind v4 + Liquid Glass tokens/classes
  composables/{useApi,useToken,usePrefs}.ts
  lib/{habit,icons}.ts
  layouts/default.vue             # GlassNav + TabBar + slot
  components/                     # TokenGate, GlassNav, TabBar, ThemeToggle, CompletionRing,
                                  # HabitIcon, HabitTodayCard, HabitEditor, HabitList, HabitHeatmap
  pages/                          # index, manage, insights, habit/[id]
```

## Deploy

`git push` to `main` → `.github/workflows/deploy.yml`: Node 22, `npm install` + `npm run build`, tar `.output/` + `deploy.sh` → SCP `/tmp/habits-deploy.tar.gz` → VPS extract into `/var/www/habits`, recreate PM2 `habits-pkn` on port 3009 (serves the SPA via `node .output/server/index.mjs`), curl `/` local + public. ~90–180s. Re-trigger/rollback: `cd /Users/kynguyenpham/X106 && ./deploy.sh habits [ref]`.

## Verification cleanup (mandatory)

After verifying with chrome-devtools-mcp or a local `TMPDIR=/tmp npm run dev`: close every chrome-devtools page you opened, `pkill -f nuxt` if you started dev, and delete throwaway screenshots.
