<script setup lang="ts">
import { PhSparkle } from '@phosphor-icons/vue'
import type { TodayItem } from '~/lib/habit'

const api = useApi()
const { data } = useAsyncData('today', () => api.today())

const items = ref<TodayItem[]>([])
watchEffect(() => {
  items.value = data.value?.items ?? []
})
const doneCount = computed(() => items.value.filter((i) => i.done).length)
const total = computed(() => items.value.length)
const ratio = computed(() => (total.value ? doneCount.value / total.value : 0))
const remaining = computed(() => total.value - doneCount.value)

const toast = ref('')
let toastTimer: ReturnType<typeof setTimeout> | undefined
function onError(msg: string) {
  toast.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.value = ''), 2600)
}

// Compute the hour in Asia/Ho_Chi_Minh so SSR (server TZ may be UTC) and the
// client agree — otherwise the greeting causes a hydration mismatch.
const vnHour = Number(
  new Intl.DateTimeFormat('en-GB', {
    hour: 'numeric',
    hour12: false,
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(new Date()),
)
const greeting =
  vnHour < 11 ? 'Chào buổi sáng' : vnHour < 14 ? 'Chào buổi trưa' : vnHour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối'
const dateLabel = new Intl.DateTimeFormat('vi-VN', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  timeZone: 'Asia/Ho_Chi_Minh',
}).format(new Date())

useHead({ title: 'Hôm nay — Habits' })
</script>

<template>
  <div>
    <section class="glass stack-in flex items-center gap-6 px-6 py-6">
      <CompletionRing :value="ratio" :size="120">
        <b class="mono text-[28px] font-semibold leading-none">{{ doneCount }}/{{ total }}</b>
        <span class="t-ink-3 mt-1 text-[10px] uppercase tracking-wide">hôm nay</span>
      </CompletionRing>
      <div class="min-w-0">
        <h1 class="text-[22px] font-semibold tracking-tight">{{ greeting }}</h1>
        <p class="t-ink-2 mt-1 text-[14px]">
          <template v-if="!total">Chưa có thói quen nào cho hôm nay.</template>
          <template v-else-if="remaining === 0">Trọn ngày rồi — làm tốt lắm.</template>
          <template v-else>Còn {{ remaining }} thói quen là trọn ngày.</template>
        </p>
        <p class="t-ink-3 mt-2 text-[12px] capitalize">{{ dateLabel }}</p>
      </div>
    </section>

    <div v-if="total" class="mt-5 flex flex-col gap-3">
      <HabitTodayCard
        v-for="(it, idx) in items"
        :key="it.habit.id"
        :item="it"
        class="stack-in"
        :style="{ animationDelay: idx * 45 + 'ms' }"
        @update="(d) => (it.done = d)"
        @error="onError"
      />
    </div>

    <div v-else class="glass stack-in mt-5 px-6 py-12 text-center">
      <PhSparkle :size="30" weight="duotone" class="text-accent mx-auto" />
      <p class="mt-3 font-semibold">Bắt đầu xây thói quen</p>
      <p class="t-ink-2 mt-1 text-[14px]">Tạo thói quen đầu tiên ở tab Quản lý.</p>
      <NuxtLink to="/manage" class="btn btn-accent mx-auto mt-5 inline-flex">Tạo thói quen</NuxtLink>
    </div>

    <Transition name="toast">
      <div v-if="toast" class="pill fixed bottom-24 left-1/2 z-50 -translate-x-1/2 px-4 py-2 text-[13px]">
        {{ toast }}
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.25s, transform 0.25s;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 8px);
}
</style>
