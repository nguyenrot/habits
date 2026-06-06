<script setup lang="ts">
import { PhPlus, PhArchive, PhArrowCounterClockwise, PhTrash } from '@phosphor-icons/vue'
import { gradientFor, type Habit } from '~/lib/habit'

const { data, refresh } = await useFetch<{ session: unknown; habits: Habit[]; archived: Habit[] }>(
  '/api/bootstrap/manage',
  { key: 'bs-manage' },
)
if (!data.value?.session) {
  await navigateTo('/login', { replace: true })
}

const api = useApi()
const editorOpen = ref(false)
const editing = ref<Habit | null>(null)
const showArchived = ref(false)

function openNew() {
  editing.value = null
  editorOpen.value = true
}
function openEdit(h: Habit) {
  editing.value = h
  editorOpen.value = true
}
async function onSaved() {
  editorOpen.value = false
  await refresh()
}
async function unarchive(h: Habit) {
  await api.unarchiveHabit(h.id).catch(() => {})
  await refresh()
}
async function removeArchived(h: Habit) {
  if (!confirm(`Xoá hẳn "${h.name}"?`)) return
  await api.deleteHabit(h.id).catch(() => {})
  await refresh()
}

useHead({ title: 'Quản lý — Habits' })
</script>

<template>
  <div>
    <div class="mb-4 mt-1 flex items-center justify-between">
      <h1 class="text-[22px] font-semibold tracking-tight">Quản lý</h1>
      <button class="btn btn-accent !h-10 !px-4" @click="openNew"><PhPlus :size="18" weight="bold" /> Tạo</button>
    </div>

    <HabitList
      v-if="data?.habits?.length"
      :habits="data.habits"
      @edit="openEdit"
      @changed="refresh"
    />
    <div v-else class="glass px-6 py-12 text-center stack-in">
      <p class="font-semibold">Chưa có thói quen</p>
      <p class="t-ink-2 mt-1 text-[14px]">Tạo cái đầu tiên để bắt đầu.</p>
      <button class="btn btn-accent mx-auto mt-5" @click="openNew">Tạo thói quen</button>
    </div>

    <!-- archived -->
    <div v-if="data?.archived?.length" class="mt-7">
      <button class="t-ink-2 flex items-center gap-2 text-[13px] font-semibold" @click="showArchived = !showArchived">
        <PhArchive :size="16" /> Đã lưu trữ ({{ data.archived.length }})
      </button>
      <div v-if="showArchived" class="mt-3 flex flex-col gap-2">
        <div v-for="h in data.archived" :key="h.id" class="glass flex items-center gap-3 px-4 py-2.5 opacity-80">
          <span class="ar-chip" :style="{ background: gradientFor(h.color) }">
            <HabitIcon :name="h.icon" :size="16" class="text-white" />
          </span>
          <span class="flex-1 truncate text-[14px]">{{ h.name }}</span>
          <button class="mini tap" aria-label="Khôi phục" @click="unarchive(h)"><PhArrowCounterClockwise :size="16" /></button>
          <button class="mini tap" aria-label="Xoá" @click="removeArchived(h)"><PhTrash :size="16" /></button>
        </div>
      </div>
    </div>

    <HabitEditor :open="editorOpen" :habit="editing" @close="editorOpen = false" @saved="onSaved" />
  </div>
</template>

<style scoped>
.ar-chip {
  width: 30px;
  height: 30px;
  border-radius: 9px;
  display: grid;
  place-items: center;
  color: #fff;
  flex: none;
}
.mini {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  display: grid;
  place-items: center;
  color: var(--ink-2);
  background: transparent;
}
.mini:hover {
  background: var(--glass-bg-2);
  color: var(--ink);
}
</style>
