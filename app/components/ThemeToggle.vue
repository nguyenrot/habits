<script setup lang="ts">
import { PhMoon, PhSun } from '@phosphor-icons/vue'

const { toggle } = usePrefs()
const dark = ref(false)

onMounted(() => {
  dark.value = document.documentElement.classList.contains('dark')
})

function onClick() {
  toggle()
  dark.value = document.documentElement.classList.contains('dark')
}
</script>

<template>
  <button class="icon-btn tap" aria-label="Đổi giao diện sáng/tối" @click="onClick">
    <ClientOnly>
      <PhSun v-if="dark" :size="18" />
      <PhMoon v-else :size="18" />
      <template #fallback><PhMoon :size="18" /></template>
    </ClientOnly>
  </button>
</template>
