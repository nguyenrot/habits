<script setup lang="ts">
import { PhCheckCircle } from '@phosphor-icons/vue'

const dateStr = new Intl.DateTimeFormat('vi-VN', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  timeZone: 'Asia/Ho_Chi_Minh',
}).format(new Date())
</script>

<template>
  <header class="pill sticky top-4 z-30 mx-auto flex w-full items-center gap-3 py-2.5 pl-4 pr-2.5">
    <span
      class="grid h-7 w-7 place-items-center rounded-[9px] text-white"
      style="background: linear-gradient(150deg, var(--accent), #0fb6a6); box-shadow: inset 0 1px 0 rgba(255,255,255,.5)"
    >
      <PhCheckCircle :size="17" weight="fill" />
    </span>
    <span class="text-[16px] font-semibold tracking-tight">Habits</span>
    <span class="flex-1" />
    <ClientOnly>
      <span class="t-ink-2 hidden text-[13px] mono sm:inline">{{ dateStr }}</span>
    </ClientOnly>
    <ThemeToggle />
  </header>
</template>
