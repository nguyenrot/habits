<script setup lang="ts">
import { iconFor } from '~/lib/icons'

const props = withDefaults(
  defineProps<{ name: string; size?: number; weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone' }>(),
  { size: 22, weight: 'regular' },
)
const comp = computed(() => iconFor(props.name))
</script>

<template>
  <component :is="comp" :size="size" :weight="weight" />
</template>
