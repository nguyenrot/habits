<script setup lang="ts">
import { PhHouse, PhSquaresFour, PhChartBar } from '@phosphor-icons/vue'

const tabs = [
  { to: '/', label: 'Hôm nay', icon: PhHouse },
  { to: '/manage', label: 'Quản lý', icon: PhSquaresFour },
  { to: '/insights', label: 'Thống kê', icon: PhChartBar },
]
const route = useRoute()
const active = (to: string) => (to === '/' ? route.path === '/' : route.path.startsWith(to))
</script>

<template>
  <nav class="pill fixed bottom-5 left-1/2 z-40 flex -translate-x-1/2 gap-1 p-2">
    <NuxtLink
      v-for="t in tabs"
      :key="t.to"
      :to="t.to"
      class="tap flex flex-col items-center gap-0.5 rounded-full px-5 py-2 text-[11px] font-medium transition-colors"
      :class="active(t.to) ? 'bg-accent' : 't-ink-2'"
      :style="active(t.to) ? 'color: var(--on-accent)' : ''"
    >
      <component :is="t.icon" :size="21" :weight="active(t.to) ? 'fill' : 'regular'" />
      {{ t.label }}
    </NuxtLink>
  </nav>
</template>
