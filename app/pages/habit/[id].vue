<script setup lang="ts">
import { PhCaretLeft, PhPencilSimple } from '@phosphor-icons/vue'
import { gradientFor, scheduleLabel, type Habit, type HabitLog } from '~/lib/habit'

const route = useRoute()
const id = route.params.id as string

const { data, refresh } = await useFetch<{ session: unknown; habit: Habit | null; logs: HabitLog[] }>(
  '/api/bootstrap/habit',
  { key: `bs-habit-${id}`, query: { id } },
)
if (!data.value?.session) {
  await navigateTo('/login', { replace: true })
}

const habit = computed(() => data.value?.habit ?? null)
const logs = computed(() => data.value?.logs ?? [])

const editorOpen = ref(false)
async function onSaved() {
  editorOpen.value = false
  await refresh()
}

function vnDate(d: Date): string {
  return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' })
}

const completedSet = computed(() => new Set(logs.value.filter((l) => l.completed).map((l) => l.date)))

const cells = computed(() => {
  const out: { date: string; ratio: number }[] = []
  const today = new Date()
  for (let i = 370; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const ds = vnDate(d)
    out.push({ date: ds, ratio: completedSet.value.has(ds) ? 1 : 0 })
  }
  return out
})

const totalAll = computed(() => completedSet.value.size)
const thisYear = computed(() => {
  const y = new Date().getFullYear().toString()
  return [...completedSet.value].filter((d) => d.startsWith(y)).length
})

useHead({ title: () => (habit.value ? `${habit.value.name} — Habits` : 'Habits') })
</script>

<template>
  <div>
    <NuxtLink to="/manage" class="t-ink-2 mb-3 inline-flex items-center gap-1 text-[14px]">
      <PhCaretLeft :size="16" /> Quản lý
    </NuxtLink>

    <template v-if="habit">
      <section class="glass stack-in flex items-center gap-4 px-5 py-5">
        <span class="chip" :style="{ background: gradientFor(habit.color) }">
          <HabitIcon :name="habit.icon" :size="26" class="text-white" />
        </span>
        <div class="min-w-0 flex-1">
          <h1 class="truncate text-[20px] font-semibold tracking-tight">{{ habit.name }}</h1>
          <p class="t-ink-2 text-[13px]">
            {{ scheduleLabel(habit) }}<template v-if="habit.type === 'count'"> · {{ habit.target_count }}{{ habit.unit ? ' ' + habit.unit : '' }}</template>
          </p>
        </div>
        <button class="icon-btn tap" aria-label="Sửa" @click="editorOpen = true"><PhPencilSimple :size="18" /></button>
      </section>

      <div class="mt-3.5 grid grid-cols-2 gap-3.5">
        <div class="glass p-5">
          <span class="t-ink-2 text-[12px] font-semibold uppercase tracking-wide">Năm nay</span>
          <p class="mono mt-2 text-[34px] font-semibold leading-none">{{ thisYear }}</p>
        </div>
        <div class="glass p-5">
          <span class="t-ink-2 text-[12px] font-semibold uppercase tracking-wide">Tổng cộng</span>
          <p class="mono mt-2 text-[34px] font-semibold leading-none">{{ totalAll }}</p>
        </div>
      </div>

      <div class="glass mt-3.5 p-5">
        <span class="t-ink-2 mb-3 block text-[12px] font-semibold uppercase tracking-wide">12 tháng qua</span>
        <HabitHeatmap :cells="cells" />
      </div>

      <HabitEditor :open="editorOpen" :habit="habit" @close="editorOpen = false" @saved="onSaved" />
    </template>

    <div v-else class="glass px-6 py-14 text-center">
      <p class="font-semibold">Không tìm thấy thói quen</p>
      <NuxtLink to="/manage" class="btn btn-soft mx-auto mt-4">Về Quản lý</NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.chip {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  color: #fff;
  flex: none;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4), inset 0 -8px 14px rgba(0, 0, 0, 0.12);
}
</style>
