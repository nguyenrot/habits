<script setup lang="ts">
import { PhCheck, PhPlus, PhMinus } from '@phosphor-icons/vue'
import { gradientFor } from '~/lib/habit'
import type { TodayItem } from '~/lib/habit'

const props = defineProps<{ item: TodayItem }>()
const emit = defineEmits<{ (e: 'update', done: boolean): void; (e: 'error', msg: string): void }>()
const api = useApi()

const h = computed(() => props.item.habit)
const isCount = computed(() => h.value.type === 'count')
const target = computed(() => h.value.target_count ?? 1)

const count = ref(props.item.log?.count ?? 0)
const done = ref(props.item.done)
const logId = ref<string | null>(props.item.log?.id ?? null)
const busy = ref(false)

const subline = computed(() => {
  if (isCount.value) return `${count.value} / ${target.value}${h.value.unit ? ' ' + h.value.unit : ''}`
  if (props.item.week) return `Tuần này ${props.item.week.count}/${props.item.week.target}`
  if (done.value) return 'Hoàn thành'
  return h.value.category || 'Hôm nay'
})

function msgOf(e: unknown): string {
  const x = e as { data?: { message?: string }; statusMessage?: string }
  return x?.data?.message || x?.statusMessage || 'Lỗi lưu, thử lại.'
}

async function setCount(n: number) {
  const clamped = Math.max(0, Math.min(999, n))
  const prevCount = count.value
  const prevDone = done.value
  count.value = clamped
  done.value = clamped >= target.value
  emit('update', done.value)
  busy.value = true
  try {
    const res = await api.upsertLog({ habit: h.value.id, count: clamped })
    logId.value = res.id
    count.value = res.count
    done.value = res.completed
    emit('update', res.completed)
  } catch (e) {
    count.value = prevCount
    done.value = prevDone
    emit('update', prevDone)
    emit('error', msgOf(e))
  } finally {
    busy.value = false
  }
}

async function toggle() {
  if (busy.value) return
  if (isCount.value) return setCount(done.value ? 0 : target.value)
  const next = !done.value
  done.value = next
  emit('update', next)
  busy.value = true
  try {
    if (next) {
      const res = await api.upsertLog({ habit: h.value.id })
      logId.value = res.id
      count.value = res.count
    } else if (logId.value) {
      await api.deleteLog(logId.value)
      logId.value = null
      count.value = 0
    }
  } catch (e) {
    done.value = !next
    emit('update', !next)
    emit('error', msgOf(e))
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="habit glass tap flex items-center gap-4 px-4 py-3.5">
    <span class="chip" :style="{ background: gradientFor(h.color) }">
      <HabitIcon :name="h.icon" :size="22" class="text-white" />
    </span>

    <div class="min-w-0 flex-1">
      <p class="truncate font-semibold tracking-tight" :class="{ 't-ink-2': done && !isCount }">
        {{ h.name }}
      </p>
      <p class="t-ink-2 text-[13px]">{{ subline }}</p>
    </div>

    <div v-if="isCount" class="bg-track flex items-center gap-2 rounded-full p-1">
      <button class="step tap" aria-label="Giảm" @click="setCount(count - 1)"><PhMinus :size="15" /></button>
      <span class="mono min-w-[40px] text-center text-[13px]">{{ count }}</span>
      <button class="step tap" aria-label="Tăng" @click="setCount(count + 1)"><PhPlus :size="15" /></button>
    </div>

    <button class="check tap" :class="{ on: done }" :aria-label="done ? 'Bỏ đánh dấu' : 'Hoàn thành'" @click="toggle">
      <PhCheck :size="22" weight="bold" />
    </button>
  </div>
</template>

<style scoped>
.chip {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  color: #fff;
  flex: none;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4), inset 0 -8px 14px rgba(0, 0, 0, 0.12);
}
.check {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  border: 2px solid var(--track);
  color: transparent;
  flex: none;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
}
.check.on {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--on-accent);
  box-shadow: 0 8px 20px -6px color-mix(in oklab, var(--accent) 60%, transparent),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
}
.step {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  display: grid;
  place-items: center;
  background: var(--glass-bg);
  color: var(--ink);
  cursor: pointer;
  box-shadow: inset 0 1px 0 var(--glass-spec);
}
</style>
