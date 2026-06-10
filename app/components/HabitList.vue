<script setup lang="ts">
import { PhPencilSimple, PhArchive, PhTrash, PhCaretUp, PhCaretDown } from '@phosphor-icons/vue'
import { gradientFor, scheduleLabel, type Habit } from '~/lib/habit'

import { errMsg } from '~/composables/useToast'

const props = defineProps<{ habits: Habit[] }>()
const emit = defineEmits<{ (e: 'edit', h: Habit): void; (e: 'changed'): void; (e: 'error', msg: string): void }>()
const api = useApi()

const list = ref<Habit[]>([...props.habits])
watch(
  () => props.habits,
  (h) => (list.value = [...h]),
)

// Mutations must never fail silently: on error, surface a toast via the parent
// (same mechanism as HabitTodayCard) and still emit 'changed' so the parent's
// refresh() re-syncs the list with the server (rolling back optimistic moves).
async function move(idx: number, dir: -1 | 1) {
  const j = idx + dir
  if (j < 0 || j >= list.value.length) return
  const arr = list.value
  ;[arr[idx], arr[j]] = [arr[j]!, arr[idx]!]
  try {
    await api.reorder(arr.map((h, i) => ({ id: h.id, sort_order: i })))
  } catch (e) {
    emit('error', errMsg(e, 'Không sắp xếp được, thử lại.'))
  }
  emit('changed')
}

async function archive(h: Habit) {
  try {
    await api.archiveHabit(h.id)
  } catch (e) {
    emit('error', errMsg(e, 'Không lưu trữ được, thử lại.'))
  }
  emit('changed')
}

async function remove(h: Habit) {
  if (!confirm(`Xoá "${h.name}"? Mọi lượt check-in của nó cũng bị xoá.`)) return
  try {
    await api.deleteHabit(h.id)
  } catch (e) {
    emit('error', errMsg(e, 'Không xoá được, thử lại.'))
  }
  emit('changed')
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <div v-for="(h, idx) in list" :key="h.id" class="glass flex items-center gap-3.5 px-4 py-3">
      <NuxtLink :to="`/habit/${h.id}`" class="flex min-w-0 flex-1 items-center gap-3.5">
        <span class="chip" :style="{ background: gradientFor(h.color) }">
          <HabitIcon :name="h.icon" :size="20" class="text-white" />
        </span>
        <div class="min-w-0">
          <p class="truncate font-semibold tracking-tight">{{ h.name }}</p>
          <p class="t-ink-2 text-[12.5px]">
            {{ scheduleLabel(h) }}<template v-if="h.type === 'count'"> · {{ h.target_count }}{{ h.unit ? ' ' + h.unit : '' }}</template>
          </p>
        </div>
      </NuxtLink>
      <div class="flex items-center">
        <button class="mini tap" :disabled="idx === 0" aria-label="Lên" @click="move(idx, -1)"><PhCaretUp :size="16" /></button>
        <button class="mini tap" :disabled="idx === list.length - 1" aria-label="Xuống" @click="move(idx, 1)"><PhCaretDown :size="16" /></button>
        <button class="mini tap" aria-label="Sửa" @click="emit('edit', h)"><PhPencilSimple :size="17" /></button>
        <button class="mini tap" aria-label="Lưu trữ" @click="archive(h)"><PhArchive :size="17" /></button>
        <button class="mini tap" aria-label="Xoá" @click="remove(h)"><PhTrash :size="17" /></button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chip {
  width: 42px;
  height: 42px;
  border-radius: 13px;
  display: grid;
  place-items: center;
  color: #fff;
  flex: none;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4), inset 0 -8px 14px rgba(0, 0, 0, 0.12);
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
.mini:disabled {
  opacity: 0.3;
}
.mini:hover {
  background: var(--glass-bg-2);
  color: var(--ink);
}
</style>
