<script setup lang="ts">
import { PhPlus, PhArchive, PhArrowCounterClockwise, PhTrash } from '@phosphor-icons/vue'
import { gradientFor, type Habit } from '~/lib/habit'
import { errMsg } from '~/composables/useToast'

const api = useApi()
const { message: toast, show: showToast } = useToast()
const { data, refresh } = useAsyncData('manage', () => api.listHabits({ include_archived: '1' }))
const habits = computed(() => (data.value ?? []).filter((h) => !h.archived))
const archived = computed(() => (data.value ?? []).filter((h) => h.archived))
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
// Mutations must never fail silently — show the shared toast on error, keep
// the refresh() so the UI re-syncs with the server either way.
async function unarchive(h: Habit) {
  try {
    await api.unarchiveHabit(h.id)
  } catch (e) {
    showToast(errMsg(e, 'Không khôi phục được, thử lại.'))
  }
  await refresh()
}
async function removeArchived(h: Habit) {
  if (!confirm(`Xoá hẳn "${h.name}"?`)) return
  try {
    await api.deleteHabit(h.id)
  } catch (e) {
    showToast(errMsg(e, 'Không xoá được, thử lại.'))
  }
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
      v-if="habits.length"
      :habits="habits"
      @edit="openEdit"
      @changed="refresh"
      @error="showToast"
    />
    <div v-else class="glass px-6 py-12 text-center stack-in">
      <p class="font-semibold">Chưa có thói quen</p>
      <p class="t-ink-2 mt-1 text-[14px]">Tạo cái đầu tiên để bắt đầu.</p>
      <button class="btn btn-accent mx-auto mt-5" @click="openNew">Tạo thói quen</button>
    </div>

    <!-- archived -->
    <div v-if="archived.length" class="mt-7">
      <button class="t-ink-2 flex items-center gap-2 text-[13px] font-semibold" @click="showArchived = !showArchived">
        <PhArchive :size="16" /> Đã lưu trữ ({{ archived.length }})
      </button>
      <div v-if="showArchived" class="mt-3 flex flex-col gap-2">
        <div v-for="h in archived" :key="h.id" class="glass flex items-center gap-3 px-4 py-2.5 opacity-80">
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
