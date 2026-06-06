<script setup lang="ts">
import { PhFlame, PhChartLineUp, PhCalendarDots, PhListChecks, PhChartBar } from '@phosphor-icons/vue'
import { pct, type StatsResponse } from '~/lib/habit'

const { data } = await useFetch<{ session: unknown; stats: StatsResponse | null }>(
  '/api/bootstrap/insights',
  { key: 'bs-insights' },
)
if (!data.value?.session) {
  await navigateTo('/login', { replace: true })
}

const stats = computed(() => data.value?.stats ?? null)
const hasData = computed(() => !!stats.value && stats.value.habits.length > 0)
const heat = computed(() => (stats.value?.heatmap ?? []).map((c) => ({ date: c.date, ratio: c.ratio })))

useHead({ title: 'Thống kê — Habits' })
</script>

<template>
  <div>
    <h1 class="mb-4 mt-1 text-[22px] font-semibold tracking-tight">Thống kê</h1>

    <div v-if="hasData && stats" class="grid grid-cols-2 gap-3.5">
      <!-- current streak -->
      <div class="glass stack-in p-5">
        <div class="flex items-start justify-between">
          <span class="t-ink-2 text-[12px] font-semibold uppercase tracking-wide">Chuỗi hiện tại</span>
          <span class="flame"><PhFlame :size="18" weight="fill" /></span>
        </div>
        <p class="mono mt-3 text-[40px] font-semibold leading-none">
          {{ stats.overall.best_current_streak }}<span class="t-ink-2 text-[16px]"> ngày</span>
        </p>
        <p class="t-ink-2 mt-2 text-[13px]">Dài nhất · <span class="mono">{{ stats.overall.best_longest_streak }}</span> ngày</p>
      </div>

      <!-- 30-day rate -->
      <div class="glass stack-in p-5" style="animation-delay: 50ms">
        <span class="t-ink-2 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wide">
          <PhChartLineUp :size="15" /> Tỉ lệ 30 ngày
        </span>
        <p class="text-accent mono mt-3 text-[40px] font-semibold leading-none">
          {{ pct(stats.overall.completion_rate_30) }}
        </p>
        <p class="t-ink-2 mt-2 text-[13px]">{{ stats.overall.today_completed }}/{{ stats.overall.today_total }} hôm nay</p>
      </div>

      <!-- heatmap -->
      <div class="glass stack-in col-span-2 p-5" style="animation-delay: 100ms">
        <span class="t-ink-2 mb-3 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wide">
          <PhCalendarDots :size="15" /> 20 tuần gần đây
        </span>
        <HabitHeatmap :cells="heat" />
        <div class="t-ink-3 mt-3 flex items-center justify-end gap-1.5 text-[11px]">
          Ít
          <span class="lg" style="background: var(--track)" />
          <span class="lg" style="background: color-mix(in oklab, var(--accent) 34%, var(--track))" />
          <span class="lg" style="background: color-mix(in oklab, var(--accent) 58%, transparent)" />
          <span class="lg" style="background: color-mix(in oklab, var(--accent) 80%, transparent)" />
          <span class="lg" style="background: var(--accent)" />
          Nhiều
        </div>
      </div>

      <!-- per-habit -->
      <div class="glass stack-in col-span-2 p-5" style="animation-delay: 150ms">
        <span class="t-ink-2 mb-1 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wide">
          <PhListChecks :size="15" /> Theo từng thói quen
        </span>
        <div
          v-for="p in stats.habits"
          :key="p.id"
          class="border-hair flex items-center gap-3 border-t py-2.5 first:border-t-0"
        >
          <div class="flex w-[150px] min-w-0 items-center gap-2 text-[14px] font-medium">
            <HabitIcon :name="p.icon" :size="16" class="t-ink-2 shrink-0" />
            <span class="truncate">{{ p.name }}</span>
          </div>
          <div class="bg-track h-2 flex-1 overflow-hidden rounded-full">
            <span
              class="block h-full rounded-full"
              :style="{
                width: Math.round((p.completion_rate ?? 0) * 100) + '%',
                background: 'linear-gradient(90deg, var(--accent), #0fb6a6)',
                transition: 'width .6s cubic-bezier(.16,1,.3,1)',
              }"
            />
          </div>
          <div class="mono t-ink-2 w-[42px] text-right text-[13px]">{{ pct(p.completion_rate) }}</div>
        </div>
      </div>
    </div>

    <div v-else class="glass stack-in px-6 py-14 text-center">
      <PhChartBar :size="30" weight="duotone" class="text-accent mx-auto" />
      <p class="mt-3 font-semibold">Chưa có dữ liệu</p>
      <p class="t-ink-2 mt-1 text-[14px]">Tạo thói quen và check-in vài ngày để xem thống kê.</p>
    </div>
  </div>
</template>

<style scoped>
.flame {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  display: grid;
  place-items: center;
  color: #fff;
  background: linear-gradient(150deg, #ff9d3c, #ff5d5d);
}
.lg {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  display: inline-block;
}
</style>
