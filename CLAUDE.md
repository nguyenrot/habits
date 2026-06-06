# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`habits.kynguyen.cc` — an auth-protected habit tracker, the 10th app in the X106 ecosystem (parent doc: `../CLAUDE.md`). **Nuxt 4 + Vue 3 + Tailwind v4**, SSR + Nitro, port **3009**, PM2 process `habits-pkn`, VPS path `/var/www/habits`, repo `nguyenrot/habits`.

The **backend is NOT in this repo** — it's the Django app `apps/habits` inside `nguyenrot/x106-api`, served from the shared `api.kynguyen.cc`. Endpoints: `/api/v1/habits` (CRUD + `today`/`stats`/`reorder`/`{id}/archive`) and `/api/v1/habit-logs` (list + upsert check-in + delete). Auth = the shared `x106_session` JWT cookie.

## Commands

```bash
TMPDIR=/tmp npm run dev   # dev server on port 3009 (TMPDIR=/tmp avoids the macOS
                          # unix-socket path-length bug in vite-node)
npm run build             # production build (.output/) — what deploy runs
npm run preview           # preview the build
npm run typecheck         # vue-tsc
```

No test suite (frontend convention across the ecosystem).

## Architecture

Auth-protected. Pages: `/` (Today), `/manage`, `/insights`, `/habit/[id]`, plus public `/login`. All SSR-rendered by Nitro.

- **Design — Apple "Liquid Glass"**: translucent frosted panels (`backdrop-filter` + 1px inner border + inset specular highlight), an ambient drifting mesh-gradient backdrop the glass refracts, floating capsule nav/tab-bar, concentric radii. Adaptive light/dark via the `.dark` class (cookie `kn:theme`, preboot script in `nuxt.config.ts`). Single accent = Apple system green. All glass/token CSS lives in `app/assets/css/main.css` (`@theme` + `.glass*` classes); re-theming = edit tokens there. Icons via `@phosphor-icons/vue`; charts are hand-rolled SVG (no chart lib).
- **No client→Django calls.** The Vue layer hits `/api/*` Nitro routes; `server/utils/api.ts` forwards the `x106_session` cookie as a Bearer token to `api.kynguyen.cc`. Cookie helpers in `server/utils/cookie.ts` (httpOnly, `domain=.kynguyen.cc` in prod).
- **One fetch per page**: `server/api/bootstrap/{today,manage,insights,habit}.get.ts` aggregate upstream calls; pages `useFetch` them and `refresh()`/local-mutate after writes.
- **Auth gate**: `app/middleware/auth.global.ts` (SSR reads the cookie header; client trusts the SSR decision).
- **Types + constants**: `app/lib/habit.ts` (Habit/HabitLog/Stats types, colors, weekday labels, helpers). Curated icon map: `app/lib/icons.ts`.

```
app/
  app.vue                         # <NuxtLayout><NuxtPage/></NuxtLayout>
  assets/css/main.css             # Tailwind v4 + Liquid Glass tokens/classes
  middleware/auth.global.ts       # cookie gate
  composables/{useApi,usePrefs}.ts
  lib/{habit,icons}.ts
  layouts/default.vue             # GlassNav + TabBar + slot
  components/                     # GlassNav, TabBar, ThemeToggle, CompletionRing,
                                  # HabitIcon, HabitTodayCard, HabitEditor, HabitList,
                                  # HabitHeatmap, LoginForm
  pages/                          # index, manage, insights, habit/[id], login
server/
  utils/{api,cookie}.ts
  api/auth/{login,register,logout}.post.ts
  api/bootstrap/{today,manage,insights,habit}.get.ts
  api/habits/{index.post,[id].patch,[id].delete,reorder.post,[id]/archive.post,[id]/unarchive.post}.ts
  api/logs/{index.post,[id].delete}.ts
```

## Deploy

`git push` to `main` → `.github/workflows/deploy.yml`: Node 22, `npm install` + `npm run build` (env `NUXT_API_BASE=https://api.kynguyen.cc`), tar `.output/` + `deploy.sh` → SCP `/tmp/habits-deploy.tar.gz` → VPS extract into `/var/www/habits`, recreate PM2 `habits-pkn` on port 3009, curl `/login` local + public. ~90–180s. Re-trigger/rollback: `cd /Users/kynguyenpham/X106 && ./deploy.sh habits [ref]`.

## Verification cleanup (mandatory)

After verifying with chrome-devtools-mcp or a local `npm run dev`: close every chrome-devtools page you opened, `pkill -f nuxt` if you started dev, and delete throwaway screenshots.
