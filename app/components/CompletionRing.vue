<script setup lang="ts">
const props = withDefaults(
  defineProps<{ value: number; size?: number; stroke?: number }>(),
  { size: 128, stroke: 12 },
)
const r = computed(() => (props.size - props.stroke) / 2)
const c = computed(() => props.size / 2)
const circ = computed(() => 2 * Math.PI * r.value)
const off = computed(() => circ.value * (1 - Math.max(0, Math.min(1, props.value || 0))))
</script>

<template>
  <div class="relative shrink-0" :style="{ width: size + 'px', height: size + 'px' }">
    <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`" class="-rotate-90">
      <circle :cx="c" :cy="c" :r="r" fill="none" stroke="var(--track)" :stroke-width="stroke" />
      <circle
        :cx="c"
        :cy="c"
        :r="r"
        fill="none"
        stroke="var(--accent)"
        :stroke-width="stroke"
        stroke-linecap="round"
        :stroke-dasharray="circ"
        :stroke-dashoffset="off"
        style="transition: stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1)"
      />
    </svg>
    <div class="absolute inset-0 grid place-content-center text-center">
      <slot />
    </div>
  </div>
</template>
